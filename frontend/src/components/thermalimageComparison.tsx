import React, {useEffect} from "react";
import { Grid, Card, CardMedia, Box, Typography } from "@mui/material";

interface SideBySideImagesProps {
  leftImageUrl: string;
  rightImageUrl: string;
}

const ThermalImageComparison: React.FC<SideBySideImagesProps> = ({
  leftImageUrl,
  rightImageUrl,
}) => {
  const getDirectLink = (url: string, size: number = 1000) => {
    const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    return match
      ? `https://drive.google.com/thumbnail?id=${match[1]}&sz=w${size}`
      : url;
  };

useEffect(() => {
  console.log('left', getDirectLink(leftImageUrl))
  console.log('right', getDirectLink(rightImageUrl))
},[])

  return (
   <Box
      sx={{
        p: 3,
        borderRadius: 3,
        boxShadow: 6,
        backgroundColor: "#f9f9f9",
      }}
    >
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        Thermal Image Comparison
      </Typography>

      <Box
        sx={{
          display: "flex",
          gap: 2,
          justifyContent: "center",
          alignItems: "flex-start",
          flexWrap: "nowrap", // prevents stacking
        }}
      >
        {/* Left Image */}
        <Card sx={{ borderRadius: 2, boxShadow: 4, flex: 1 }}>
          <CardMedia
            component="img"
            image={getDirectLink(leftImageUrl)}
            alt="Left Image"
            sx={{ objectFit: "contain", width: "100%", maxHeight: 600 }}
          />
        </Card>

        {/* Right Image */}
        <Card sx={{ borderRadius: 2, boxShadow: 4, flex: 1 }}>
          <CardMedia
            component="img"
            image={getDirectLink(rightImageUrl)}
            alt="Right Image"
            sx={{ objectFit: "contain", width: "100%", maxHeight: 600 }}
          />
        </Card>
      </Box>
    </Box>
  );
};

export default ThermalImageComparison;




// import { useMemo, useRef, useState } from "react";
// import {
//   Box, Grid, Card, CardContent, Chip, Dialog, DialogContent,
//   Typography, Stack, IconButton
// } from "@mui/material";
// import ZoomInIcon from "@mui/icons-material/ZoomIn";
// import CropSquareIcon from "@mui/icons-material/CropSquare";
// import CachedIcon from "@mui/icons-material/Cached";
// import ImageIcon from "@mui/icons-material/Image";

// export type Slot = "baseline" | "current";
// export type ImageData = { url: string | null; timestamp?: string | null; anomaly?: boolean };
// type Rect = { x: number; y: number; w: number; h: number };

// type Props = {
//   baseline?: ImageData;
//   current?: ImageData;
//   title?: string;
//   allowAnnotateOn?: Slot;
//   initialRects?: Rect[];
//   onRectsChange?: (rects: Rect[]) => void;
// };

// export default function ThermalImageComparison({
//   baseline,
//   current,
//   title = "Thermal Image Comparison",
//   allowAnnotateOn = "current",
//   initialRects = [],
//   onRectsChange,
// }: Props) {
//   const [viewerUrl, setViewerUrl] = useState<string | null>(null);
//   const [tool, setTool] = useState<"none" | "rect">("none");
//   const [rects, setRects] = useState<Rect[]>(initialRects);

//   const setRectsBoth = (r: Rect[]) => { setRects(r); onRectsChange?.(r); };

//   return (
//     <Box sx={{ py: 2 }}>
//       <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
//         <Typography variant="h5" sx={{ fontWeight: 700 }}>{title}</Typography>
//         <IconButton
//           title="Zoom"
//           onClick={() => { if (current?.url) setViewerUrl(current.url); else if (baseline?.url) setViewerUrl(baseline?.url!); }}
//         >
//           <ZoomInIcon />
//         </IconButton>
//       </Box>

