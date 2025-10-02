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
import PanToolAltIcon from "@mui/icons-material/PanToolAlt"; // use PanTool if Alt not available
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ZoomInIcon from "@mui/icons-material/ZoomIn";

type AIResult = {
  YCoordinate: string; // percentage string 0..100
  XCoordinate: string; // percentage string 0..100
  faultType: string;
  faultConfidence: string; // 0..1 string
  faultSeverity: "low" | "medium" | "high";
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

const severityColor: Record<AIResult["faultSeverity"], string> = {
  low: "#FFC107",
  medium: "#FB8C00",
  high: "#E53935",
};

function cleanBase64(base64Str: string | null | undefined): string | null {
  if (!base64Str) return null;
  return (
    base64Str
      .replace(/^["']|["']$/g, "")
      .replace(/[\r\n\s]/g, "")
      .replace(/[^A-Za-z0-9+/=]/g, "") || null
  );
}

const ThermalImageComparison = ({ inspectionNo }: { inspectionNo: string }) => {
  const [inspectionImages, setInspectionImages] = useState<InspectionImages>();
  const [weather, setWeather] = useState<"Sunny" | "Cloudy" | "Rainy">("Sunny");
  const [notes, setNotes] = useState("");

  // === right image tools ===
  const [tool, setTool] = useState<"none" | "move">("none");
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef<{ x: number; y: number } | null>(null);

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

  useEffect(() => {
    axios
      .get(`/api/inspectionImage/get/${inspectionNo}`)
      .then((res) => setInspectionImages(res.data))
      .catch((err) => console.error("Error fetching inspection:", err));
  }, [inspectionNo]);

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

          {/* meta FIRST */}
          <Typography sx={{ fontSize: 13, color: "#888", fontStyle: "italic", mt: 1 }}>
            Uploaded Time: {inspectionImages?.baseImageUploadedDate}{" "}
            {inspectionImages?.baseImageUploadedTime}
          </Typography>
          <Typography sx={{ fontSize: 13, color: "#888", fontStyle: "italic" }}>
            Uploaded By: {inspectionImages?.baseImageUploadedBy}
          </Typography>

          {/* Weather selector AFTER meta lines (per your order) */}
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
                bgcolor: "#b71c1c",            // deep red pill
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

              {/* AI boxes */}
              {aiResults.map((r, i) => {
                const xPct = parseFloat(r.XCoordinate);
                const yPct = parseFloat(r.YCoordinate);
                const boxW = 10;
                const boxH = 12;
                const leftPct = Math.max(0, Math.min(100 - boxW, xPct - boxW / 2));
                const topPct = Math.max(0, Math.min(100 - boxH, yPct - boxH / 2));
                return (
                  <Box
                    key={`${r.faultType}-${i}`}
                    sx={{
                      position: "absolute",
                      left: `${leftPct}%`,
                      top: `${topPct}%`,
                      width: `${boxW}%`,
                      height: `${boxH}%`,
                      border: `2px solid ${severityColor[r.faultSeverity]}`,
                      borderRadius: 1,
                      boxShadow: "0 0 0 2px rgba(255,255,255,0.25)",
                      pointerEvents: "none",
                    }}
                  >
                    {/* simple number label only */}
      <Typography
        component="span"
        sx={{
          position: "absolute",
          top: -18,
          left: -6,
          fontSize: 14,
          fontWeight: 700,
          color: "#000",                // plain number (no pill/background)
          background: "transparent",
          pointerEvents: "none",
        }}
      >
        {i + 1}
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

          {/* Annotation tools — order: Reset, Move, Zoom */}
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

      {/* Errors */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Errors
        </Typography>

        {aiResults.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No AI-detected anomalies.
          </Typography>
        ) : (
          aiResults.map((r, idx) => (
            <Box
              key={`err-${idx}`}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
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
                sx={{
                  bgcolor: severityColor[r.faultSeverity],
                  color: "#fff",
                  fontWeight: 600,
                }}
              />
              <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                {r.createdAt ??
                  `${inspectionImages?.thermalUploadedDate} ${inspectionImages?.thermalUploadedTime}`}
                {" — "}
                <strong>{r.faultType}</strong> ({r.faultSeverity})
              </Typography>
            </Box>
          ))
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
          onClick={() => console.log("Confirm", { notes, weather })}
        >
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
