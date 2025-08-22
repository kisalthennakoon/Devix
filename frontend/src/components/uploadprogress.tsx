import { Box, Typography, LinearProgress, Button } from "@mui/material";

type UploadProgressProps = {
  /** 0..100 */
  progress: number;
  /** Called when user clicks Cancel (optional) */
  onCancel?: () => void;
  /** Texts (optional) */
  title?: string;
  subtitle?: string;
};

export default function UploadProgress({
  progress,
  onCancel,
  title = "Thermal image uploading.",
  subtitle = "Thermal image is being uploaded and Reviewed.",
}: UploadProgressProps) {
  return (
    <Box
      sx={{
        bgcolor: "#fff",
        borderRadius: 3,
        border: "1px solid #ECECEC",
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        px: { xs: 2, sm: 4 },
        py: { xs: 4, sm: 6 },
      }}
    >
      {/* Centered heading + subtitle */}
      <Typography variant="h6" align="center" sx={{ fontWeight: 700, mb: 0.5 }}>
        {title}
      </Typography>
      <Typography variant="body2" align="center" sx={{ color: "text.secondary", mb: 6 }}>
        {subtitle}
      </Typography>

      {/* Progress row */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Box sx={{ flex: 1 }}>
          <LinearProgress
            variant="determinate"
            value={Math.min(100, Math.max(0, progress))}
            sx={{
              height: 10,
              borderRadius: 9999,
              bgcolor: "#E8E8ED",
              "& .MuiLinearProgress-bar": {
                borderRadius: 9999,
                bgcolor: "#3F2DBD", // deep purple
              },
            }}
            aria-label="upload-progress"
          />
        </Box>
        <Typography variant="body2" sx={{ minWidth: 40 }} align="right">
          {Math.round(progress)}%
        </Typography>
      </Box>

      {/* Cancel */}
      <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
        <Button variant="text" onClick={onCancel} sx={{ color: "text.primary" }}>
          Cancel
        </Button>
      </Box>
    </Box>
  );
}