//       <Grid container spacing={2}>
//         <Grid item xs={12} md={6}>
//           <ImagePane label="Baseline" data={baseline} onZoom={(u) => setViewerUrl(u)} />
//         </Grid>
//         <Grid item xs={12} md={6}>
//           <ImagePane
//             label="Current"
//             data={current}
//             onZoom={(u) => setViewerUrl(u)}
//             rightChip={current?.anomaly ? { text: "Anomaly Detected" } : undefined}
//             annotatable={allowAnnotateOn === "current"}
//             tool={tool}
//             rects={rects}
//             onRectsChange={setRectsBoth}
//           />
//         </Grid>
//       </Grid>

//       {/* Tools */}
//       <Box
//         sx={{
//           mt: 2,
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "flex-end", // push group to the right edge
//           gap: 1.25,
//           width: "100%",
//         }}
//       >
//         <Typography variant="subtitle1" sx={{ fontWeight: 600, mr: 1 }}>
//           Annotation Tools
//         </Typography>

//         <IconButton
//           title="Rectangle"
//           onClick={() => setTool((t) => (t === "rect" ? "none" : "rect"))}
//           sx={{
//             border: "1px solid",
//             borderColor: tool === "rect" ? "primary.main" : "divider",
//             bgcolor: tool === "rect" ? "action.selected" : "transparent",
//           }}
//         >
//           <CropSquareIcon />
//         </IconButton>

//         <IconButton title="Reset" onClick={() => setRectsBoth([])}>
//           <CachedIcon />
//         </IconButton>
//       </Box>



//       <Dialog open={!!viewerUrl} onClose={() => setViewerUrl(null)} maxWidth="lg">
//         <DialogContent sx={{ p: 0 }}>
//           {viewerUrl && (
//             <Box component="img" src={viewerUrl} alt="zoom" sx={{ display: "block", maxWidth: "90vw", maxHeight: "85vh" }} />
//           )}
//         </DialogContent>
//       </Dialog>
//     </Box>
//   );
// }

// /* image pane  */

// function ImagePane({
//   label,
//   data,
//   onZoom,
//   rightChip,
//   annotatable = false,
//   tool = "none",
//   rects = [],
//   onRectsChange,
// }: {
//   label: "Baseline" | "Current";
//   data?: ImageData;
//   onZoom: (url: string) => void;
//   rightChip?: { text: string };
//   annotatable?: boolean;
//   tool?: "none" | "rect";
//   rects?: Rect[];
//   onRectsChange?: (r: Rect[]) => void;
// }) {
//   const safe = data ?? { url: null, timestamp: null };
//   const hasImage = !!safe.url;

//   const paneRef = useRef<HTMLDivElement | null>(null);
//   const drawingRef = useRef<null | { x: number; y: number }>(null);

//   const startDraw = (cx: number, cy: number) => {
//     if (!annotatable || tool !== "rect" || !paneRef.current) return;
//     const { left, top, width, height } = paneRef.current.getBoundingClientRect();
//     drawingRef.current = { x: clamp01((cx - left) / width), y: clamp01((cy - top) / height) };
//   };
//   const moveDraw = (cx: number, cy: number) => {
//     if (!annotatable || tool !== "rect" || !paneRef.current || !drawingRef.current) return;
//     const { left, top, width, height } = paneRef.current.getBoundingClientRect();
//     const x2 = clamp01((cx - left) / width), y2 = clamp01((cy - top) / height);
//     const x1 = drawingRef.current.x, y1 = drawingRef.current.y;
//     paneRef.current.dataset.preview = JSON.stringify(normalizeRect(x1, y1, x2 - x1, y2 - y1));
//     paneRef.current.dispatchEvent(new Event("previewchange"));
//   };
//   const endDraw = (cx: number, cy: number) => {
//     if (!annotatable || tool !== "rect" || !paneRef.current || !drawingRef.current) return;
//     const { left, top, width, height } = paneRef.current.getBoundingClientRect();
//     const x2 = clamp01((cx - left) / width), y2 = clamp01((cy - top) / height);
//     const x1 = drawingRef.current.x, y1 = drawingRef.current.y;
//     drawingRef.current = null;
//     const rect = normalizeRect(x1, y1, x2 - x1, y2 - y1);
//     if (rect.w > 0.005 && rect.h > 0.005) onRectsChange?.([...(rects ?? []), rect]);
//     delete paneRef.current.dataset.preview;
//     paneRef.current.dispatchEvent(new Event("previewchange"));
//   };

