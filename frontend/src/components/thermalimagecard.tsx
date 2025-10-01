import { useRef, useState, useEffect } from "react";
import {
  Box, Typography, Chip, Stack,
  FormControl, InputLabel, Select, MenuItem, Button,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Alert,
  Snackbar
} from "@mui/material";
import CircleBadge from "./circlebadge";
import axios from "axios";

const colors = {
  chipBg: "#FFF1DA",
  chipBorder: "#F6D9A1",
  chipText: "#B88700",
  track: "#eeeeee",
  active: "#F6D9A1",
};

type ThermalImageCardProps = {
  inspectionNo: string;
  transformerNo: string;
  baseImageExist: boolean;
  aiProgress?: boolean;
  onUploadSuccess: () => void;

};

function ThermalImageCard({ inspectionNo, transformerNo, baseImageExist, onUploadSuccess , aiProgress}: ThermalImageCardProps) {
  const [weather, setWeather] = useState("Sunny");
  const [fileName, setFileName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [tempFile, setTempFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const dialogInputRef = useRef<HTMLInputElement>(null);

  const setTemp = (file: File | null) => {
    // revoke old preview to avoid leaks
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (file) {
      setTempFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setTempFile(null);
      setPreviewUrl(null);
    }
  };

  const [uploading, setUploading] = useState(false); // Add this state


  const confirmImage = async () => {
    if (!tempFile) return; // no file selected
    setUploading(true);
    const url = `/api/inspectionImage/add/${inspectionNo}`; // replace with your backend endpoint

    try {
      const formData = new FormData();
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0]; // "YYYY-MM-DD"
      const timeStr = now.toTimeString().split(' ')[0].slice(0, 5); // "HH:mm"

      formData.append("uploadedDate", dateStr);
      formData.append("uploadedTime", timeStr);
      formData.append("uploadedBy", "Devix");
      formData.append("thermalImage", tempFile); // file
      formData.append("imageCondition", weather); // string
      formData.append("transformerNo", transformerNo);

      const response = await axios.post(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Upload response:", response.data);
      //alert("Upload successful!");
      //alert("Thermal Image Upload successful!");
      if (onUploadSuccess) onUploadSuccess();
    } catch (error: any) {
      console.error("Error uploading:", error.response || error.message);
      alert("Thermal Image Upload failed!");
    } finally {
      setUploading(false);
    }
  };


  return (
    <Box
      sx={{
        position: "relative",
        bgcolor: "#fff",
        boxShadow: 5,
        borderRadius: 2,
        p: 3,
        width: "100%",
        maxWidth: 520,
        alignSelf: "flex-start",
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

        {!baseImageExist? (
            <Button variant="contained" size="large" disabled>
              Please upload base images first
            </Button>
        ) : baseImageExist && aiProgress ? (
          <Button variant="contained" size="large" disabled>
              Uploaded
            </Button>
        ):
        (
          <Button variant="contained" size="large" onClick={() => setUploadOpen(true)}>
            {fileName ? `Selected: ${fileName}` : "Upload thermal Image"}
          </Button>
        )}
      </Stack>



      {/* Progress section */}
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
        Progress
      </Typography>

      <Stack spacing={1.5}>
        <ProgressItem label="Thermal Image Upload" status={aiProgress ? "Completed" : "Pending"} />
        <ProgressItem label="AI Analysis" status={aiProgress ? "In Progress" : "Pending"} />
        <ProgressItem label="Thermal Image Review" status ="Pending"/>
      </Stack>

      <Dialog open={uploadOpen} onClose={() => setUploadOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload Thermal Image</DialogTitle>
        <DialogContent>
          {/* Drop zone */}
          <Box
            sx={{
              mt: 1,
              border: "2px dashed",
              borderColor: previewUrl ? "success.light" : "divider",
              borderRadius: 2,
              p: 3,
              textAlign: "center",
              bgcolor: "background.paper",
              cursor: "pointer",
            }}
            onClick={() => dialogInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const f = e.dataTransfer.files?.[0];
              if (f && f.type.startsWith("image/")) setTemp(f);
            }}
          >
            {previewUrl ? (
              <Box
                component="img"
                src={previewUrl}
                alt="preview"
                sx={{ maxWidth: "100%", maxHeight: 320, borderRadius: 1 }}
              />
            ) : (
              <>
                <Typography variant="body1" sx={{ mb: 0.5 }}>
                  Drag & drop an image here
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  or click to browse
                </Typography>
              </>
            )}
            <input
              ref={dialogInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0] || null;
                if (f && f.type.startsWith("image/")) setTemp(f);
                if (dialogInputRef.current) dialogInputRef.current.value = "";
              }}
            />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => {
              setTemp(null);
              setUploadOpen(false);
            }}
            color="secondary"
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={!tempFile}
            onClick={() => {
              if (tempFile) setFileName(tempFile.name); // accept selection
              setUploadOpen(false); // close the dialog first
              confirmImage(); // then send the file
              setTemp(null); // clear preview and tempFile
            }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={uploading} PaperProps={{ sx: { textAlign: "center", p: 4 } }}>
        <Box sx={{ p: 4, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <CircleBadge diameter={40} dotSize={7} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Uploading image...
          </Typography>
        </Box>
      </Dialog>

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
            width: status === "Completed" ? "100%" : status === "In Progress" ? "30%" : "0%",
            bgcolor: colors.active,
            borderRadius: 9999,
          }}
        />
        {/* small circular marker at the start or end depending on status */}
        <Box
          sx={{
            position: "absolute",
            top: -3,
            left: status === "Completed" ? 'calc(100% - 7px)' : status === "In Progress" ? 'calc(30% - 7px)' : -1,
            width: 8,
            height: 8,
            bgcolor: colors.active,
            borderRadius: "50%",
            transition: "left 0.4s"
          }}
        />
      </Box>
    </Box>
  );
}


export default ThermalImageCard;
