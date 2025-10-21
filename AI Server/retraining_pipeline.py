import cv2
import math
import numpy as np
import json
from typing import List, Dict, Tuple

# ==========================================================
# GLOBAL THRESHOLDS (shared with Phase 2 detection)
# ==========================================================
TH = {
    "wire_ar_min": 3.5,
    "ecc_thr": 2.5,
    "circularity_thr": 0.6,
    "joint_extent_min": 0.3,
    "joint_circularity_min": 0.55,
    "wire_sk_norm_min": 0.25,
    "joint_sk_norm_max": 0.35,
    "max_wire_thickness_frac": 0.015,
    "wire_len_frac": 0.18,
    "full_wire_cov": 0.75,
    "point_max_frac": 0.25,
    "red_ratio_faulty": 0.45,
    "joint_area_frac_max": 0.025,
    "vote_margin": 1,
    "ignore_right_ratio": 0.05,
}

def update_thresholds(new_values, path="thresholds.json"):
    with open(path, "w") as f:
        json.dump(new_values, f, indent=2)

# ==========================================================
# Basic helpers (same as in Phase 3 Colab)
# ==========================================================
def recompute_severity(img_bgr: np.ndarray, bbox: Tuple[int, int, int, int]) -> float:
    hsv = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2HSV)
    v = hsv[:, :, 2]
    x, y, w, h = bbox
    x = max(0, min(x, v.shape[1] - 1))
    y = max(0, min(y, v.shape[0] - 1))
    w = max(1, min(w, v.shape[1] - x))
    h = max(1, min(h, v.shape[0] - y))
    roi_v = v[y:y + h, x:x + w]
    thr = int(np.percentile(roi_v, 85))
    hot = (roi_v >= thr).astype(np.uint8) * 255
    hot_mean = cv2.mean(roi_v, mask=hot)[0] if cv2.countNonZero(hot) else float(np.mean(roi_v))
    rim = cv2.dilate(hot, np.ones((11, 11), np.uint8), 1)
    bg = cv2.subtract(rim, hot)
    bg = np.where(bg > 0, 255, 0).astype(np.uint8)
    bg_mean = cv2.mean(roi_v, mask=bg)[0] if cv2.countNonZero(bg) else float(np.mean(roi_v))
    contrast = max(0.0, (hot_mean - bg_mean) / 255.0)
    area_norm = min(1.0, (w * h) / (img_bgr.shape[0] * img_bgr.shape[1] * 0.05))
    return float(round(min(1.0, 0.7 * contrast + 0.3 * area_norm), 4))


