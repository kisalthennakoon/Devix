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
  Grid
} from '@mui/material';
import { useState } from "react";

interface AddInspectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddInspectionModal = ({ open, onOpenChange }: AddInspectionModalProps) => {
  const [branch, setBranch] = useState('');
  const [transformerNo, setTransformerNo] = useState('');
  const [inspectionDate, setInspectionDate] = useState<Date | null>(null);
  const [time, setTime] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Adding new inspection...");
    onOpenChange(false);
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
      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button 
          onClick={() => onOpenChange(false)} 
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
    </Dialog>
  );
};