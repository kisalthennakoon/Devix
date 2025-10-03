# === Phase 2 · Automatic Anomaly Marking — vote-based wire vs joint (fixes mislabels) ===
# filesfrom google.colab import 
import cv2, numpy as np, matplotlib.pyplot as plt, os, math

# Skeletonize helper (skimage -> OpenCV thinning -> morph fallback)
def skeletonize_binary(bin_img):
    try:
        from skimage.morphology import skeletonize
        return (skeletonize((bin_img > 0).astype(np.uint8)).astype(np.uint8) * 255)
    except Exception:
        try:
            import cv2.ximgproc as xip
            return xip.thinning((bin_img > 0).astype(np.uint8))*255
        except Exception:
            img = (bin_img > 0).astype(np.uint8)
            skel = np.zeros_like(img)
            kernel = cv2.getStructuringElement(cv2.MORPH_CROSS, (3,3))
            while True:
                eroded = cv2.erode(img, kernel)
                temp = cv2.dilate(eroded, kernel)
                temp = cv2.subtract(img, temp)
                skel = cv2.bitwise_or(skel, temp)
                img = eroded.copy()
                if cv2.countNonZero(img) == 0:
                    break
            return (skel>0).astype(np.uint8)*255

print("Upload a FAULTY thermal image (jpg/png):")
# # up = files.upload()
# assert len(up) > 0, "No file uploaded."
# image_path = r"Sample Thermal Images\T13\faulty\T13_faulty_001_.jpg"