# ==========================================================
# AUTO-LABEL SUGGESTION (Phase 3 logic, threshold-based)
# ==========================================================
def suggest_label_for_bbox(img_bgr: np.ndarray, bbox: Tuple[int, int, int, int]):
    H, W = img_bgr.shape[:2]
    D = math.hypot(H, W)
    hsv = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2HSV)
    v = hsv[:, :, 2]

    mask_red = cv2.inRange(hsv, (0, 60, 180), (20, 255, 255))
    mask_yellow = cv2.inRange(hsv, (20, 60, 180), (40, 255, 255))
    mask_hot = cv2.bitwise_or(mask_red, mask_yellow)
    if TH["ignore_right_ratio"] > 0:
        cut = int(W * (1.0 - TH["ignore_right_ratio"]))
        for m in (mask_red, mask_yellow, mask_hot):
            m[:, cut:] = 0

    x, y, w, h = bbox
    comp = np.zeros((H, W), np.uint8)
    comp[y:y + h, x:x + w] = mask_hot[y:y + h, x:x + w]
    if cv2.countNonZero(comp) == 0:
        return "Loose Joint (Potential)", None, None

    cnts, _ = cv2.findContours(comp, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    mask_comp = np.zeros_like(comp)
    cv2.drawContours(mask_comp, cnts, -1, 255, -1)
    area_px = cv2.countNonZero(mask_comp)
    cnt = np.concatenate(cnts)
    area = cv2.contourArea(cnt)
    per = max(1.0, cv2.arcLength(cnt, True))
    rect = cv2.minAreaRect(cnt)
    rw, rh = rect[1]
    if rw < 1 or rh < 1:
        rw, rh = w, h
    ar_rect = (max(rw, rh) + 1e-6) / (min(rw, rh) + 1e-6)
    length = max(rw, rh)
    extent = area / float(max(1, w * h))
    circularity = 4 * np.pi * area / (per * per)

    # PCA eccentricity
    m = cv2.moments(cnt)
    m00 = m["m00"]
    if m00 == 0:
        ecc = 0
    else:
        mu20 = m["mu20"] / m00
        mu02 = m["mu02"] / m00
        mu11 = m["mu11"] / m00
        cov = np.array([[mu20, mu11], [mu11, mu02]], dtype=np.float32)
        eig, _ = np.linalg.eig(cov)
        l1, l2 = np.max(eig), np.min(eig)
        ecc = float(np.sqrt(l1 / l2)) if l2 > 1e-6 else 1e6

    sk = skeletonize_binary(mask_comp)
    sk_len = cv2.countNonZero(sk)
    thickness_est = area / float(max(1, sk_len))
    diag = math.hypot(w, h)
    sk_norm = sk_len / float(max(1, diag))
    thin = (thickness_est <= TH["max_wire_thickness_frac"] * min(H, W))
    long = (length >= TH["wire_len_frac"] * D)

    red_in = cv2.countNonZero(cv2.bitwise_and(mask_comp, mask_red))
    yel_in = cv2.countNonZero(cv2.bitwise_and(mask_comp, mask_yellow))
    hot_in = max(1, red_in + yel_in)
    red_ratio = red_in / hot_in

    # Voting logic
    wire_votes = sum([
        ar_rect >= TH["wire_ar_min"],
        ecc >= TH["ecc_thr"],
        circularity <= TH["circularity_thr"],
        extent <= TH["wire_extent_max"],
        sk_norm >= TH["wire_sk_norm_min"],
        thin,
        long
    ])
    joint_votes = sum([
        extent >= TH["joint_extent_min"],
        (thickness_est / float(max(1, length))) >= TH["joint_thick_len_min"],
        sk_norm <= TH["joint_sk_norm_max"],
        (area_px / (H * W)) <= TH["joint_area_frac_max"],
        circularity >= TH["joint_circularity_min"]
    ])

    # Decision
    if wire_votes - joint_votes >= TH["vote_margin"]:
        if red_ratio >= TH["red_ratio_faulty"]:
            return "Point Overload (Faulty)", None, dict(red_ratio=red_ratio)
        else:
            return "Point Overload (Potential)", None, dict(red_ratio=red_ratio)
    if joint_votes - wire_votes >= TH["vote_margin"]:
        if red_ratio >= TH["red_ratio_faulty"]:
            return "Loose Joint (Faulty)", None, dict(red_ratio=red_ratio)
        else:
            return "Loose Joint (Potential)", None, dict(red_ratio=red_ratio)
    return "Loose Joint (Potential)", None, dict(red_ratio=red_ratio)


def safe_quantile(arr, q, default):
    arr = [v for v in arr if v is not None and not np.isnan(v)]
    if len(arr) < 3:
        return default
    return float(np.quantile(arr, q))


# ==========================================================
# Feature Extraction
# ==========================================================
def skeletonize_binary(mask):
    skel = np.zeros_like(mask)
    elem = cv2.getStructuringElement(cv2.MORPH_CROSS, (3, 3))
    while True:
        open_mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, elem)
        temp = cv2.subtract(mask, open_mask)
        skel = cv2.bitwise_or(skel, temp)
        mask = cv2.erode(mask, elem)
        if cv2.countNonZero(mask) == 0:
            break
    return skel


