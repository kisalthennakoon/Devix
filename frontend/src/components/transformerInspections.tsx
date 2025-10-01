import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Grid,
  IconButton,
  Chip,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Star,
  Visibility,
  Settings,
  Build,
  StarBorder
} from '@mui/icons-material';
import { StatusBadge } from "./statusBadge";
import { AddInspectionModal } from "./addInspections";
import axios from "axios";

interface Inspection {
  id: string;
  inspectionNo: string;
  inspectedDate: string;
  inspectionTime: string;
  maintenanceDate: string | null;
  inspectionStatus: string;
  status: string; // Added to fix the error
  transformerNo: string;
  inspectionBranch: string;
  isFavorite: boolean;
  inspectedby: string;
}

type ApiInspection = {
  inspectionNo: string;
  inspectionDate: string;
  inspectionTime: string;
  inspectionBranch: string;
  transformerNo: string;
  inspectionStatus: "completed" | "progress" | "pending" | null;
};

type Props = {
  transformerNo?: string;
  onView?: (inspection: Inspection) => void; 
};

// const mockInspections: Inspection[] = [
//   {
//     id: "1",
//     inspectionNo: "000123589",
//     inspectedDate: "Mon(21), May, 2023 12:55pm",
//     maintenanceDate: null,
//     status: "progress",
//     isFavorite: true
//   },
//   {
//     id: "2",
//     inspectionNo: "000123589",
//     inspectedDate: "Mon(21), May, 2023 12:55pm",
//     maintenanceDate: null,
//     status: "progress",
//     isFavorite: false
//   },
//   {
//     id: "3",
//     inspectionNo: "000123589",
//     inspectedDate: "Mon(21), May, 2023 12:55pm",
//     maintenanceDate: null,
//     status: "pending",
//     isFavorite: false
//   },
//   {
//     id: "4",
//     inspectionNo: "000123589",
//     inspectedDate: "Mon(21), May, 2023 12:55pm",
//     maintenanceDate: "Mon(21), May, 2023 12:55pm",
//     status: "completed",
//     isFavorite: false
//   },
//   {
//     id: "5",
//     inspectionNo: "000123589",
//     inspectedDate: "Mon(21), May, 2023 12:55pm",
//     maintenanceDate: "Mon(21), May, 2023 12:55pm",
//     status: "completed",
//     isFavorite: false
//   },
//   {
//     id: "6",
//     inspectionNo: "000123589",
//     inspectedDate: "Mon(21), May, 2023 12:55pm",
//     maintenanceDate: "Mon(21), May, 2023 12:55pm",
//     status: "completed",
//     isFavorite: false
//   },
//   {
//     id: "7",
//     inspectionNo: "000123589",
//     inspectedDate: "Mon(21), May, 2023 12:55pm",
//     maintenanceDate: "Mon(21), May, 2023 12:55pm",
//     status: "completed",
//     isFavorite: false
//   },
//   {
//     id: "8",
//     inspectionNo: "000123589",
//     inspectedDate: "Mon(21), May, 2023 12:55pm",
//     maintenanceDate: "Mon(21), May, 2023 12:55pm",
//     status: "completed",
//     isFavorite: false
//   },
//   {
//     id: "9",
//     inspectionNo: "000123589",
//     inspectedDate: "Mon(21), May, 2023 12:55pm",
//     maintenanceDate: "Mon(21), May, 2023 12:55pm",
//     status: "completed",
//     isFavorite: false
//   }
// ];

