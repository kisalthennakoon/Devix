import { Box } from "@mui/material";

type CircleBadgeProps = {
  diameter?: number;   // circle size
  bg?: string;         // circle color
  dotColor?: string;   // dot color
  dotSize?: number;    // each dot size
  gap?: number;        // space between dots (px)
};

function CircleBadge({
  diameter = 18,
  bg = "#D8BF72",      // soft yellow/gold
  dotColor = "#FFFFFF",
  dotSize = 3,
  gap = 3,
}: CircleBadgeProps) {
  return (
    <Box
      sx={{
        width: diameter,
        height: diameter,
        borderRadius: "50%",
        bgcolor: bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
        flex: "0 0 auto",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap }}>
        <Box sx={{ width: dotSize, height: dotSize, bgcolor: dotColor, borderRadius: "50%" }} />
        <Box sx={{ width: dotSize, height: dotSize, bgcolor: dotColor, borderRadius: "50%" }} />
        <Box sx={{ width: dotSize, height: dotSize, bgcolor: dotColor, borderRadius: "50%" }} />
      </Box>
    </Box>
  );
}
export  default CircleBadge