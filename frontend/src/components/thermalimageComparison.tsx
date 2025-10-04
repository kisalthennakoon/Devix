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
} from "@mui/material";
import axios from "axios";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import PanToolAltIcon from "@mui/icons-material/PanToolAlt";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ZoomInIcon from "@mui/icons-material/ZoomIn";

type AIResult = {
  // (legacy center coords are kept for compatibility, not used for drawing)
  XCoordinate?: string;
  YCoordinate?: string;

  // NEW (from backend)
  bbox?: number[] | string;   // [x, y, w, h] in PX of the ORIGINAL image
  areaPx?: string | number;   // area in px²
  hotspotX?: string | number; // optional
  hotspotY?: string | number; // optional

  faultType: string;
  faultConfidence?: string | number; // 0..1 or 0..100
  faultSeverity?: string | number;   // 0..1 or 0..100
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


// helpers
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
  // If already 0..100 keep it; if 0..1 -> convert
  const pct = n <= 1 ? n * 100 : n;
  return Math.max(0, Math.min(100, pct)).toFixed(decimals);
};

// parse bbox that may arrive as "[x,y,w,h]" or as array
const parseBBox = (bbox: AIResult["bbox"]): number[] | null => {
  if (!bbox) return null;
  if (Array.isArray(bbox)) return bbox.map(Number);
  try {
    // allow " [676,248,383,136] " or "676,248,383,136"
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

const ThermalImageComparison = ({ inspectionNo }: { inspectionNo: string }) => {
  const [inspectionImages, setInspectionImages] = useState<InspectionImages>();
  const [weather, setWeather] = useState<"Sunny" | "Cloudy" | "Rainy">("Sunny");
  const [notes, setNotes] = useState("");

  // tools (right image)
  const [tool, setTool] = useState<"none" | "move">("none");
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef<{ x: number; y: number } | null>(null);

  // image sizing (to scale bbox from original pixels -> displayed pixels)
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [displaySize, setDisplaySize] = useState({ w: 0, h: 0 });
  const [naturalSize, setNaturalSize] = useState({ w: 0, h: 0 });

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

  const onMouseDown = (e: React.MouseEvent) => {
    if (tool !== "move" || scale === 1) return;
    setDragging(true);
    dragStart.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragging || tool !== "move") return;
    setOffset({
      x: e.clientX - (dragStart.current?.x ?? 0),
      y: e.clientY - (dragStart.current?.y ?? 0),
    });
  };
  const onMouseUp = () => setDragging(false);

  const aiResults: AIResult[] = inspectionImages?.aiResults ?? [];



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
            Uploaded Time: {inspectionImages?.baseImageUploadedDate}{" "}
            {inspectionImages?.baseImageUploadedTime}
          </Typography>
          <Typography sx={{ fontSize: 13, color: "#888", fontStyle: "italic" }}>
            Uploaded By: {inspectionImages?.baseImageUploadedBy}
          </Typography>

          {/* Weather */}
          <Box sx={{ mt: 2, display: "inline-flex", alignItems: "center", gap: 1 }}>
            <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
              Weather Condition
            </Typography>
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
              cursor:
                tool === "move" && scale > 1 ? (dragging ? "grabbing" : "grab") : "default",
            }}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseLeave={onMouseUp}
            onMouseUp={onMouseUp}
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
            {aiResults.length > 0 && (
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
              sx={{
                transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
                transformOrigin: "center center",
                transition: dragging ? "none" : "transform 120ms ease",
                position: "relative",
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
                aiResults.map((r, i) => {
                  const bb = parseBBox(r.bbox);
                  if (!bb) return null;

                  const [x, y, w, h] = bb; // original px
                  // scale to displayed px (image may be letterboxed by height)
                  const sx = displaySize.w / naturalSize.w || 1;
                  const sy = displaySize.h / naturalSize.h || 1;

                  const style = {
                    left: x * sx,
                    top: y * sy,
                    width: Math.max(2, w * sx),
                    height: Math.max(2, h * sy),
                  };

                  const conf = toPct(r.faultConfidence, 0);  // "56"
                  const sevPct = toPct(r.faultSeverity, 0);  // "6"
                  const isPotential = /\bpotential\b/i.test(String(r.faultType));
                  const stroke = isPotential ? "#FB8C00" /* orange */ : "#E53935" /* red */;

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
                      {/* number index (TL) */}
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
            </Box>
          </Box>

          {/* meta */}
          <Typography sx={{ mt: 1, fontSize: 13, color: "#888", fontStyle: "italic" }}>
            Uploaded Time: {inspectionImages?.thermalUploadedDate}{" "}
            {inspectionImages?.thermalUploadedTime}
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
            <Tooltip title="Move (click & drag)">
              <IconButton
                size="small"
                color={tool === "move" ? "primary" : "default"}
                onClick={() => setTool((t) => (t === "move" ? "none" : "move"))}
              >
                <PanToolAltIcon />
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

        {aiResults.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No AI-detected anomalies.
          </Typography>
        ) : (
          aiResults.map((r, idx) => {
            const conf = toPct(r.faultConfidence, 0);
            const sev = toPct(r.faultSeverity, 0);

            // classify: "Faulty" vs "Potential Faulty" from faultType text
            const isPotential = /\bpotential\b/i.test(String(r.faultType));
            const chipBg = isPotential ? "#FB8C00" /* orange */ : "#E53935" /* red */;

            return (
              <Box
                key={`err-${idx}`}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.25,
                  p: 1,
                  border: "1px solid #eee",
                  borderRadius: 1,
                  mb: 1,
                  bgcolor: "#fff",
                }}
              >
                <Chip
                  size="small"
                  label={`Error ${idx + 1}`}
                  sx={{ bgcolor: chipBg, color: "#fff", fontWeight: 700 }}
                />
                <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                  <strong>{r.faultType}</strong>
                  {conf ? ` — Confidence: ${conf}%` : ""}
                  {sev ? ` — Severity: ${sev}%` : ""}
                  {/* area removed by request */}
                </Typography>
              </Box>
            );
          })
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
        <Button variant="contained" color="primary" onClick={() => console.log("Confirm", { notes, weather })}>
          Confirm
        </Button>
        <Button variant="text" color="inherit" onClick={() => { setNotes(""); doReset(); }}>
          Cancel
        </Button>
      </Box>
    </Box>
  );
};

export default ThermalImageComparison;