export const TransformerInspections = ({ transformerNo, onView }: Props) => { 
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const toggleFavorite = (id: string) => {
    // Handle favorite toggle
    console.log("Toggle favorite for:", id);
  };

  const [inspectionsData, setInspectionsData] = useState<Inspection[]>([]);

// useEffect(() => {
//     axios
//       .get(`/api/inspection/getAll/${transformerNo}`)
//       .then((res) => {
//         const formattedData = res.data.map((item: any, idx: number) => ({
//           id: item.inspectionNo || String(idx),
//           inspectionNo: item.inspectionNo,
//           inspectedDate: item.inspectionDate + (item.inspectionTime ? ` ${item.inspectionTime}` : ""),
//           inspectionTime: item.inspectionTime,
//           maintenanceDate: null, 
//           status: item.inspectionStatus ?? "pending",
//           transformerNo: item.transformerNo,
//           inspectionBranch: item.inspectionBranch,
//           isFavorite: false, // Default value
//         }));
//         setInspectionsData(formattedData);
//       })
//       .catch((err) => console.error("Failed to fetch inspections:", err));
//   }, []);

const fetchInspections = () => {
  axios
    .get(`/api/inspection/getAll/${transformerNo}`)
    .then((res) => {
      const formattedData = res.data.map((item: any, idx: number) => ({
        id: item.inspectionNo || String(idx),
        inspectionNo: item.inspectionNo,
        inspectedDate: item.inspectionDate + (item.inspectionTime ? ` ${item.inspectionTime}` : ""),
        inspectionTime: item.inspectionTime,
        inspectedby: item.inspectedby,
        maintenanceDate: null,
        status: item.inspectionStatus ?? "pending",
        transformerNo: item.transformerNo,
        inspectionBranch: item.inspectionBranch,
        isFavorite: false,
      }));
      setInspectionsData(formattedData);
    })
    .catch((err) => console.error("Failed to fetch inspections:", err));
};

useEffect(() => {
  fetchInspections();
}, []);

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
      open: false,
      message: "",
      severity: "success",
    });



  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', p: 3 }}>
      <Box sx={{ maxWidth: '1200px', mx: 'auto' }}>

        {/* Inspections Section */}
        <Card sx={{ boxShadow: 2 }}>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ p: 3, borderBottom: '1px solid #e0e0e0' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" fontWeight="bold">
                  Transformer Inspections
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => setIsAddModalOpen(true)}
                  sx={{ bgcolor: '#1976d2', '&:hover': { bgcolor: '#1565c0' } }}
                >
                  Add Inspection
                </Button>
              </Box>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 'bold'}}>Inspection No</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Inspected Date</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Maintenance Date</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {inspectionsData.length > 0 ? (
                    inspectionsData.map((inspection, index) => (
                      <TableRow 
                        key={inspection.id} 
                        sx={{ 
                          '&:hover': { bgcolor: '#f5f5f5' },
                          bgcolor: index % 2 === 0 ? 'white' : 'rgba(0,0,0,0.02)',
                          height: 20
                        }}
                      >
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <IconButton
                              size="small"
                              onClick={() => toggleFavorite(inspection.id)}
                            >
                              {inspection.isFavorite ? (
                                <Star sx={{ fontSize: 14, color: '#ffc107' }} />
                              ) : (
                                <StarBorder sx={{ fontSize: 14, color: 'text.secondary' }} />
                              )}
                            </IconButton>
                            <Typography sx={{fontSize: 13}}>
                              {inspection.inspectionNo}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography color="text.secondary" sx={{ fontSize: 13}}>
                            {inspection.inspectedDate}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography color="text.secondary" sx={{ fontSize: 13}}>
                            {inspection.maintenanceDate || "-"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={inspection.status} />
                        </TableCell>
                        <TableCell>
                          <Button
                          variant="contained"
                          size="small"
                          sx={{ bgcolor: '#1976d2', '&:hover': { bgcolor: '#1565c0' } }}
                          onClick={() => onView?.(inspection)}  // NEW
                        >
                          View
                        </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : ( 
                    <TableRow>
                      <TableCell colSpan={5} sx={{ textAlign: 'center' }}>
                        No inspections found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Box>

      <AddInspectionModal 
        transformerNoInput = {transformerNo}
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        setSnackbar={setSnackbar} // pass this as a prop
        onInspectionAdded={fetchInspections} 
      />

      <Snackbar
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
      </Snackbar>
    </Box>
  );
};