//   const [, setTick] = useState(0);
//   useMemo(() => {
//     const el = paneRef.current; if (!el) return;
//     const handler = () => setTick((t) => t + 1);
//     el.addEventListener("previewchange", handler as EventListener);
//     return () => el.removeEventListener("previewchange", handler as EventListener);
//   }, []);

//   return (
//     <Card elevation={0} sx={{ borderRadius: 2, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
//       <CardContent sx={{ p: 0 }}>
//         <Box sx={{ position: "relative", p: 2 }}>
//           <Chip size="small" label={label}
//             sx={{ position: "absolute", top: 12, left: 12, bgcolor: "#F2F4F7", fontWeight: 600, zIndex: 2 }} />
//           {rightChip && (
//             <Chip size="small" label={rightChip.text}
//               sx={{ position: "absolute", top: 12, right: 12, bgcolor: "#FDEBEC", color: "#A1152C", fontWeight: 700, zIndex: 2 }} />
//           )}

//           {/* Slot Size */}
//           <Box
//             ref={paneRef}
//             sx={{
//               bgcolor: "#061B66",
//               borderRadius: 2,
//               width: "100%",
//               aspectRatio: "3 / 4",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               overflow: "hidden",
//               position: "relative",
//               cursor: annotatable && tool === "rect" ? "crosshair" : "default",
//               userSelect: "none",
//             }}
//             onMouseDown={(e) => startDraw(e.clientX, e.clientY)}
//             onMouseMove={(e) => moveDraw(e.clientX, e.clientY)}
//             onMouseUp={(e) => endDraw(e.clientX, e.clientY)}
//             onMouseLeave={(e) => drawingRef.current && endDraw(e.clientX, e.clientY)}
//           >
//             {hasImage ? (
//               <Box
//                 component="img"
//                 src={safe.url as string}
//                 alt={`${label} image`}
//                 sx={{ width: "100%", height: "100%", objectFit: "contain", cursor: "zoom-in" }}
//                 onClick={() => onZoom(safe.url as string)}
//               />
//             ) : (
//               <Stack spacing={1} alignItems="center" sx={{ color: "white", opacity: 0.85 }}>
//                 <ImageIcon sx={{ fontSize: 48 }} />
//                 <Typography variant="body2">No image selected</Typography>
//               </Stack>
//             )}

//             {(rects ?? []).map((r, i) => (
//               <Box key={i}
//                 sx={{
//                   position: "absolute", left: `${r.x * 100}%`, top: `${r.y * 100}%`,
//                   width: `${r.w * 100}%`, height: `${r.h * 100}%`,
//                   border: "2px solid #E53935", borderRadius: 1, pointerEvents: "none"
//                 }} />
//             ))}

//             {paneRef.current?.dataset.preview && (() => {
//               const p = JSON.parse(paneRef.current.dataset.preview) as Rect;
//               return (
//                 <Box sx={{
//                   position: "absolute", left: `${p.x * 100}%`, top: `${p.y * 100}%`,
//                   width: `${p.w * 100}%`, height: `${p.h * 100}%`,
//                   border: "2px dashed #E53935", borderRadius: 1, pointerEvents: "none"
//                 }} />
//               );
//             })()}
//           </Box>

//           {safe.timestamp && (
//             <Typography variant="caption" sx={{ mt: 1, display: "block", color: "text.secondary" }}>
//               {safe.timestamp}
//             </Typography>
//           )}
//         </Box>
//       </CardContent>
//     </Card>
//   );
// }

// /* utils */
// function clamp01(v: number) { return Math.max(0, Math.min(1, v)); }
// function normalizeRect(x: number, y: number, w: number, h: number): Rect {
//   const left = w < 0 ? x + w : x, top = h < 0 ? y + h : y;
//   return { x: clamp01(left), y: clamp01(top), w: clamp01(Math.abs(w)), h: clamp01(Math.abs(h)) };
// }