def features_for_bbox(img_bgr: np.ndarray, bbox: Tuple[int, int, int, int]) -> Dict:
    x, y, w, h = bbox
    H, W = img_bgr.shape[:2]
    D = math.hypot(H, W)
    hsv = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2HSV)
    v = hsv[:, :, 2]
    mask_red = cv2.inRange(hsv, (0, 60, 180), (20, 255, 255))
    mask_yellow = cv2.inRange(hsv, (20, 60, 180), (40, 255, 255))
    mask_hot = cv2.bitwise_or(mask_red, mask_yellow)

    if TH["ignore_right_ratio"] > 0:
        cut = int(W * (1.0 - TH["ignore_right_ratio"]))
        for m in (mask_red, mask_yellow, mask_hot):
            m[:, cut:] = 0

    comp = np.zeros((H, W), np.uint8)
    comp[y:y + h, x:x + w] = mask_hot[y:y + h, x:x + w]
    if cv2.countNonZero(comp) == 0:
        return dict(ar_rect=None, ecc=None, circ=None, extent=None, sk_norm=None,
                    thickness_est=None, length=None, red_ratio=None, cov=None,
                    patch_frac=None, D=D, H=H, W=W)

    cnts, _ = cv2.findContours(comp, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    mask_comp = np.zeros_like(comp)
    cv2.drawContours(mask_comp, cnts, -1, 255, -1)
    area_px = cv2.countNonZero(mask_comp)
    cnt = np.concatenate(cnts)
    area = cv2.contourArea(cnt)
    per = max(1.0, cv2.arcLength(cnt, True))
    rect = cv2.minAreaRect(cnt)
    rw, rh = rect[1]
    if rw < 1 or rh < 1:
        rw, rh = w, h
    ar_rect = (max(rw, rh) + 1e-6) / (min(rw, rh) + 1e-6)
    length = max(rw, rh)
    extent = area / float(max(1, w * h))
    circularity = 4 * np.pi * area / (per * per)

    m = cv2.moments(cnt)
    m00 = m["m00"]
    if m00 > 0:
        mu20 = m["mu20"] / m00
        mu02 = m["mu02"] / m00
        mu11 = m["mu11"] / m00
        cov = np.array([[mu20, mu11], [mu11, mu02]], dtype=np.float32)
        eig, _ = np.linalg.eig(cov)
        l1, l2 = np.max(eig), np.min(eig)
        ecc = float(np.sqrt(l1 / l2)) if l2 > 1e-6 else 1e6
    else:
        ecc = None

    sk = skeletonize_binary(mask_comp)
    sk_len = cv2.countNonZero(sk)
    thickness_est = area / float(max(1, sk_len))
    diag = math.hypot(w, h)
    sk_norm = sk_len / float(max(1, diag))
    red_in = cv2.countNonZero(cv2.bitwise_and(mask_comp, mask_red))
    yel_in = cv2.countNonZero(cv2.bitwise_and(mask_comp, mask_yellow))
    hot_in = max(1, red_in + yel_in)
    red_ratio = red_in / hot_in

    comp_only = cv2.bitwise_and(mask_hot, mask_comp)
    sk_d = cv2.dilate((sk > 0).astype(np.uint8) * 255, np.ones((3, 3), np.uint8), 1)
    hot_on_sk = cv2.bitwise_and(comp_only, sk_d)
    cov = cv2.countNonZero(hot_on_sk) / float(max(1, cv2.countNonZero(sk))) if sk_len > 0 else None
    num, lbls, stats, _ = cv2.connectedComponentsWithStats((comp_only > 0).astype(np.uint8), 8)
    largest_area = 0
    for k in range(1, num):
        if stats[k, cv2.CC_STAT_AREA] > largest_area:
            largest_area = stats[k, cv2.CC_STAT_AREA]
    patch_frac = largest_area / float(max(1, area_px)) if area_px > 0 else None

    return dict(ar_rect=ar_rect, ecc=ecc, circ=circularity, extent=extent, sk_norm=sk_norm,
                thickness_est=thickness_est, length=length, red_ratio=red_ratio,
                cov=cov, patch_frac=patch_frac, D=D, H=H, W=W)


# ==========================================================
# MAIN: Apply Edits + Recalibrate Thresholds
# ==========================================================
def apply_feedback_and_recalibrate(
    img_bgr: np.ndarray,
    current_detections: List[Dict],
    edits: List[Dict]
) -> Dict:
    """
    img_bgr: original image (BGR)
    current_detections: list of detections with keys ["bbox", "label", "status"]
    edits: list of admin actions, each:
        {
          "bbox": [x,y,w,h],
          "label": "Loose Joint (Faulty)",
          "status": "added" | "edited" | "deleted"
        }
    Returns: Updated thresholds dictionary (TH)
    """
    global TH

    # --- 1. Apply edits to current detections ---
    work = [d.copy() for d in current_detections]

    for e in edits:
        status = e.get("status")
        if status == "deleted":
            # mark deleted
            for d in work:
                if tuple(d["bbox"]) == tuple(e["bbox"]):
                    d["status"] = "deleted"
        elif status == "edited":
            # update existing
            for d in work:
                if tuple(d["bbox"]) == tuple(e["old_bbox"]):
                    d["bbox"] = tuple(e["bbox"])
                    d["label"] = e.get("label", d["label"])
                    d["severity"] = recompute_severity(img_bgr, d["bbox"])
        elif status == "added":
            # new detection
            bbox = tuple(e["bbox"])
            new_d = {
                "bbox": bbox,
                "label": e["label"],
                "severity": recompute_severity(img_bgr, bbox),
                "status": "kept"
            }
            work.append(new_d)

    # --- 2. Perform recalibration ---
    wires_feats, joints_feats, faulty_red, potential_red = [], [], [], []
    kept = [d for d in work if d.get("status", "kept") != "deleted"]
    for d in kept:
        feats = features_for_bbox(img_bgr, d["bbox"])
        if feats["ar_rect"] is None:
            continue
        if "Overload" in d["label"]:
            wires_feats.append(feats)
        else:
            joints_feats.append(feats)
        if "Faulty" in d["label"]:
            faulty_red.append(feats["red_ratio"])
        else:
            potential_red.append(feats["red_ratio"])

    if len(wires_feats) >= 3:
        TH["wire_ar_min"] = safe_quantile([f["ar_rect"] for f in wires_feats], 0.25, TH["wire_ar_min"])
        TH["ecc_thr"] = safe_quantile([f["ecc"] for f in wires_feats], 0.25, TH["ecc_thr"])
        TH["circularity_thr"] = safe_quantile([f["circ"] for f in wires_feats], 0.75, TH["circularity_thr"])
        TH["wire_sk_norm_min"] = safe_quantile([f["sk_norm"] for f in wires_feats], 0.25, TH["wire_sk_norm_min"])
        t_over_hw = [f["thickness_est"]/max(1,min(f["H"],f["W"])) for f in wires_feats if f["thickness_est"] is not None]
        TH["max_wire_thickness_frac"] = safe_quantile(t_over_hw, 0.50, TH["max_wire_thickness_frac"])
        TH["wire_len_frac"] = safe_quantile([f["length"]/f["D"] for f in wires_feats if f["length"] is not None], 0.25, TH["wire_len_frac"])
        TH["full_wire_cov"] = safe_quantile([f["cov"] for f in wires_feats if f["cov"] is not None], 0.60, TH["full_wire_cov"])
        TH["point_max_frac"] = safe_quantile([f["patch_frac"] for f in wires_feats if f["patch_frac"] is not None], 0.35, TH["point_max_frac"])

    if len(joints_feats) >= 3:
        TH["joint_extent_min"] = safe_quantile([f["extent"] for f in joints_feats], 0.50, TH["joint_extent_min"])
        TH["joint_circularity_min"] = safe_quantile([f["circ"] for f in joints_feats], 0.50, TH["joint_circularity_min"])
        TH["joint_sk_norm_max"] = safe_quantile([f["sk_norm"] for f in joints_feats], 0.75, TH["joint_sk_norm_max"])
        TH["joint_area_frac_max"] = safe_quantile(
            [(d["bbox"][2]*d["bbox"][3]) / float(f["H"]*f["W"]) for d,f in zip([w for w in kept if "Loose Joint" in w["label"]], joints_feats)],
            0.75, TH["joint_area_frac_max"]
        )

    if faulty_red and potential_red:
        rr_faulty = float(np.median(faulty_red))
        rr_potential = float(np.median(potential_red))
        TH["red_ratio_faulty"] = max(0.20, min(0.80, 0.5 * (rr_faulty + rr_potential)))

    return TH


# ==========================================================
# OPTIONAL: Reclassification using updated thresholds
# ==========================================================
def reclassify_detections(img_bgr: np.ndarray, detections: List[Dict], suggest_label_func):
    """
    Re-run label suggestions for detections using updated thresholds.
    You can pass your existing `suggest_label_for_bbox` here.
    """
    updated = []
    for d in detections:
        if d.get("status", "kept") == "deleted":
            continue
        lbl, hotspot, _ = suggest_label_func(img_bgr, d["bbox"])
        d["suggested_label"] = lbl
        if hotspot is not None:
            d["hotspot_xy"] = hotspot
        updated.append(d)
    return updated
    