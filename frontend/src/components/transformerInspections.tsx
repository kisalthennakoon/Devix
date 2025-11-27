import { useEffect, useState, useRef } from "react";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>(
    {
      open: false,
      message: "",
      severity: "success",
    }
  );

  // Record sheet dialog state
  const [recordDialogOpen, setRecordDialogOpen] = useState(false);
  const [recordHtml, setRecordHtml] = useState<string | null>(null);
  const [recordLoading, setRecordLoading] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [currentRecordInspectionNo, setCurrentRecordInspectionNo] = useState<string | null>(null);

  const viewRecordSheet = async (inspectionNo: string) => {
    setCurrentRecordInspectionNo(inspectionNo);
    setRecordLoading(true);
    try {
      // Try backend record endpoint first
      try {
        const r = await axios.get(`/api/inspection/getRecord/${inspectionNo}`);
        const data = r.data;
        // Build HTML using returned structure if available
        const anomalies = (data.anomalies && data.anomalies.aiResults) || [];
        const imgs = data.anomalies || {};
        const sheetMeta = data.recordSheet || null;

        const html = `<!doctype html><html><head><meta charset="utf-8"><title>Record ${inspectionNo}</title><style>body{font-family:Arial;padding:16px}img{max-width:100%}</style></head><body><h2>Thermal Image Inspection Form</h2><h3>Inspection ${inspectionNo}</h3><pre>${sheetMeta ? JSON.stringify(sheetMeta, null, 2) : ''}</pre><h4>Anomalies</h4><table border="1" cellpadding="6"><thead><tr><th>#</th><th>Type</th><th>Severity</th><th>BBox</th></tr></thead><tbody>${anomalies.map((a:any,i:number)=>`<tr><td>${i+1}</td><td>${a.faultType||''}</td><td>${a.faultSeverity||''}</td><td>${a.bbox||''}</td></tr>`).join('')}</tbody></table>${imgs.thermal?`<h4>Thermal Image</h4><img src="data:image/png;base64,${imgs.thermal}"/>`:''}</body></html>`;
        setRecordHtml(html);
        setRecordDialogOpen(true);
        setRecordLoading(false);
        return;
      } catch (e) {
        // backend record endpoint not available — fallback
      }

      // Fallback: fetch inspection image data
      const r2 = await axios.get(`/api/inspectionImage/get/${inspectionNo}`);
      const imgs2 = r2.data || {};
      const anomalies2 = imgs2.aiResults || [];
      const html2 = `<!doctype html><html><head><meta charset="utf-8"><title>Record ${inspectionNo}</title><style>body{font-family:Arial;padding:16px}img{max-width:100%}</style></head><body><h2>Thermal Image Inspection Form</h2><h3>Inspection ${inspectionNo}</h3><h4>Anomalies</h4><table border="1" cellpadding="6"><thead><tr><th>#</th><th>Type</th><th>Severity</th><th>BBox</th></tr></thead><tbody>${anomalies2.map((a:any,i:number)=>`<tr><td>${i+1}</td><td>${a.faultType||''}</td><td>${a.faultSeverity||''}</td><td>${a.bbox||''}</td></tr>`).join('')}</tbody></table>${imgs2.thermal?`<h4>Thermal Image</h4><img src="data:image/png;base64,${imgs2.thermal}"/>`:''}</body></html>`;
      setRecordHtml(html2);
      setRecordDialogOpen(true);
      return;
    } catch (err) {
      // If server/fallback fetch failed, check for a locally-saved record in localStorage
      try {
        const raw = localStorage.getItem(`maintenance_record_${inspectionNo}`);
        if (raw) {
          const rec = JSON.parse(raw);
          const inspected = rec.inspectedBy || {};
          const rectified = rec.rectifiedBy || {};
          const reinspected = rec.reInspectedBy || {};
          // prefer annotated image if available
          const annotated = rec.annotatedImage ? `data:image/png;base64,${rec.annotatedImage}` : null;
          const htmlLocal = `<!doctype html><html><head><meta charset="utf-8"><title>Local Record ${inspectionNo}</title><style>body{font-family:Arial;padding:16px}h3{margin-bottom:4px}table{width:100%;border-collapse:collapse;margin-top:8px}td{padding:6px;border:1px solid #ddd}section{margin-bottom:12px}.annot{max-width:100%;border:1px solid #ccc;margin-top:8px}</style></head><body><h2>Maintenance Record (Local)</h2><h3>Inspection ${inspectionNo}</h3>${annotated?`<div><h4>Annotated Image</h4><img class="annot" src="${annotated}"/></div>`:''}<section><h4>Inspected By</h4><table><tr><td><strong>Name</strong></td><td>${inspected.inspectorName || ''}</td></tr><tr><td><strong>Status</strong></td><td>${inspected.statusOfTransformer || ''}</td></tr><tr><td><strong>Voltage</strong></td><td>${inspected.voltage || ''}</td></tr><tr><td><strong>Current</strong></td><td>${inspected.current || ''}</td></tr><tr><td><strong>Recommendations</strong></td><td>${inspected.recommendedAction || ''}</td></tr><tr><td><strong>Remarks</strong></td><td>${inspected.additionalRemarks || ''}</td></tr></table></section><section><h4>Rectified By</h4><table><tr><td><strong>Name</strong></td><td>${rectified.inspectorName || ''}</td></tr><tr><td><strong>Status</strong></td><td>${rectified.statusOfTransformer || ''}</td></tr><tr><td><strong>Voltage</strong></td><td>${rectified.voltage || ''}</td></tr><tr><td><strong>Current</strong></td><td>${rectified.current || ''}</td></tr><tr><td><strong>Recommendations</strong></td><td>${rectified.recommendedAction || ''}</td></tr><tr><td><strong>Remarks</strong></td><td>${rectified.additionalRemarks || ''}</td></tr></table></section><section><h4>Re-Inspected By</h4><table><tr><td><strong>Name</strong></td><td>${reinspected.inspectorName || ''}</td></tr><tr><td><strong>Status</strong></td><td>${reinspected.statusOfTransformer || ''}</td></tr><tr><td><strong>Voltage</strong></td><td>${reinspected.voltage || ''}</td></tr><tr><td><strong>Current</strong></td><td>${reinspected.current || ''}</td></tr><tr><td><strong>Recommendations</strong></td><td>${reinspected.reInspectedBy || ''}</td></tr><tr><td><strong>Remarks</strong></td><td>${reinspected.additionalRemarks || ''}</td></tr></table></section></body></html>`;
          setRecordHtml(htmlLocal);
          setRecordDialogOpen(true);
          setRecordLoading(false);
          return;
        }
      } catch (e) {
        console.warn('Failed to load local record', e);
      }

      console.error('Failed to load record', err);
      setSnackbar({ open: true, message: 'Failed to load record sheet', severity: 'error' });
    } finally {
      setRecordLoading(false);
    }
  };

  useEffect(() => {
    const handler = (ev: any) => {
      const insNo = ev?.detail?.inspectionNo;
      if (!insNo) return;
      // refresh inspections list
      fetchInspections();
      // if the preview dialog is open for this inspection, reload it
      if (insNo === currentRecordInspectionNo && recordDialogOpen) {
        viewRecordSheet(insNo);
      }
    };
    window.addEventListener('maintenanceRecordUpdated', handler as EventListener);
    return () => window.removeEventListener('maintenanceRecordUpdated', handler as EventListener);
  }, [currentRecordInspectionNo, recordDialogOpen]);



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
                        
                        <Button
                          variant="outlined"
                          size="small"
                          sx={{ ml: 1 }}
                          onClick={() => viewRecordSheet(inspection.inspectionNo)}
                        >
                          View Record
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
        transformerNoInput = {transformerNo ?? ''}
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        setSnackbar={setSnackbar} // pass this as a prop
        onInspectionAdded={fetchInspections} 
      />

      {/* Record Sheet Dialog (iframe preview + print) */}
      <Dialog open={recordDialogOpen} onClose={() => setRecordDialogOpen(false)} fullWidth maxWidth="lg">
        <DialogTitle>Thermal Image Inspection Form</DialogTitle>
        <DialogContent dividers sx={{ height: '80vh', p: 0 }}>
          {recordHtml ? (
            <iframe
              ref={iframeRef}
              title="record-preview"
              srcDoc={recordHtml}
              style={{ width: '100%', height: '100%', border: 'none' }}
            />
          ) : (
            <Box sx={{ p: 3 }}>
              <Typography>Loading...</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRecordDialogOpen(false)}>Close</Button>
          <Button onClick={() => { if (iframeRef.current && iframeRef.current.contentWindow) iframeRef.current.contentWindow.print(); }} variant="contained">Print / Download PDF</Button>
        </DialogActions>
      </Dialog>

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