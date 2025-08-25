
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Grid,
  IconButton,
} from "@mui/material";
import ImageIcon from "@mui/icons-material/Image";
import DeleteIcon from "@mui/icons-material/Delete";

type SlotFile = {
  file: File | null;
  url: string | null;
};

type BaselineImageProps = {
  open: boolean;
  onClose: () => void;                         // called on Cancel or dialog close
  onConfirm: (files: (File | null)[]) => void; // returns up to 3 files (null if empty)
  title?: string;
  subtitle?: string;
  transformerNo?: string;
  onChange?: () => void;
  snackBar: (snackbar: { open: boolean; message: string; severity: "success" | "error" }) => void;
};

const SLOT_LABELS = ["Sunny", "Cloudy", "Rainy"] as const;

function BaselineImage({
  open,
  onClose,
  onConfirm,
  title = "Upload Baseline Images",
  subtitle = "Drag & drop up to 3 images, or click a slot to select.",
  transformerNo,
  onChange,
  snackBar
}: BaselineImageProps) {
  const [slots, setSlots] = useState<SlotFile[]>([
    { file: null, url: null },
    { file: null, url: null },
    { file: null, url: null },
  ]);
  const [dragActive, setDragActive] = useState(false);

  // cleanup object URLs
  useEffect(() => {
    return () => {
      slots.forEach((s) => s.url && URL.revokeObjectURL(s.url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setSlot = (idx: number, file: File | null) => {
    setSlots((prev) => {
      const next = [...prev];
      if (next[idx]?.url) URL.revokeObjectURL(next[idx].url!);
      next[idx] = file ? { file, url: URL.createObjectURL(file) } : { file: null, url: null };
      return next;
    });
  };

  const handleDropFiles = (files: FileList | File[]) => {
    const arr = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (!arr.length) return;
    setSlots((prev) => {
      const next = [...prev];
      let p = 0;
      for (let i = 0; i < next.length && p < arr.length; i++) {
        if (!next[i].file) {
          next[i] = { file: arr[p], url: URL.createObjectURL(arr[p]) };
          p++;
        }
      }
      return next;
    });
  };

  const fileInputs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];
  const anyFilled = useMemo(() => slots.some((s) => s.file), [slots]);

  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async (files: (File | null)[]) => {
    setError(null); // Clear previous error
    if (!files[0] || !files[1] || !files[2]) {
      setError("Please upload all three images before confirming.");
      return;
    }
    const formData = new FormData();
    if (files[0]) formData.append("baseImageSunny", files[0]);
    if (files[1]) formData.append("baseImageCloudy", files[1]);
    if (files[2]) formData.append("baseImageRainy", files[2]);

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0]; // "YYYY-MM-DD"
    const timeStr = now.toTimeString().split(' ')[0]; // "HH:mm:ss"

    formData.append("uploadedDate", dateStr);
    formData.append("uploadedTime", timeStr);
    formData.append("uploadedBy", "Devix");

    try {
      await fetch(
        `/api/baseImage/add/${transformerNo}`,
        {
          method: "POST",
          body: formData,
        }
      );
      snackBar({ open: true, message: "Baseline Images Uploaded!", severity: "success" });
      //alert("Upload successful!");
    } catch (err) {
      snackBar({ open: true, message: "Baseline Images Upload failed!", severity: "error" });
      console.error(err);
    } finally {
      onClose();
      if (onChange) onChange();
    }

  };


  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>{title}</DialogTitle>
      <DialogContent sx={{ pt: 0, pb: 2 }}>
        <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
          {subtitle}
        </Typography>

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        {/* Big container: handles drag & drop for all three slots */}
        <Box
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            handleDropFiles(e.dataTransfer.files);
          }}
          sx={{
            p: 2,
            borderRadius: 2,
            border: "2px dashed",
            borderColor: dragActive ? "primary.main" : "divider",
            bgcolor: dragActive ? "action.hover" : "background.paper",
          }}
        >
          {/* FLEX ROW: slots side by side */}
          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            {slots.map((s, idx) => (
              <Box key={idx} sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.75 }}>
                  {SLOT_LABELS[idx]}
                </Typography>
                <SlotBox
                  slot={s}
                  onClick={() => fileInputs[idx].current?.click()}
                  onClear={() => setSlot(idx, null)}
                />
                <input
                  ref={fileInputs[idx]}
                  hidden
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0] || null;
                    if (f) setSlot(idx, f);
                    if (fileInputs[idx].current) fileInputs[idx].current.value = "";
                  }}
                />
              </Box>
            ))}
          </Box>

          {/* Footer inside the big box: Cancel (left) and Confirm (right) */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 2 }}>
            <Button variant="text" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="contained" onClick={() => handleConfirm(slots.map((s) => s.file))} disabled={!anyFilled}>
              Confirm
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

/* ---------- sub-slot UI ---------- */

function SlotBox({
  slot,
  onClick,
  onClear,
}: {
  slot: SlotFile;
  onClick: () => void;
  onClear: () => void;
}) {
  const hasImage = !!slot.url;
  return (
    <Box
      onClick={onClick}
      sx={{
        borderRadius: 2,
        border: "1px dashed",
        borderColor: "divider",
        bgcolor: "#061B66",
        color: "white",
        width: "100%",
        aspectRatio: "3 / 4",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        cursor: "pointer",
        overflow: "hidden",
      }}
    >
      {hasImage ? (
        <>
          <Box component="img" src={slot.url!} alt="preview" sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
            sx={{
              position: "absolute",
              top: 6,
              right: 6,
              bgcolor: "rgba(0,0,0,0.4)",
              color: "white",
              "&:hover": { bgcolor: "rgba(0,0,0,0.55)" },
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </>
      ) : (
        <Box sx={{ textAlign: "center", opacity: 0.9 }}>
          <ImageIcon sx={{ fontSize: 40, mb: 1 }} />
          <Typography variant="body2">Drag & drop image</Typography>
          <Typography variant="caption" sx={{ opacity: 0.85 }}>
            or click to select
          </Typography>
        </Box>
      )}
    </Box>
  );
}
export default BaselineImage;