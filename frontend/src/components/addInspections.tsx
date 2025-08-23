import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Grid,
  Snackbar,
  Alert,
} from '@mui/material';
import { useState } from "react";
import axios from "axios";

interface AddInspectionModalProps {
  transformerNoInput: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  setSnackbar: (snackbar: { open: boolean; message: string; severity: "success" | "error" }) => void;
  onInspectionAdded: () => void;  
}

export const AddInspectionModal = ({ transformerNoInput, open, onOpenChange, setSnackbar, onInspectionAdded }: AddInspectionModalProps) => {
  const [branch, setBranch] = useState('');
  const [transformerNo, setTransformerNo] = useState(transformerNoInput);
  const [inspectionDate, setInspectionDate] = useState<Date | null>(null);
  const [time, setTime] = useState('');

  // const handleSubmit = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   console.log("Adding new inspection...");
  //   onOpenChange(false);
  // };

  // const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
  //   open: false,
  //   message: "",
  //   severity: "success",
  // });
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!branch.trim() || !transformerNo.trim() || !inspectionDate || !time.trim()) {
      setFormError("All fields are required.");
      //setSnackbar({ open: true, message: "All fields are required.", severity: "error" });
      return;
    }
    setFormError(null);

    try {
      const payload = {
        inspectionBranch: branch,
        transformerNo,
        inspectionDate: inspectionDate.toISOString().split('T')[0],
        inspectionTime: time,
      };
      const res = await axios.post(
        "https://automatic-pancake-wrrpg66ggvj535gq-8080.app.github.dev/api/inspection/create",
        payload
      );
      setSnackbar({
        open: true,
        message: res.data?.message ||  "Inspection added successfully!",
        severity: "success",
      });
      onInspectionAdded();
      onOpenChange(false);
      setBranch('');
      setTransformerNo('');
      setInspectionDate(null);
      setTime('');
    } catch (err: any) {
      let errorMsg = "Failed to add inspection. Please try again.";
      if (err?.response?.data) {
        if (typeof err.response.data === "string") {
          errorMsg = err.response.data;
        } else if (typeof err.response.data.message === "string") {
          errorMsg = err.response.data.message;
        }
      }
      setSnackbar({
        open: true,
        message: errorMsg,
        severity: "error",
      });
    }
  };


  return (
    <Dialog open={open} onClose={() => onOpenChange(false)} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontSize: '1.25rem', fontWeight: 600 }}>
        Add New Inspection
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Enter the details for the new transformer inspection.
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              label="Branch"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              placeholder="Branch"
              required
            />
            </Box>
            <Box sx={{display: 'flex', gap: 2}}>
            <TextField
              fullWidth
              label="Transformer No"
              value={transformerNo}
              onChange={(e) => setTransformerNo(e.target.value)}
              placeholder="Transformer No."
              required
              InputProps={{ readOnly: true }}
            />
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              label="Date of Inspection"
              type="date"
              value={inspectionDate ? inspectionDate.toISOString().split('T')[0] : ''}
              onChange={(e) => setInspectionDate(e.target.value ? new Date(e.target.value) : null)}
              InputLabelProps={{ shrink: true }}
              required
            />
          
          <TextField
            fullWidth
            label="Time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            placeholder="7:00 AM"
          />
        </Box>
        </Box>
      </DialogContent>
      {formError && (
            <Typography color="error" sx={{ mt: 1, ml: 2 }}>
              {formError}
            </Typography>
      )}
      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button 
          onClick={() => { onOpenChange(false); setFormError(null); }} 
          variant="outlined"
          color="inherit"
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          color="primary"
        >
          Add Inspection
        </Button>
      </DialogActions>
      {/* <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar> */}
    </Dialog>
  );
};