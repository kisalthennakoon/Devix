import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Typography,
  Card,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Button,
  TextField,
  Chip,
  Collapse,
  Snackbar,
  Alert,
} from "@mui/material";
import axios from "axios";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import PanToolAltIcon from "@mui/icons-material/PanToolAlt";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CropSquareIcon from '@mui/icons-material/CropSquare';
import UndoIcon from '@mui/icons-material/Undo';
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import CloseIcon from '@mui/icons-material/Close';

type AIResult = {
  // (legacy center coords—kept for compatibility, not used for drawing)
  XCoordinate?: string;
  YCoordinate?: string;

  // NEW (from backend)
  bbox?: number[] | string;   // [x, y, w, h] in pixels of the ORIGINAL image
  areaPx?: string | number;   // area in px² (unused in UI)
  hotspotX?: string | number;
  hotspotY?: string | number;

  faultType: string;
  faultConfidence?: string | number; // 0..1 or 0..100
  faultSeverity?: string | number;   // 0..1 or 0..100
  faultStatus?: string;              // e.g., "no_anomaly"
  createdAt?: string;
};

interface InspectionImages {
  baseImageUrl: string;
  baseImageUploadedBy: string;
  baseImageUploadedTime: string;
  baseImageUploadedDate: string;

  thermal: string;
  thermalUploadedBy: string;
  thermalUploadedTime: string;
  thermalUploadedDate: string;

  aiResults: AIResult[];
}