def detect_anomalies(image_path,
                     min_area: int = 60,
                     ignore_right_ratio: float = 0.10,
                     overlay_alpha: float = 0.35,
                     iou_thr: float = 0.15,
                     gap_px_factor: float = 0.004,
                     # ---- wire heuristics ----
                     wire_ar_min: float = 6.0,          # rect AR
                     wire_len_frac: float = 0.12,       # length vs image diag
                     wire_extent_max: float = 0.50,     # bbox fill should be smaller for wires
                     wire_sk_norm_min: float = 0.80,    # skeleton_len / bbox_diag >= this
                     full_wire_cov: float = 0.60,       # hot coverage along skeleton
                     point_max_frac: float = 0.25,      # largest hot patch / comp area
                     red_ratio_faulty: float = 0.40,    # >=40% red -> faulty
                     ecc_thr: float = 3.0,              # PCA eccentricity
                     circularity_thr: float = 0.30,     # 4πA/P^2 (low -> elongated)
                     max_wire_thickness_frac: float = 0.035,
                     # ---- joint rules ----
                     joint_extent_min: float = 0.55,
                     joint_thick_len_min: float = 0.18,
                     joint_sk_norm_max: float = 0.65,
                     joint_area_frac_max: float = 0.015,
                     joint_circularity_min: float = 0.55, # roundish blobs favor joint
                     vote_margin: int = 1                # how many votes over other class to decide
                     ):
    # img = cv2.imread(image_path)
    img = image_path
    if img is None: raise FileNotFoundError(image_path)
    H, W = img.shape[:2]; D = math.hypot(H, W)
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV); v = hsv[:,:,2]

    # hot color masks
    mask_red    = cv2.inRange(hsv, (0,  60, 180), (20, 255, 255))
    mask_yellow = cv2.inRange(hsv, (20, 60, 180), (40, 255, 255))
    mask_hot    = cv2.bitwise_or(mask_red, mask_yellow)

    # remove right temp bar
    if ignore_right_ratio > 0:
        cut = int(W*(1.0-ignore_right_ratio))
        for m in (mask_red, mask_yellow, mask_hot): m[:, cut:] = 0

    # expand blobs
    mask = cv2.morphologyEx(mask_hot, cv2.MORPH_OPEN, np.ones((3,3),np.uint8), 1)
    mask = cv2.morphologyEx(mask,     cv2.MORPH_CLOSE, np.ones((5,5),np.uint8), 1)
    mask = cv2.dilate(mask, np.ones((3,3),np.uint8), 1)

    contours,_ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    def severity_from_bbox(x,y,w,h, rmask):
        roi_v=v[y:y+h, x:x+w]; roi_hot=rmask[y:y+h, x:x+w]
        if cv2.countNonZero(roi_hot)==0: return 0.0
        hot_mean=cv2.mean(roi_v, mask=roi_hot)[0]
        rim=cv2.dilate(roi_hot, np.ones((11,11),np.uint8), 1)
        bg=cv2.subtract(rim, roi_hot); bg=np.where(bg>0,255,0).astype(np.uint8)
        bg_mean=cv2.mean(roi_v, mask=bg)[0] if cv2.countNonZero(bg) else float(np.mean(roi_v))
        contrast=max(0.0,(hot_mean-bg_mean)/255.0); area_norm=min(1.0,(w*h)/(H*W*0.05))
        return float(min(1.0, 0.7*contrast + 0.3*area_norm))

    items=[]
    for cnt in contours:
        area=int(cv2.contourArea(cnt));
        if area<min_area: continue
        x,y,w,h=cv2.boundingRect(cnt)
        rmask=np.zeros((H,W),np.uint8)
        cv2.drawContours(rmask,[cnt],-1,255,-1)
        items.append({"bbox":(x,y,w,h),"area_px":area,"mask":rmask,"cnt":cnt})

    # merge
    def to_xyxy(b): x,y,w,h=b; return (x,y,x+w,y+h)
    def iou(a,b):
        ax1,ay1,ax2,ay2=to_xyxy(a); bx1,by1,bx2,by2=to_xyxy(b)
        ix1,iy1=max(ax1,bx1),max(ay1,by1); ix2,iy2=min(ax2,bx2),min(ay2,by2)
        iw,ih=max(0,ix2-ix1),max(0,iy2-iy1); inter=iw*ih
        ua=(ax2-ax1)*(ay2-ay1); ub=(bx2-bx1)*(by2-by1)
        return inter/(ua+ub-inter+1e-6)
    def gap_px(a,b):
        ax1,ay1,ax2,ay2=to_xyxy(a); bx1,by1,bx2,by2=to_xyxy(b)
        dx=max(0,max(bx1-ax2,ax1-bx2)); dy=max(0,max(by1-ay2,ay1-by2))
        return max(dx,dy)

    GAP=max(8,int(max(H,W)*gap_px_factor))
    used=[False]*len(items); merged=[]
    for i in range(len(items)):
        if used[i]: continue
        used[i]=True
        x,y,w,h=items[i]["bbox"]; umask=items[i]["mask"].copy(); cnts=[items[i]["cnt"]]
        changed=True
        while changed:
            changed=False
            for j in range(len(items)):
                if used[j]: continue
                if iou((x,y,w,h),items[j]["bbox"])>=iou_thr or gap_px((x,y,w,h),items[j]["bbox"])<=GAP:
                    used[j]=True
                    x2,y2,w2,h2=items[j]["bbox"]
                    x=min(x,x2); y=min(y,y2); w=max(x+w,x2+w2)-x; h=max(y+h,y2+h2)-y
                    umask=cv2.bitwise_or(umask, items[j]["mask"]); cnts.append(items[j]["cnt"])
                    changed=True
        sev=severity_from_bbox(x,y,w,h,umask)
        merged.append({"bbox":(x,y,w,h), "centroid":(x+w//2,y+h//2),
                       "area_px":int(cv2.countNonZero(umask)), "severity":round(sev,4),
                       "mask":umask, "cnts":cnts})

    # features
    def pca_eccentricity(cnt):
        m=cv2.moments(cnt); m00=m["m00"]
        if m00==0: return 0.0
        mu20=m["mu20"]/m00; mu02=m["mu02"]/m00; mu11=m["mu11"]/m00
        cov=np.array([[mu20,mu11],[mu11,mu02]],dtype=np.float32)
        eig,_=np.linalg.eig(cov); l1,l2=np.max(eig),np.min(eig)
        if l2<=1e-6: return 1e6
        return float(np.sqrt(l1/l2))

    def shape_features(a):
        x,y,w,h=a["bbox"]; cnt=np.concatenate(a["cnts"])
        area=cv2.contourArea(cnt); per=max(1.0,cv2.arcLength(cnt,True))
        rect=cv2.minAreaRect(cnt); rw,rh=rect[1]
        if rw<1 or rh<1: rw,rh=w,h
        ar_rect=(max(rw,rh)+1e-6)/(min(rw,rh)+1e-6)
        length=max(rw,rh); extent=area/float(max(1,w*h))
        circularity=4*np.pi*area/(per*per); ecc=pca_eccentricity(cnt)
        sk = skeletonize_binary(a["mask"]); sk_len=cv2.countNonZero(sk)
        thickness_est = area/float(max(1, sk_len))  # px per unit skeleton
        return ar_rect,length,extent,circularity,ecc,thickness_est,sk_len,sk

    def classify_fault(a):
        x,y,w,h=a["bbox"]; comp=a["mask"]
        # color
        red_in = cv2.countNonZero(cv2.bitwise_and(comp, mask_red))
        yel_in = cv2.countNonZero(cv2.bitwise_and(comp, mask_yellow))
        hot_in = max(1, red_in+yel_in); red_ratio = red_in/hot_in

        # shape
        ar_rect,length,extent,circ,ecc,thick_est,sk_len,sk = shape_features(a)
        diag = math.hypot(w,h)
        sk_norm = sk_len / float(max(1, diag))
        thin = (thick_est <= max_wire_thickness_frac * min(H,W))
        long = (length >= wire_len_frac * D)

        # votes
        wire_votes  = 0
        joint_votes = 0
        if ar_rect >= wire_ar_min:      wire_votes += 1
        if ecc >= ecc_thr:              wire_votes += 1
        if circ <= circularity_thr:     wire_votes += 1
        if extent <= wire_extent_max:   wire_votes += 1
        if sk_norm >= wire_sk_norm_min: wire_votes += 1
        if thin:                        wire_votes += 1
        if long:                        wire_votes += 1

        if extent >= joint_extent_min:        joint_votes += 1
        if (thick_est/float(max(1,length))) >= joint_thick_len_min: joint_votes += 1
        if sk_norm <= joint_sk_norm_max:      joint_votes += 1
        if (a["area_px"]/(H*W)) <= joint_area_frac_max: joint_votes += 1
        if circ >= joint_circularity_min:     joint_votes += 1

        # decide wire vs joint by votes
        if wire_votes - joint_votes >= vote_margin:
            comp_only = cv2.bitwise_and(mask_hot, comp)
            sk_d = cv2.dilate((sk>0).astype(np.uint8)*255, np.ones((3,3),np.uint8), 1)
            hot_on_sk = cv2.bitwise_and(comp_only, sk_d)
            cov = cv2.countNonZero(hot_on_sk) / float(max(1, cv2.countNonZero(sk)))

            num,lbls,stats,_ = cv2.connectedComponentsWithStats((comp_only>0).astype(np.uint8), 8)
            largest_area=0; lab=-1
            for k in range(1,num):
                if stats[k, cv2.CC_STAT_AREA] > largest_area:
                    largest_area = stats[k, cv2.CC_STAT_AREA]; lab=k
            patch_frac = largest_area / float(max(1, a["area_px"]))
            patch_mask = (lbls==lab).astype(np.uint8)*255 if lab>0 else comp_only

            v_wire = v * (patch_mask//255)
            _,_,_, maxLoc = cv2.minMaxLoc(v_wire)
            hotspot = (int(maxLoc[0]), int(maxLoc[1]))

            if cov >= full_wire_cov:
                ftype, color = "Full Wire Overload (Potential)", (0,255,255)
            else:
                if patch_frac <= point_max_frac:
                    ftype = "Point Overload (Faulty)" if red_ratio >= red_ratio_faulty \
                            else "Point Overload (Potential)"
                    color = (0,0,255) if "Faulty" in ftype else (0,255,255)
                else:
                    ftype = "Point Overload (Faulty)" if red_ratio >= (red_ratio_faulty+0.1) \
                            else "Point Overload (Potential)"
                    color = (0,0,255) if "Faulty" in ftype else (0,255,255)
            return ftype, color, hotspot

        if joint_votes - wire_votes >= vote_margin:
            ftype = "Loose Joint (Faulty)" if red_ratio >= red_ratio_faulty else "Loose Joint (Potential)"
            color = (0,0,255) if "Faulty" in ftype else (0,255,255)
            return ftype, color, None

        # tie-breaker: fall back to previous logic (primary/backup wire)
        is_wire_primary = (ar_rect >= wire_ar_min) and long
        is_wire_backup  = (ecc >= ecc_thr and extent <= 0.45) or (circ <= circularity_thr)
        if (is_wire_primary or is_wire_backup) and thin and (sk_norm >= 0.7):
            return "Point Overload (Potential)", (0,255,255), None  # will be refined above rarely
        ftype = "Loose Joint (Faulty)" if red_ratio >= red_ratio_faulty else "Loose Joint (Potential)"
        color = (0,0,255) if "Faulty" in ftype else (0,255,255)
        return ftype, color, None

    # draw
    overlay = img.copy(); annotated = img.copy()
    th = max(2, int(min(H,W)*0.003)); font_scale = max(0.5, min(H,W)/1200.0)
    out_meta=[]
    for a in merged:
        ftype, color, hotspot = classify_fault(a)
        cnts,_ = cv2.findContours(a["mask"], cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        cv2.drawContours(overlay, cnts, -1, color, -1)
        x,y,w,h=a["bbox"]; cx,cy=a["centroid"]
        cv2.rectangle(annotated,(x,y),(x+w,y+h),color,th)
        cv2.circle(annotated,(cx,cy),max(2,th+1),color,-1)
        cv2.putText(annotated, f"{ftype}  s={a['severity']:.2f}", (x, max(20,y-8)),
                    cv2.FONT_HERSHEY_SIMPLEX, font_scale, color, max(2, th-1))
        if hotspot is not None:
            cv2.drawMarker(annotated, hotspot, (0,255,0), cv2.MARKER_CROSS,
                           markerSize=max(12, th*3), thickness=max(2, th-1))
            cv2.putText(annotated, "hotspot", (hotspot[0]+6, hotspot[1]-6),
                        cv2.FONT_HERSHEY_SIMPLEX, font_scale*0.9, (0,255,0), max(2, th-1))
        m={"bbox":a["bbox"],"centroid":a["centroid"],"area_px":a["area_px"],
           "severity":a["severity"],"fault_type":ftype}
        if hotspot is not None: m["hotspot_xy"]=(int(hotspot[0]), int(hotspot[1]))
        out_meta.append(m)

    annotated = cv2.addWeighted(overlay, overlay_alpha, annotated, 1-overlay_alpha, 0)

    # heatmap (visual aid)
    v_norm = cv2.normalize(v, None, 0, 255, cv2.NORM_MINMAX)
    v_blur = cv2.GaussianBlur(v_norm, (0,0), 7, 7)
    heat = cv2.applyColorMap(v_blur.astype(np.uint8), cv2.COLORMAP_JET)
    heatmap_blend = cv2.addWeighted(img, 0.6, heat, 0.4, 0)

    return annotated, heatmap_blend, out_meta


# === Run ===
# annotated_img, heatmap_img, meta = detect_anomalies(image_path)

# plt.figure(figsize=(12,7))
# plt.imshow(cv2.cvtColor(annotated_img, cv2.COLOR_BGR2RGB)); plt.axis("off")
# plt.title("Anomalies — vote-based wire vs joint, with overload subtypes + hotspot")
# plt.show()

# plt.figure(figsize=(12,7))
# plt.imshow(cv2.cvtColor(heatmap_img, cv2.COLOR_BGR2RGB)); plt.axis("off")
# plt.title("Brightness Heatmap Overlay")
# plt.show()

# if len(meta)==0:
#     print("No anomalies found.")
# else:
#     print("Anomaly metadata:")
#     for i,m in enumerate(meta,1):
#         line=f"[{i}] bbox={m['bbox']}  centroid={m['centroid']}  area_px={m['area_px']}  "
#         line+=f"severity={m['severity']}  fault_type={m['fault_type']}"
#         if 'hotspot_xy' in m: line+=f"  hotspot={m['hotspot_xy']}"
#         print(line)

# stem,_=os.path.splitext(image_path)
# cv2.imwrite(f"{stem}_annotated.png", annotated_img)
# # cv2.imwrite(f"{stem}_heatmap.png", heatmap_img)
# print("Saved:", f"{stem}_annotated.png")
# print("Saved:", f"{stem}_heatmap.png")

from pre import remove_right_bar

def interface(image_path):
    image = remove_right_bar(image_path)
    annotated_img, heatmap_img, meta = detect_anomalies(image)

    plt.figure(figsize=(12,7))
    plt.imshow(cv2.cvtColor(annotated_img, cv2.COLOR_BGR2RGB)); plt.axis("off")
    plt.title("Anomalies — vote-based wire vs joint, with overload subtypes + hotspot")
    plt.show()

    if len(meta)==0:
        print("No anomalies found.")
        return "No anomalies found."
    else:
        print("Anomaly metadata:")
        for i,m in enumerate(meta,1):
            line=f"[{i}] bbox={m['bbox']}  centroid={m['centroid']}  area_px={m['area_px']}  "
            line+=f"severity={m['severity']}  fault_type={m['fault_type']}"
            if 'hotspot_xy' in m: line+=f"  hotspot={m['hotspot_xy']}"
            print(line)
        print("meta:", meta)
        return meta
    
if __name__ == "__main__":
    image_path = r"Sample Thermal Images\T13\faulty\T13_faulty_001_.jpg"
    interface(image_path)