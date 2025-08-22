import { useState } from "react";
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
  Chip
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

interface Inspection {
  id: string;
  inspectionNo: string;
  inspectedDate: string;
  maintenanceDate: string | null;
  status: "completed" | "progress" | "pending";
  isFavorite: boolean;
}
type Props = {
  onView?: (inspection: Inspection) => void; 
};

const mockInspections: Inspection[] = [
  {
    id: "1",
    inspectionNo: "000123589",
    inspectedDate: "Mon(21), May, 2023 12:55pm",
    maintenanceDate: null,
    status: "progress",
    isFavorite: true
  },
  {
    id: "2",
    inspectionNo: "000123589",
    inspectedDate: "Mon(21), May, 2023 12:55pm",
    maintenanceDate: null,
    status: "progress",
    isFavorite: false
  },
  {
    id: "3",
    inspectionNo: "000123589",
    inspectedDate: "Mon(21), May, 2023 12:55pm",
    maintenanceDate: null,
    status: "pending",
    isFavorite: false
  },
  {
    id: "4",
    inspectionNo: "000123589",
    inspectedDate: "Mon(21), May, 2023 12:55pm",
    maintenanceDate: "Mon(21), May, 2023 12:55pm",
    status: "completed",
    isFavorite: false
  },
  {
    id: "5",
    inspectionNo: "000123589",
    inspectedDate: "Mon(21), May, 2023 12:55pm",
    maintenanceDate: "Mon(21), May, 2023 12:55pm",
    status: "completed",
    isFavorite: false
  },
  {
    id: "6",
    inspectionNo: "000123589",
    inspectedDate: "Mon(21), May, 2023 12:55pm",
    maintenanceDate: "Mon(21), May, 2023 12:55pm",
    status: "completed",
    isFavorite: false
  },
  {
    id: "7",
    inspectionNo: "000123589",
    inspectedDate: "Mon(21), May, 2023 12:55pm",
    maintenanceDate: "Mon(21), May, 2023 12:55pm",
    status: "completed",
    isFavorite: false
  },
  {
    id: "8",
    inspectionNo: "000123589",
    inspectedDate: "Mon(21), May, 2023 12:55pm",
    maintenanceDate: "Mon(21), May, 2023 12:55pm",
    status: "completed",
    isFavorite: false
  },
  {
    id: "9",
    inspectionNo: "000123589",
    inspectedDate: "Mon(21), May, 2023 12:55pm",
    maintenanceDate: "Mon(21), May, 2023 12:55pm",
    status: "completed",
    isFavorite: false
  }
];

export const TransformerInspections = ({ onView }: Props) => { 
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const toggleFavorite = (id: string) => {
    // Handle favorite toggle
    console.log("Toggle favorite for:", id);
  };

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
                  {mockInspections.map((inspection, index) => (
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
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Box>

      <AddInspectionModal 
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
      />
    </Box>
  );
};