/* ----------------- helpers ----------------- */
const cleanBase64 = (b?: string | null) =>
  b
    ? (b as string)
        .replace(/^["']|["']$/g, "")
        .replace(/[\r\n\s]/g, "")
        .replace(/[^A-Za-z0-9+/=]/g, "")
    : null;

const toPct = (v: string | number | undefined, decimals = 0) => {
  if (v === undefined || v === null) return null;
  const n = Number(v);
  if (!isFinite(n)) return null;
  const pct = n <= 1 ? n * 100 : n; // accept 0..1 or 0..100
  return Math.max(0, Math.min(100, pct)).toFixed(decimals);
};

// normalize backend string fields: treat null/undefined/'null'/'undefined'/empty as missing
const normalizeBackendField = (v: any): string | null => {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  if (!s) return null;
  const low = s.toLowerCase();
  if (low === 'null' || low === 'undefined') return null;
  return s;
};

// parse bbox that may arrive as "[x,y,w,h]" or as array
const parseBBox = (bbox: AIResult["bbox"]): number[] | null => {
  if (!bbox) return null;
  if (Array.isArray(bbox)) return bbox.map(Number);
  try {
    const s = (bbox as string).trim();
    const arr = s.startsWith("[") ? JSON.parse(s) : s.split(",").map(Number);
    if (arr.length === 4 && arr.every((n: any) => isFinite(Number(n)))) {
      return arr.map(Number);
    }
  } catch {
    /* no-op */
  }
  return null;
};

/* --------------- component ----------------- */
const ThermalImageComparison = ({ inspectionNo, transformerNo }: { inspectionNo: string; transformerNo?: string }) => {
  const [inspectionImages, setInspectionImages] = useState<InspectionImages>();
  const [weather, setWeather] = useState<"Sunny" | "Cloudy" | "Rainy">("Sunny");
  const [notes, setNotes] = useState("");

  // tools (right image)
  const [tool, setTool] = useState<"none" | "move">("none");
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef<{ x: number; y: number } | null>(null);

  // image sizing (scale bbox from original -> displayed)
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [displaySize, setDisplaySize] = useState({ w: 0, h: 0 });
  const [naturalSize, setNaturalSize] = useState({ w: 0, h: 0 });

  // Annotations state
  type Annotation = {
    id: string; // local id
    bbox: number[]; // [x,y,w,h] in ORIGINAL image px
    status: 'ai' | 'added' | 'edited' | 'deleted';
    notes?: string;
    timestamp: string; // ISO
    userId: string;
    original?: AIResult; // keep reference to original AI payload
    originalIndex?: number;
  };

  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [activeTool, setActiveTool] = useState<'none' | 'move' | 'draw'>('none');
  const drawStart = useRef<{ x: number; y: number } | null>(null);
  const drawingTemp = useRef<{ x: number; y: number; w: number; h: number } | null>(null);
  const moveInfo = useRef<{ id: string; startX: number; startY: number; orig: number[] } | null>(null);
  const resizeInfo = useRef<{ id: string; startX: number; startY: number; orig: number[] } | null>(null);
  const transformRef = useRef<HTMLDivElement | null>(null);
  // undo history
  const historyRef = useRef<Annotation[][]>([]);
  const [historyCount, setHistoryCount] = useState(0);
  // when restoring from history, avoid pushing another snapshot
  const isRestoringRef = useRef(false);

  // Snackbar for save feedback
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMsg, setSnackMsg] = useState("");
  const [snackSeverity, setSnackSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('success');

  const pushHistorySnapshot = () => {
    if (isRestoringRef.current) return;
    try {
      const snap = annotations.map((a) => ({ ...a }));
      const last = historyRef.current[historyRef.current.length - 1];
      if (last && JSON.stringify(last) === JSON.stringify(snap)) return;
      historyRef.current.push(snap);
      setHistoryCount(historyRef.current.length);
    } catch (e) {
      // ignore
    }
  };

  const undo = () => {
    if (historyRef.current.length === 0) return;
    const prev = historyRef.current.pop()!;
    isRestoringRef.current = true;
    setAnnotations(prev.map((a) => ({ ...a })));
    setHistoryCount(historyRef.current.length);
    // clear restoring flag on next tick
    setTimeout(() => (isRestoringRef.current = false), 0);
  };

  const updateDisplaySize = () => {
    const el = imgRef.current;
    if (!el) return;
    setDisplaySize({ w: el.clientWidth, h: el.clientHeight });
  };

  useEffect(() => {
    axios
      .get(`/api/inspectionImage/get/${inspectionNo}`)
      .then((res) => setInspectionImages(res.data))
      .catch((err) => console.error("Error fetching inspection:", err));
  }, [inspectionNo]);

  // initialize annotations when inspectionImages arrive
  useEffect(() => {
    if (!inspectionImages) return;
    const raw = inspectionImages.aiResults ?? [];
    const anns: Annotation[] = raw
      .map((r, i) => {
        const bb = parseBBox(r.bbox);
        if (!bb) return null;

  // backend can return annotations with faultStatus/evaluatedBy set by user after confirm
  // normalizeBackendField will treat literal 'null'/'undefined' and empty strings as missing
  const backendStatusRaw = (r as any).faultStatus ?? null;
  const backendStatusNorm = normalizeBackendField(backendStatusRaw);
  const backendStatus = backendStatusNorm ? String(backendStatusNorm).toLowerCase() : '';
  const evaluatedByRaw = (r as any).evaluatedBy ?? (r as any).userId ?? null;
  const evaluatedBy = normalizeBackendField(evaluatedByRaw);

        // Determine initial status and userId based on backend fields.
        // If backend marked this as 'ai' or evaluatedBy is 'AI', treat as AI result.
        let status: Annotation['status'] = 'ai';
        let userId = 'AI';
        let originalIndex: number | undefined = undefined;

        if (backendStatus && backendStatus !== 'ai') {
          // backend is explicitly marking as added/edited/deleted
          status = backendStatus as Annotation['status'];
          userId = evaluatedBy ?? 'Devix';
        } else if (evaluatedBy && String(evaluatedBy).toLowerCase() !== 'ai') {
          // evaluatedBy is set to a user (not AI) — treat as edited by that user
          status = 'edited';
          userId = evaluatedBy;
        } else {
          // AI-originated result (no meaningful backend status/evaluatedBy provided)
          status = 'ai';
          userId = 'AI';
          originalIndex = i;
        }

        return {
          id: `${status === 'ai' ? 'ai' : 'user'}-${i}`,
          bbox: bb,
          status,
          notes: (r as any).notes ?? '',
          timestamp: (r as any).timestamp ?? (r as any).createdAt ?? new Date().toISOString(),
          userId,
          original: r,
          originalIndex,
        } as Annotation;
      })
      .filter(Boolean) as Annotation[];
    setAnnotations(anns);
  }, [inspectionImages]);

  useEffect(() => {
    const r = () => updateDisplaySize();
    window.addEventListener("resize", r);
    return () => window.removeEventListener("resize", r);
  }, []);

  const doZoom = () => setScale((s) => Math.min(3, +(s + 0.25).toFixed(2)));
  const doReset = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
    setTool("none");
    setDragging(false);
  };

  // helper to convert display coords -> original image px
  const displayToOriginal = (dx: number, dy: number) => {
    const sx = naturalSize.w ? naturalSize.w / displaySize.w : 1;
    const sy = naturalSize.h ? naturalSize.h / displaySize.h : 1;
    return { x: Math.round(dx * sx), y: Math.round(dy * sy) };
  };

  // helper to convert original bbox -> display px
  const originalToDisplay = (bb: number[]) => {
    const sx = displaySize.w / (naturalSize.w || 1);
    const sy = displaySize.h / (naturalSize.h || 1);
    return { left: bb[0] * sx, top: bb[1] * sy, width: bb[2] * sx, height: bb[3] * sy };
  };

  const onMouseDown = (e: React.MouseEvent) => {
    // drawing uses image relative coords within the displayed image box
    if (activeTool === 'draw') {
      // start drawing: snapshot current state for undo
      pushHistorySnapshot();
      const rect = transformRef.current?.getBoundingClientRect() ?? (e.currentTarget as HTMLElement).getBoundingClientRect();
      const dx = e.clientX - rect.left;
      const dy = e.clientY - rect.top;
      drawStart.current = { x: dx, y: dy };
      drawingTemp.current = { x: dx, y: dy, w: 0, h: 0 };
      setDragging(true);
      return;
    }

    if (tool !== "move" || scale === 1) return;
    setDragging(true);
    dragStart.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (activeTool === 'draw' && dragging && drawStart.current) {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const dx = e.clientX - rect.left;
      const dy = e.clientY - rect.top;
      const sx = Math.min(dx, drawStart.current.x);
      const sy = Math.min(dy, drawStart.current.y);
      const w = Math.abs(dx - drawStart.current.x);
      const h = Math.abs(dy - drawStart.current.y);
      drawingTemp.current = { x: sx, y: sy, w, h };
      // force rerender
      setDisplaySize((s) => ({ ...s }));
      return;
    }

    // moving annotation
    if (moveInfo.current && dragging) {
      const rect = transformRef.current?.getBoundingClientRect() ?? (e.currentTarget as HTMLElement).getBoundingClientRect();
      const curX = e.clientX - rect.left;
      const curY = e.clientY - rect.top;
      const dx = curX - moveInfo.current.startX;
      const dy = curY - moveInfo.current.startY;
      const delta = displayToOriginal(dx, dy);
      setAnnotations((s) =>
        s.map((a) =>
          a.id === moveInfo.current!.id
            ? {
                ...a,
                bbox: [moveInfo.current!.orig[0] + delta.x, moveInfo.current!.orig[1] + delta.y, moveInfo.current!.orig[2], moveInfo.current!.orig[3]],
                status: a.status === 'ai' ? 'edited' : a.status,
                timestamp: new Date().toISOString(),
                userId: 'Devix',
              }
            : a
        )
      );
      return;
    }

    // resizing annotation
    if (resizeInfo.current && dragging) {
      const rect = transformRef.current?.getBoundingClientRect() ?? (e.currentTarget as HTMLElement).getBoundingClientRect();
      const curX = e.clientX - rect.left;
      const curY = e.clientY - rect.top;
      const orig = resizeInfo.current.orig;
      // delta in display pixels
      const deltaDisplayX = curX - resizeInfo.current.startX;
      const deltaDisplayY = curY - resizeInfo.current.startY;
      // convert display delta to original px
      const deltaOriginal = displayToOriginal(deltaDisplayX, deltaDisplayY);
      const newW = Math.max(1, Math.round(orig[2] + deltaOriginal.x));
      const newH = Math.max(1, Math.round(orig[3] + deltaOriginal.y));
      setAnnotations((s) =>
        s.map((a) => (a.id === resizeInfo.current!.id ? { ...a, bbox: [orig[0], orig[1], newW, newH], status: a.status === 'ai' ? 'edited' : a.status, timestamp: new Date().toISOString(), userId: 'Devix' } : a))
      );
      return;
    }

    if (!dragging || tool !== "move") return;
    setOffset({
      x: e.clientX - (dragStart.current?.x ?? 0),
      y: e.clientY - (dragStart.current?.y ?? 0),
    });
  };
  const onMouseUp = () => {
    if (activeTool === 'draw' && drawingTemp.current) {
      finishDrawing();
      return;
    }
    setDragging(false);
  };

  // finalize drawing
  const finishDrawing = () => {
    if (!drawingTemp.current) return;
    const t = drawingTemp.current;
    // convert display -> original
    const o1 = displayToOriginal(t.x, t.y);
    const o2 = displayToOriginal(t.x + t.w, t.y + t.h);
    const bb = [o1.x, o1.y, Math.max(1, o2.x - o1.x), Math.max(1, o2.y - o1.y)];
    const ann: Annotation = {
      id: `user-${Date.now()}`,
      bbox: bb,
      status: 'added',
      notes: '',
      timestamp: new Date().toISOString(),
      userId: 'Devix',
    };
    // mark as a new anomaly
    ann.original = { faultType: 'New Anomaly', transformerNo: transformerNo ?? undefined } as any as AIResult;
    setAnnotations((s) => [...s, ann]);
    drawingTemp.current = null;
    drawStart.current = null;
    setDragging(false);
    setActiveTool('none');
  };

  /* ---------- anomaly filtering & flags ---------- */
  const rawResults: AIResult[] = inspectionImages?.aiResults ?? [];

  // which error is expanded in the list (index) — null = none
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  // Filter out backend “no_anomaly” placeholders and entries without bbox/faultType
  const results = rawResults.filter((r) => {
    const status = String(r.faultStatus ?? "").toLowerCase();
    if (status === "no_anomaly") return false;

    const bb = parseBBox(r.bbox);
    if (!bb) return false;

    const ft = String(r.faultType ?? "").toLowerCase();
    if (ft === "" || ft === "null") return false;

    return true;
  });

  const hasAnomaly = results.length > 0;

  return (
    <Box sx={{ p: 3, borderRadius: 3, boxShadow: 6, backgroundColor: "#f9f9f9" }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2.5 }}>
        Thermal Image Comparison
      </Typography>

      <Box
        sx={{
          display: "flex",
          gap: 2,
          justifyContent: "center",
          alignItems: "flex-start",
          flexWrap: "nowrap",
        }}
      >
        {/* LEFT: BASELINE */}
        <Box sx={{ flex: 1, mr: 1, minWidth: 0 }}>
          <Card sx={{ borderRadius: 2, boxShadow: 4, position: "relative", overflow: "hidden" }}>
            <Chip
              size="small"
              label="Baseline"
              sx={{
                position: "absolute",
                top: 8,
                left: 8,
                bgcolor: "rgba(0,0,0,0.55)",
                color: "#fff",
                zIndex: 2,
              }}
            />
            <img
              src={
                inspectionImages?.baseImageUrl
                  ? `data:image/png;base64,${cleanBase64(inspectionImages.baseImageUrl)}`
                  : ""
              }
              alt="Baseline"
              style={{
                display: "block",
                width: "100%",
                height: "auto",
                maxHeight: 600,
                objectFit: "contain",
              }}
            />
          </Card>

          {/* meta */}
          <Typography sx={{ fontSize: 13, color: "#888", fontStyle: "italic", mt: 1 }}>
            Uploaded Time: {inspectionImages?.baseImageUploadedDate} {inspectionImages?.baseImageUploadedTime}
          </Typography>
          <Typography sx={{ fontSize: 13, color: "#888", fontStyle: "italic" }}>
            Uploaded By: {inspectionImages?.baseImageUploadedBy}
          </Typography>

          {/* Weather */}
          <Box sx={{ mt: 2, display: "inline-flex", alignItems: "center", gap: 1 }}>
            <Typography sx={{ fontSize: 13, color: "text.secondary" }}>Weather Condition</Typography>
            <Select
              size="small"
              value={weather}
              onChange={(e) => setWeather(e.target.value as typeof weather)}
              sx={{ minWidth: 160 }}
            >
              <MenuItem value="Sunny">Sunny</MenuItem>
              <MenuItem value="Cloudy">Cloudy</MenuItem>
              <MenuItem value="Rainy">Rainy</MenuItem>
            </Select>
          </Box>
        </Box>

        {/* RIGHT: THERMAL with overlays */}
        <Box sx={{ flex: 1, ml: 1, minWidth: 0 }}>
          <Box
            sx={{
              position: "relative",
              borderRadius: 2,
              boxShadow: 4,
              overflow: "hidden",
              cursor: activeTool === 'draw' ? 'crosshair' : tool === "move" && scale > 1 ? (dragging ? "grabbing" : "grab") : "default",
            }}
          >
            {/* badges */}
            <Chip
              size="small"
              label="Current"
              sx={{
                position: "absolute",
                top: 8,
                left: 8,
                zIndex: 5,
                bgcolor: "rgba(0,0,0,0.55)",
                color: "#fff",
                pointerEvents: "none",
              }}
            />
            {hasAnomaly && (
              <Chip
                size="small"
                icon={<WarningAmberIcon sx={{ color: "#fff !important" }} />}
                label="Anomaly Detected"
                sx={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  zIndex: 5,
                  bgcolor: "#b71c1c",
                  color: "#fff",
                  borderRadius: 9999,
                  pointerEvents: "none",
                  "& .MuiChip-icon": { color: "#fff" },
                }}
              />
            )}

            {/* transform layer */}
            <Box
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseLeave={onMouseUp}
              onMouseUp={onMouseUp}
              sx={{
                transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
                transformOrigin: "center center",
                transition: dragging ? "none" : "transform 120ms ease",
                position: "relative",
                pointerEvents: 'auto',
              }}
            >
              <img
                ref={imgRef}
                onLoad={(e) => {
                  const el = e.currentTarget;
                  setNaturalSize({ w: el.naturalWidth, h: el.naturalHeight });
                  updateDisplaySize();
                }}
                src={
                  inspectionImages?.thermal
                    ? `data:image/png;base64,${cleanBase64(inspectionImages.thermal)}`
                    : ""
                }
                alt="Thermal"
                style={{
                  display: "block",
                  width: "100%",
                  height: "auto",
                  maxHeight: 600,
                  objectFit: "contain",
                  userSelect: "none",
                  pointerEvents: "none",
                }}
              />

              {/* Boxes from backend bbox (pixels) */}
              {naturalSize.w > 0 &&
                results.map((r, i) => {
                  const bb = parseBBox(r.bbox)!; // results already filtered
                  // if there's an annotation that references this AI (originalIndex) and the annotation
                  // has been changed (edited/deleted/added by user), hide the original AI box — the
                  // user annotation will render instead. This prevents the original AI frame from
                  // appearing alongside the edited box.
                  const hasOverride = annotations.some((a) => a.originalIndex !== undefined && a.originalIndex === i && a.status !== 'ai');
                  if (hasOverride) return null;
                  // legacy: if there's a deleted annotation that exactly matches bbox, hide the AI box
                  const isDeleted = annotations.some((a) => a.status === 'deleted' && a.bbox[0] === bb[0] && a.bbox[1] === bb[1] && a.bbox[2] === bb[2] && a.bbox[3] === bb[3]);
                  if (isDeleted) return null;
                  const [x, y, w, h] = bb;

                  // scale to displayed px
                  const sx = displaySize.w / naturalSize.w || 1;
                  const sy = displaySize.h / naturalSize.h || 1;

                  const style = {
                    left: x * sx,
                    top: y * sy,
                    width: Math.max(2, w * sx),
                    height: Math.max(2, h * sy),
                  };

                  // color by “Potential” or not (orange vs red)
                  const isPotential = /\bpotential\b/i.test(String(r.faultType));
                  const stroke = isPotential ? "#FB8C00" : "#E53935";
                  const conf = toPct(r.faultConfidence, 0);

                  return (
                    <Box
                      key={`bb-${i}`}
                      sx={{
                        position: "absolute",
                        ...style,
                        border: `2px solid ${stroke}`,
                        borderRadius: 1,
                        boxShadow: "0 0 0 2px rgba(255,255,255,0.25)",
                        pointerEvents: "none",
                      }}
                    >
                      {/* index (TL) */}
                      <Typography
                        component="span"
                        sx={{
                          position: "absolute",
                          top: -18,
                          left: -6,
                          fontSize: 14,
                          fontWeight: 700,
                          color: "#000",
                          background: "transparent",
                        }}
                      >
                        {i + 1}
                      </Typography>

                      {/* confidence pill (TR) */}
                      <Typography
                        component="span"
                        sx={{
                          position: "absolute",
                          top: -18,
                          right: -6,
                          fontSize: 12,
                          fontWeight: 700,
                          color: "#fff",
                          bgcolor: stroke,
                          px: 0.75,
                          py: 0.25,
                          borderRadius: 1,
                          lineHeight: 1.2,
                          boxShadow: "0 1px 2px rgba(0,0,0,0.4)",
                          textShadow: "0 1px 2px rgba(0,0,0,0.6)",
                        }}
                      >
                        {conf ? `${conf}%` : "—"}
                      </Typography>
                    </Box>
                  );
                })}
              {/* render user annotations including edited/added */}
                  {naturalSize.w > 0 &&
                annotations.map((a) => {
                  if (a.status === 'deleted') return null;
                  const d = originalToDisplay(a.bbox);
                  const stroke = a.status === 'added' ? '#1976d2' : a.status === 'edited' ? '#2e7d32' : '#E53935';
                  return (
                    <Box
                      key={`ann-${a.id}`}
                      sx={{
                        position: 'absolute',
                        left: d.left,
                        top: d.top,
                        width: Math.max(2, d.width),
                        height: Math.max(2, d.height),
                        border: `2px dashed ${stroke}`,
                        borderRadius: 1,
                        zIndex: 6,
                        boxShadow: '0 0 0 2px rgba(255,255,255,0.25)',
                      }}
                      onMouseDown={(ev) => {
                        // start moving this annotation
                        ev.stopPropagation();
                        if (activeTool === 'draw') return;
                        // snapshot before move
                        pushHistorySnapshot();
                        // compute start relative to transform layer so mousemove deltas match
                        const layerRect = transformRef.current?.getBoundingClientRect() ?? (ev.currentTarget as HTMLElement).getBoundingClientRect();
                        const sx = ev.clientX - layerRect.left;
                        const sy = ev.clientY - layerRect.top;
                        moveInfo.current = { id: a.id, startX: sx, startY: sy, orig: a.bbox.slice() };
                        setDragging(true);
                      }}
                      onMouseUp={(ev) => {
                        ev.stopPropagation();
                        moveInfo.current = null;
                        setDragging(false);
                      }}
                    >
                      {/* delete cross */}
                      <IconButton
                        size="small"
                        onClick={(ev) => {
                          ev.stopPropagation();
                          pushHistorySnapshot();
                          setAnnotations((s) => s.map((x) => (x.id === a.id ? { ...x, status: 'deleted', timestamp: new Date().toISOString(), userId: 'Devix' } : x)));
                        }}
                        sx={{ position: 'absolute', right: -12, top: -12, bgcolor: '#fff', zIndex: 10 }}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                      {/* resize handle */}
                      <Box
                        onMouseDown={(ev) => {
                          ev.stopPropagation();
                            // snapshot before starting resize
                            pushHistorySnapshot();
                            // compute start relative to transform layer so mousemove deltas match
                            const layerRect = transformRef.current?.getBoundingClientRect() ?? (ev.currentTarget as HTMLElement).parentElement!.getBoundingClientRect();
                            const rsx = ev.clientX - layerRect.left;
                            const rsy = ev.clientY - layerRect.top;
                            resizeInfo.current = { id: a.id, startX: rsx, startY: rsy, orig: a.bbox.slice() };
                          setDragging(true);
                        }}
                        sx={{ position: 'absolute', right: -6, bottom: -6, width: 12, height: 12, bgcolor: '#fff', borderRadius: 1, zIndex: 11, cursor: 'se-resize' }}
                      />
                      {/* TODO: resize/move handles (basic bottom-right resize) */}
                    </Box>
                  );
                })}

              {/* temporary drawing rect */}
              {drawingTemp.current && (
                <Box
                  sx={{
                    position: 'absolute',
                    left: drawingTemp.current.x,
                    top: drawingTemp.current.y,
                    width: drawingTemp.current.w,
                    height: drawingTemp.current.h,
                    border: '2px dashed #1976d2',
                    zIndex: 7,
                    pointerEvents: 'none',
                  }}
                />
              )}
            </Box>
          </Box>

          {/* meta */}
          <Typography sx={{ mt: 1, fontSize: 13, color: "#888", fontStyle: "italic" }}>
            Uploaded Time: {inspectionImages?.thermalUploadedDate} {inspectionImages?.thermalUploadedTime}
          </Typography>
          <Typography sx={{ fontSize: 13, color: "#888", fontStyle: "italic" }}>
            Uploaded By: {inspectionImages?.thermalUploadedBy}
          </Typography>

          {/* Tools: Reset, Move, Zoom */}
          <Box sx={{ mt: 2, display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
            <Typography sx={{ mr: 1, color: "text.secondary" }}>Annotation Tools</Typography>
            <Tooltip title="Reset view">
              <IconButton size="small" onClick={doReset}>
                <RestartAltIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Undo last change">
              <span>
                <IconButton size="small" onClick={undo} disabled={historyCount === 0}>
                  <UndoIcon />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Move (click & drag)">
              <IconButton
                size="small"
                color={tool === "move" ? "primary" : "default"}
                onClick={() => setTool((t) => (t === "move" ? "none" : "move"))}
              >
                <PanToolAltIcon />
              </IconButton>
            </Tooltip>
              <Tooltip title="Draw box">
              <IconButton
                size="small"
                color={activeTool === 'draw' ? 'primary' : 'default'}
                onClick={() => setActiveTool((t) => (t === 'draw' ? 'none' : 'draw'))}
              >
                <CropSquareIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Zoom">
              <IconButton size="small" onClick={doZoom}>
                <ZoomInIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>

      {/* Errors list */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Errors
        </Typography>

        {!hasAnomaly ? (
          <Typography variant="body2" color="text.secondary">
            No anomalies detected.
          </Typography>
        ) : (
          (() => {
            type DisplayItem =
              | { kind: 'ai'; r: AIResult; idx: number; matching?: Annotation }
              | { kind: 'user'; annotation: Annotation };

            const displayItems: DisplayItem[] = [];

            // push AI results (possibly with matching annotation)
            results.forEach((r, idx) => {
              const matching = annotations.find((a) => {
                if (a.originalIndex !== undefined && a.originalIndex === idx) return true;
                const p = parseBBox(r.bbox);
                if (!p) return false;
                return p[0] === a.bbox[0] && p[1] === a.bbox[1] && p[2] === a.bbox[2] && p[3] === a.bbox[3];
              });
              // always include AI result in the list; if there's a matching annotation marked deleted
              // the on-image AI box will be hidden (rendering logic), but we still want it in the Errors list
              displayItems.push({ kind: 'ai', r, idx, matching });
            });

            // append user-created annotations (those without originalIndex) so deleted user boxes also appear
            annotations.forEach((a) => {
              if (a.originalIndex === undefined) displayItems.push({ kind: 'user', annotation: a });
            });

            // deduplicate by bbox: prefer user annotations over AI when both target same bbox
            const deduped: DisplayItem[] = [];
            const seen = new Map<string, { idx: number; item: DisplayItem }>();
            const bboxKeyOf = (it: DisplayItem) => {
              if (it.kind === 'ai') {
                const b = parseBBox(it.r.bbox);
                return b ? JSON.stringify(b) : JSON.stringify([it.idx]);
              }
              return JSON.stringify(it.annotation.bbox);
            };

            displayItems.forEach((it) => {
              const key = bboxKeyOf(it);
              if (!seen.has(key)) {
                seen.set(key, { idx: deduped.length, item: it });
                deduped.push(it);
                return;
              }
              // if we already have an AI item but now see a user item for same bbox, prefer user
              const prev = seen.get(key)!;
              if (prev.item.kind === 'ai' && it.kind === 'user') {
                // replace in-place
                deduped[prev.idx] = it;
                seen.set(key, { idx: prev.idx, item: it });
              }
              // otherwise keep the first seen item
            });

            return deduped.map((item, displayIdx) => {
              if (item.kind === 'ai') {
                const { r, idx: _idx, matching } = item;
                const conf = toPct(r.faultConfidence, 0);
                const sev = toPct(r.faultSeverity, 0);
                const isPotential = /\bpotential\b/i.test(String(r.faultType));
                const chipBg = isPotential ? "#FB8C00" : "#E53935";

                const headerDate = matching
                  ? `${matching.userId} — ${new Date(matching.timestamp).toLocaleString()}`
                  : r.createdAt
                  ? new Date(r.createdAt).toLocaleString()
                  : `${inspectionImages?.thermalUploadedDate ?? ""} ${inspectionImages?.thermalUploadedTime ?? ""}`.trim();

                const bb = parseBBox(r.bbox);
                const centroid = bb ? [Math.round(bb[0] + bb[2] / 2), Math.round(bb[1] + bb[3] / 2)] : null;

                return (
                  <Box key={`disp-ai-${displayIdx}`} sx={{ mb: 1 }}>
                    <Box
                      onClick={() => setExpandedIndex((s) => (s === displayIdx ? null : displayIdx))}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        p: 1,
                        border: "1px solid #eee",
                        borderRadius: 1,
                        bgcolor: "#fff",
                        cursor: "pointer",
                        userSelect: "none",
                      }}
                    >
                      <Chip size="small" label={`Error ${displayIdx + 1}`} sx={{ bgcolor: chipBg, color: "#fff", fontWeight: 700 }} />
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ fontSize: 13, color: "text.secondary", fontWeight: 600 }}>
                          {matching ? `${matching.userId} — ${new Date(matching.timestamp).toLocaleString()}` : `AI — ${headerDate}`}
                        </Typography>
                      </Box>
                      <IconButton size="small" aria-label="expand">
                        <ExpandMoreIcon
                          sx={{ transform: expandedIndex === displayIdx ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 160ms" }}
                        />
                      </IconButton>
                    </Box>

                    <Collapse in={expandedIndex === displayIdx} timeout="auto" unmountOnExit>
                      <Box sx={{ p: 1, border: "1px solid #f0f0f0", borderTop: "none", bgcolor: "#fafafa" }}>
                        <Typography sx={{ fontSize: 13, color: "text.secondary", mb: 0.5 }}>
                          <strong>Fault Type:</strong> {matching ? (matching.status === 'added' ? `${r.faultType} (user-added)` : matching.status === 'deleted' ? `${r.faultType} (deleted)` : r.faultType) : r.faultType}
                        </Typography>
                        <Typography sx={{ fontSize: 13, color: "text.secondary", mb: 0.5 }}>
                          <strong>Confidence:</strong> {conf ? `${conf}%` : "—"}
                        </Typography>
                        <Typography sx={{ fontSize: 13, color: "text.secondary", mb: 0.5 }}>
                          <strong>Severity:</strong> {sev ? `${sev}%` : "—"}
                        </Typography>
                        <Typography sx={{ fontSize: 13, color: "text.secondary", mb: 0.5 }}>
                          <strong>Coordinates:</strong>{" "}
                          {r.hotspotX && r.hotspotY
                            ? `hotspot (${r.hotspotX}, ${r.hotspotY})`
                            : centroid
                            ? `centroid (${centroid[0]}, ${centroid[1]})`
                            : "—"}
                        </Typography>
                        {matching && (
                          <Box sx={{ mt: 1 }}>
                            <Typography sx={{ fontSize: 13, color: "text.secondary", mb: 0.5 }}>
                              <strong>Annotation:</strong> {matching.status}
                            </Typography>
                            <TextField
                              size="small"
                              fullWidth
                              placeholder="Add note..."
                              value={matching.notes}
                              onChange={(e) => {
                                const v = e.target.value;
                                pushHistorySnapshot();
                                setAnnotations((s) => s.map((a) => (a.id === matching.id ? { ...a, notes: v, timestamp: new Date().toISOString(), userId: 'Devix', status: a.status === 'ai' ? 'edited' : a.status } : a)));
                              }}
                            />
                          </Box>
                        )}
                      </Box>
                    </Collapse>
                  </Box>
                );
              }

              // user-added annotation
              const a = item.annotation;
              const chipBg = '#1976d2';
              const header = `${a.userId} — ${new Date(a.timestamp).toLocaleString()}`;
              const centroid = [Math.round(a.bbox[0] + a.bbox[2] / 2), Math.round(a.bbox[1] + a.bbox[3] / 2)];

              return (
                <Box key={`disp-user-${displayIdx}`} sx={{ mb: 1 }}>
                  <Box
                    onClick={() => setExpandedIndex((s) => (s === displayIdx ? null : displayIdx))}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      p: 1,
                      border: "1px solid #eee",
                      borderRadius: 1,
                      bgcolor: "#fff",
                      cursor: "pointer",
                      userSelect: "none",
                    }}
                  >
                    <Chip size="small" label={`Error ${displayIdx + 1}`} sx={{ bgcolor: chipBg, color: "#fff", fontWeight: 700 }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontSize: 13, color: "text.secondary", fontWeight: 600 }}>{header}</Typography>
                    </Box>
                    <IconButton size="small" aria-label="expand">
                      <ExpandMoreIcon
                        sx={{ transform: expandedIndex === displayIdx ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 160ms" }}
                      />
                    </IconButton>
                  </Box>

                  <Collapse in={expandedIndex === displayIdx} timeout="auto" unmountOnExit>
                    <Box sx={{ p: 1, border: "1px solid #f0f0f0", borderTop: "none", bgcolor: "#fafafa" }}>
                      <Typography sx={{ fontSize: 13, color: "text.secondary", mb: 0.5 }}>
                        <strong>Fault Type:</strong> {(a.original?.faultType ?? 'New Anomaly')}{a.status === 'deleted' ? ' (deleted)' : ''}
                      </Typography>
                      <Typography sx={{ fontSize: 13, color: "text.secondary", mb: 0.5 }}>
                        <strong>Confidence:</strong> 100%
                      </Typography>
                      <Typography sx={{ fontSize: 13, color: "text.secondary", mb: 0.5 }}>
                        <strong>Severity:</strong> —
                      </Typography>
                      <Typography sx={{ fontSize: 13, color: "text.secondary", mb: 0.5 }}>
                        <strong>Coordinates:</strong> centroid ({centroid[0]}, {centroid[1]})
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        <Typography sx={{ fontSize: 13, color: "text.secondary", mb: 0.5 }}>
                          <strong>Annotation:</strong> {a.status}
                        </Typography>
                        <TextField
                          size="small"
                          fullWidth
                          placeholder="Add note..."
                          value={a.notes}
                          onChange={(e) => {
                            const v = e.target.value;
                            pushHistorySnapshot();
                            setAnnotations((s) => s.map((xx) => (xx.id === a.id ? { ...xx, notes: v, timestamp: new Date().toISOString(), userId: 'Devix' } : xx)));
                          }}
                        />
                      </Box>
                    </Box>
                  </Collapse>
                </Box>
              );
            });
          })()
        )}
      </Box>

      {/* Notes */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Notes
        </Typography>
        <TextField
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Type here to add notes..."
          multiline
          minRows={4}
          fullWidth
        />
      </Box>

      {/* Confirm / Cancel */}
      <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={async () => {
            try {
              // prepare payload: include all annotations but send 'deleted' as status
              const payload = annotations.map((a) => ({
                transformerNo: (a.original as any)?.transformerNo ?? transformerNo ?? '',
                inspectionNo: inspectionNo,
                XCoordinate: '0',
                bbox: JSON.stringify(a.bbox),
                YCoordinate: '0',
                hotspotY: (a.original as any)?.hotspotY ?? null,
                faultSeverity: (a.original as any)?.faultSeverity ?? null,
                hotspotX: (a.original as any)?.hotspotX ?? null,
                areaPx: (a.original as any)?.areaPx ?? null,
                faultType: (a.original as any)?.faultType ?? 'New Anomaly',
                faultConfidence: a.status !== 'ai' ? 1 : (a.original as any)?.faultConfidence ?? null,
                anomalyStatus: a.status === 'ai' ? 'ai' : a.status, // ai/added/edited/deleted
                notes: a.notes ?? '',
                timestamp: a.timestamp,
                userId: a.userId ?? 'Devix',
                evaluatedBy: a.userId ?? 'Devix',
                evaluatedDate: a.timestamp,
              }));

              await axios.post("/api/inspectionImage/createEvalResults", payload);
              // show success snackbar
              setSnackMsg('Annotations saved');
              setSnackSeverity('success');
              setSnackOpen(true);
              console.log('Annotations saved to server');
            } catch (err) {
              console.error('Failed to save annotations to server', err);
              setSnackMsg('Failed to save annotations');
              setSnackSeverity('error');
              setSnackOpen(true);
            }
          }}
        >
          Confirm
        </Button>
        <Button
          variant="outlined"
          startIcon={<FileDownloadIcon />}
          onClick={async () => {
            try {
              // Request the backend report as a binary blob and trigger a download in-browser.
              // The backend should return a JSON file or other attachment. We attempt to read
              // the filename from Content-Disposition if provided.
              const response = await axios.get(`/api/inspectionImage/getReport/${inspectionNo}`, {
                responseType: 'blob',
              });

              const blob = response.data;
              const headers = (response.headers as any) || {};
              const contentDisp = headers['content-disposition'] || headers['Content-Disposition'] || '';
              let filename = `inspection-${inspectionNo}-export.json`;
              if (contentDisp) {
                const m = contentDisp.match(/filename\*?=(?:UTF-8''|)\"?([^\";]+)\"?/i);
                if (m && m[1]) {
                  try {
                    filename = decodeURIComponent(m[1]);
                  } catch (_) {
                    filename = m[1];
                  }
                }
              }

              // If this looks like JSON, read text, pretty-print, then construct a new blob
              const contentType = (headers['content-type'] || headers['Content-Type'] || blob.type || '').toString();
              let downloadBlob = blob;
              if (/json/i.test(contentType) || filename.toLowerCase().endsWith('.json')) {
                try {
                  const text = await blob.text();
                  // parse then pretty-print; fall back to original text if parse fails
                  try {
                    const parsed = JSON.parse(text);
                    const pretty = JSON.stringify(parsed, null, 2);
                    downloadBlob = new Blob([pretty], { type: 'application/json' });
                  } catch (parseErr) {
                    // If parsing fails, but the text looks minified, attempt to at least add newlines
                    // (best-effort) by formatting JSON-like structures — but here we'll just keep original text.
                    console.warn('Export: JSON parse failed, downloading raw text');
                    downloadBlob = new Blob([text], { type: 'application/json' });
                  }
                } catch (readErr) {
                  console.warn('Export: failed to read blob text, falling back to binary download', readErr);
                  downloadBlob = blob;
                }
              }

              const url = window.URL.createObjectURL(downloadBlob);
              const a = document.createElement('a');
              a.href = url;
              a.download = filename;
              document.body.appendChild(a);
              a.click();
              a.remove();
              window.URL.revokeObjectURL(url);
              console.log('Export downloaded', filename);
            } catch (err) {
              console.error('Export failed', err);
              alert('Export failed.');
            }
          }}
        >
          Export 
        </Button>
        <Button
          variant="text"
          color="inherit"
          onClick={() => {
            setNotes("");
            doReset();
          }}
        >
          Cancel
        </Button>
      </Box>
      <Snackbar open={snackOpen} autoHideDuration={4000} onClose={() => setSnackOpen(false)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={() => setSnackOpen(false)} severity={snackSeverity} sx={{ width: '100%' }}>
          {snackMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ThermalImageComparison;
