import { useRef, useState } from "react";
import {
  Box, Typography, Chip, Stack,
  FormControl, InputLabel, Select, MenuItem, Button
} from "@mui/material";
import CircleBadge from "./circlebadge";

const colors = {
  chipBg: "#FFF1DA",
  chipBorder: "#F6D9A1",
  chipText: "#B88700",
  track: "#eeeeee",
  active: "#F6D9A1", // yellow progress color
};

function ThermalImageCard() {
  const [weather, setWeather] = useState("Sunny");
  const [fileName, setFileName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <Box
      sx={{
        position: "relative",
        bgcolor: "#fff",
        boxShadow: 5,
        borderRadius: 2,
        p: 3,
        width: "100%", // parent controls final column width
      }}
    >
      {/* Title */}
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
        Thermal Image
      </Typography>

      {/* Pending chip at top-right */}
      <Chip
        label="Pending"
        size="small"
        sx={{
          position: "absolute",
          top: 12,
          right: 12,
          bgcolor: colors.chipBg,
          color: colors.chipText,
          border: `1px solid ${colors.chipBorder}`,
          fontWeight: 600,
        }}
      />

      {/* Description (wraps to two lines if narrow) */}
      <Typography variant="body2" sx={{ color: "#666", mt: 1, mb: 3 }}>
        Upload a thermal image of the transformer to identify potential issues.
      </Typography>

      {/* Controls */}
      <Stack spacing={2} sx={{ mb: 3 }}>
        <FormControl fullWidth>
          <InputLabel id="weather-label">Weather Condition</InputLabel>
          <Select
            labelId="weather-label"
            label="Weather Condition"
            value={weather}
            onChange={(e) => setWeather(e.target.value as string)}
          >
            <MenuItem value="Sunny">Sunny</MenuItem>
            <MenuItem value="Cloudy">Cloudy</MenuItem>
            <MenuItem value="Rainy">Rainy</MenuItem>
            <MenuItem value="Windy">Windy</MenuItem>
          </Select>
        </FormControl>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) setFileName(f.name);
          }}
        />

        <Button variant="contained" size="large" onClick={() => fileRef.current?.click()}>
          {fileName ? `Selected: ${fileName}` : "Upload thermal Image"}
        </Button>
      </Stack>

      {/* Progress section */}
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
        Progress
      </Typography>

      <Stack spacing={1.5}>
        <ProgressItem label="Thermal Image Upload" status="Pending" />
        <ProgressItem label="AI Analysis" status="Pending" />
        <ProgressItem label="Thermal Image Review" status="Pending" />
      </Stack>
    </Box>
  );
}


function ProgressItem({ label, status }: { label: string; status: string }) {
  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
          <CircleBadge diameter={18} dotSize={3} />
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            {label}
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ color: colors.chipText, fontWeight: 600 }}>
          {status}
        </Typography>
      </Box>

      {/* progress track with active segment at the START */}
      <Box sx={{ mt: 1, position: "relative" }}>
        <Box sx={{ height: 3, bgcolor: colors.track, borderRadius: 9999 }} />
        {/* active segment anchored at left */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            height: 3,
            width: 28,                // small initial progress
            bgcolor: colors.active,
            borderRadius: 9999,
          }}
        />
        {/* small circular marker at the very start */}
        <Box
          sx={{
            position: "absolute",
            top: -3,
            left: -1,                 // keeps the dot snug at the start
            width: 8,
            height: 8,
            bgcolor: colors.active,
            borderRadius: "50%",
          }}
        />
      </Box>
    </Box>
  );
}


export default ThermalImageCard;
