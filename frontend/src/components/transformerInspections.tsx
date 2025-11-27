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
  inspectionStatus: "Completed" | "progress" | "pending" | null;
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

  // Helper: build a user-friendly printable HTML record sheet
  const buildRecordHtml = (
    inspectionNo: string,
    recordObj: any | null,
    anomalies: any[] = [],
    imageBase64: string | null = null,
    sourceLabel = 'Record'
  ) => {
    // Normalize incoming imageBase64 if it's a data URL (strip `data:*;base64,` prefix)
    const normalize = (img: string | null | undefined) => {
      if (!img) return null;
      const s = String(img).trim();
      const m = s.match(/^data:\w+\/(png|jpeg|jpg);base64,(.*)$/i);
      if (m && m[2]) return m[2];
      // if it looks like it already is base64 (no data: prefix), return as-is
      return s;
    };
    const roleNestedMap: any = {
      inspector: 'inspectedBy',
      rectifier: 'rectifiedBy',
      reInspector: 'reInspectedBy',
    };

    const suffixMap: any = {
      name: 'Name',
      status: 'StatusOfTransformer',
      voltage: 'ElectricalReadingsVoltage',
      current: 'ElectricalReadingsCurrent',
      recommendations: 'Recommendations',
      remarks: 'Remarks',
    };

    const getField = (role: string, key: keyof typeof suffixMap) => {
      try {
        if (!recordObj) return '';
        // try nested object first
        const nestedKey = roleNestedMap[role];
        const nested = recordObj[nestedKey];
        const flatKey = `${role}${suffixMap[key]}`;
        // try nested structured fields (common names)
        if (nested) {
          // try likely nested key names
          const possible = [
            nested[`${role}Name`],
            nested['inspectorName'],
            nested['name'],
            nested[String(key)],
          ];
          for (const p of possible) if (p) return p;
        }
        // try flat field on recordObj
        if (recordObj[flatKey]) return recordObj[flatKey];
        // fallback: try lowercase role prefixes used earlier (e.g., reInspector -> reInspectorName)
        const altKey = `${role}${suffixMap[key]}`;
        if (recordObj[altKey]) return recordObj[altKey];
        return '';
      } catch (e) {
        return '';
      }
    };

    const row = (label: string, value: any) => `<tr><td style="width:30%;vertical-align:top;padding:8px"><strong>${label}</strong></td><td style="padding:8px">${value || ''}</td></tr>`;

    const anomaliesHtml = (anomalies && anomalies.length)
      ? `<h3 style="margin-top:18px">Anomalies</h3><table style="width:100%;border-collapse:collapse;margin-top:6px">${anomalies.map((a:any,i:number)=>{
          const displayStatus = a.faultStatus || a.anomalyStatus || (a.status ? String(a.status) : 'AI');
          const faultType = a.faultType || a.type || '';
          const faultSeverity = a.faultSeverity || a.severity || '';
          const bbox = a.bbox || a.BBox || '';
          return `<tr><td style="padding:6px;width:40px">${i+1}</td><td style="padding:6px"><strong>Status:</strong> ${displayStatus}<br/><strong>Type:</strong> ${faultType}<br/><strong>Severity:</strong> ${faultSeverity}<br/><strong>BBox:</strong> ${bbox}</td></tr>`;
        }).join('')}</table>`
      : '';

    // Build header and metadata sections (transformer, inspection, upload info)
    const transformer = recordObj?.transformer || recordObj?.recordSheet?.transformer || null;
    const inspectionMeta = recordObj?.inspection || recordObj?.recordSheet?.inspection || null;
    const uploadInfo = {
      thermalUploadedDate: recordObj?.thermalUploadedDate || recordObj?.recordSheet?.thermalUploadedDate || recordObj?.anomalies?.thermalUploadedDate || '',
      thermalUploadedTime: recordObj?.thermalUploadedTime || recordObj?.recordSheet?.thermalUploadedTime || recordObj?.anomalies?.thermalUploadedTime || '',
      thermalUploadedBy: recordObj?.thermalUploadedBy || recordObj?.recordSheet?.thermalUploadedBy || recordObj?.anomalies?.thermalUploadedBy || '',
      baseImageUploadedDate: recordObj?.baseImageUploadedDate || recordObj?.recordSheet?.baseImageUploadedDate || '',
      baseImageUploadedTime: recordObj?.baseImageUploadedTime || recordObj?.recordSheet?.baseImageUploadedTime || '',
    };

    const headerMeta = `
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div>
          <h2 style="margin:0">Thermal Image Inspection Form</h2>
          <div style="color:#666;margin-top:6px">Inspection: ${inspectionNo} ${inspectionMeta && inspectionMeta.inspectionDate ? '| Date: ' + inspectionMeta.inspectionDate : ''}</div>
        </div>
        <div style="text-align:right;color:#666">${sourceLabel}</div>
      </div>
    `;

    const transformerHtml = transformer ? `<div style="margin-top:12px"><h3>Transformer</h3><table style="width:100%;border-collapse:collapse">${row('Transformer No', transformer.transformerNo || '')}${row('Type', transformer.transformerType || '')}${row('Pole No', transformer.transformerPoleNo || '')}${row('Region', transformer.transformerRegion || '')}${row('Location', transformer.transformerLocation || '')}${row('Capacity', transformer.transformerCapacity || '')}</table></div>` : '';

    const inspectionHtml = inspectionMeta ? `<div style="margin-top:12px"><h3>Inspection</h3><table style="width:100%;border-collapse:collapse">${row('Inspection No', inspectionMeta.inspectionNo || '')}${row('Date', inspectionMeta.inspectionDate || '')}${row('Time', inspectionMeta.inspectionTime || '')}${row('Branch', inspectionMeta.inspectionBranch || '')}${row('Status', inspectionMeta.inspectionStatus || '')}${row('Inspected By', inspectionMeta.inspectedby || inspectionMeta.inspectedBy || '')}</table></div>` : '';

    const uploadsHtml = (uploadInfo.thermalUploadedDate || uploadInfo.thermalUploadedTime || uploadInfo.thermalUploadedBy || uploadInfo.baseImageUploadedDate || uploadInfo.baseImageUploadedTime)
      ? `<div style="margin-top:12px"><h3>Uploads</h3><table style="width:100%;border-collapse:collapse">${row('Thermal Uploaded Date', uploadInfo.thermalUploadedDate)}${row('Thermal Uploaded Time', uploadInfo.thermalUploadedTime)}${row('Thermal Uploaded By', uploadInfo.thermalUploadedBy)}${row('Base Image Uploaded Date', uploadInfo.baseImageUploadedDate)}${row('Base Image Uploaded Time', uploadInfo.baseImageUploadedTime)}</table></div>`
      : '';

    // prefer provided imageBase64 argument; otherwise try known fields from recordObj
    const finalImageRaw = imageBase64 || recordObj?.annotatedImage || recordObj?.thermal || recordObj?.anomalies?.thermal || null;
    const finalImage = normalize(finalImageRaw);
    const imageHtml = finalImage ? `<div style="margin-top:16px;text-align:center"><h3>Annotated Image</h3><img style="max-width:100%;border:1px solid #ddd" src="data:image/png;base64,${finalImage}"/></div>` : '';

    const inspectorSection = `<section style="margin-top:12px"><h3>Inspected By</h3><table style="width:100%;border-collapse:collapse">${row('Name', getField('inspector','name'))}${row('Status', getField('inspector','status'))}${row('Voltage', getField('inspector','voltage'))}${row('Current', getField('inspector','current'))}${row('Recommendations', getField('inspector','recommendations'))}${row('Remarks', getField('inspector','remarks'))}</table></section>`;

    const rectifierSection = `<section style="margin-top:12px"><h3>Rectified By</h3><table style="width:100%;border-collapse:collapse">${row('Name', getField('rectifier','name'))}${row('Status', getField('rectifier','status'))}${row('Voltage', getField('rectifier','voltage'))}${row('Current', getField('rectifier','current'))}${row('Recommendations', getField('rectifier','recommendations'))}${row('Remarks', getField('rectifier','remarks'))}</table></section>`;

    const reinspectorSection = `<section style="margin-top:12px"><h3>Re-Inspected By</h3><table style="width:100%;border-collapse:collapse">${row('Name', getField('reInspector','name'))}${row('Status', getField('reInspector','status'))}${row('Voltage', getField('reInspector','voltage'))}${row('Current', getField('reInspector','current'))}${row('Recommendations', getField('reInspector','recommendations'))}${row('Remarks', getField('reInspector','remarks'))}</table></section>`;

    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Record ${inspectionNo}</title><style>body{font-family:Arial,Helvetica,sans-serif;padding:20px;color:#222}h2,h3{margin:6px 0}table td{font-size:14px}</style></head><body>${headerMeta}${transformerHtml}${inspectionHtml}${uploadsHtml}${inspectorSection}${rectifierSection}${reinspectorSection}${imageHtml}${anomaliesHtml}</body></html>`;

    return html;
  };

  // Helper: create an annotated PNG (data URL) from a base thermal image and lists of boxes
  const createAnnotatedDataUrl = async (thermalBase64: string | null | undefined, aiResults: any[] = [], localAnnotations: any[] = []): Promise<string | null> => {
    try {
      if (!thermalBase64) return null;
      const s = String(thermalBase64).trim();
      // ensure we only have raw base64 (no data: prefix)
      const m = s.match(/^data:\w+\/(png|jpeg|jpg);base64,(.*)$/i);
      const raw = m && m[2] ? m[2] : s;
      const img = new Image();
      img.src = `data:image/png;base64,${raw}`;
      await new Promise<void>((res, rej) => {
        img.onload = () => res();
        img.onerror = (e) => rej(e);
      });

      const canvas = document.createElement('canvas');
      const w = img.naturalWidth || img.width || 800;
      const h = img.naturalHeight || img.height || 600;
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      // draw base image
      ctx.drawImage(img, 0, 0, w, h);

      const parseBBox = (b: any) => {
        if (!b) return null;
        if (Array.isArray(b) && b.length >= 4) return b.slice(0,4).map((n:any)=>Number(n));
        if (typeof b === 'string') {
          try {
            const parsed = JSON.parse(b);
            if (Array.isArray(parsed) && parsed.length >= 4) return parsed.slice(0,4).map((n:any)=>Number(n));
          } catch (_) {
            const parts = b.split(',').map(p=>p.trim()).filter(Boolean);
            if (parts.length >= 4) return parts.slice(0,4).map((n:any)=>Number(n));
          }
        }
        return null;
      };

      // draw AI boxes first (red/orange)
      (aiResults || []).forEach((r: any, i: number) => {
        const bb = parseBBox(r.bbox || r.BBox || r.coords || r.boundingBox);
        if (!bb) return;
        const [x,y,wbox,hbox] = bb.map((n:any)=>Number(n));
        const isPotential = /potential/i.test(String(r.faultType || r.type || '')) || /\(Potential\)/i.test(String(r.faultType || ''));
        const stroke = isPotential ? '#FB8C00' : '#E53935';
        // thinner stroke to avoid overlap on exported/printed images
        ctx.lineWidth = Math.max(1, Math.round(Math.max(w, h) / 400));
        ctx.strokeStyle = stroke;
        ctx.strokeRect(x, y, wbox, hbox);
        // index label
        ctx.fillStyle = '#000';
        ctx.font = `${Math.max(12, Math.round(w/80))}px Arial`;
        ctx.fillText(String(i+1), x + 4, Math.max(y + 16, y + 12));
        // confidence pill
        const conf = r.faultConfidence ?? r.confidence ?? null;
        if (conf != null) {
          const txt = `${Math.round(Number(conf)*100)}%`;
          const tw = ctx.measureText(txt).width + 8;
          // neutral background for pill to improve legibility (not bbox color)
          ctx.fillStyle = 'rgba(0,0,0,0.75)';
          ctx.fillRect(x + wbox - tw - 6, y - 18, tw, 18);
          ctx.fillStyle = '#fff';
          ctx.textBaseline = 'middle';
          ctx.fillText(txt, x + wbox - tw - 2, y - 9);
        }
      });

      // draw user/local annotations on top (blue dashed)
      (localAnnotations || []).forEach((a: any) => {
        const bb = parseBBox(a.bbox || a.BBox || a.coords);
        if (!bb) return;
        const [x,y,wbox,hbox] = bb.map((n:any)=>Number(n));
        // thinner dashed stroke for user annotations
        ctx.lineWidth = Math.max(1, Math.round(Math.max(w, h) / 600));
        ctx.strokeStyle = '#1976d2';
        ctx.setLineDash([6,4]);
        ctx.strokeRect(x, y, wbox, hbox);
        ctx.setLineDash([]);
      });

      return canvas.toDataURL('image/png');
    } catch (e) {
      console.warn('createAnnotatedDataUrl failed', e);
      return null;
    }
  };

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
        const sheetMeta = data.recordSheet || data;

        // If the server returned an annotated image (final annotated PNG), prefer it.
        const serverAnnotatedRaw =
          (sheetMeta && (sheetMeta.annotatedImage || sheetMeta.annotatedImg)) ||
          data.annotatedImage ||
          data.annotatedImg ||
          imgs.annotatedImage ||
          imgs.annotatedImg ||
          null;
        // prefer local annotated image if server didn't provide one
        let serverAnnotated = serverAnnotatedRaw;
        if (!serverAnnotated) {
          try {
            const rawLocal = localStorage.getItem(`maintenance_record_${inspectionNo}`);
            if (rawLocal) {
              const recLocal = JSON.parse(rawLocal);
              if (recLocal && recLocal.annotatedImage) serverAnnotated = recLocal.annotatedImage;
            }
          } catch (e) {
            // ignore
          }
        }
        // normalize possible data URL in serverAnnotated
        const normalizeImg = (img: any) => {
          if (!img) return null;
          const s = String(img).trim();
          const m = s.match(/^data:\w+\/(png|jpeg|jpg);base64,(.*)$/i);
          if (m && m[2]) return m[2];
          return s;
        };
        let serverAnnotatedNormalized = normalizeImg(serverAnnotated);
        // If server didn't provide an annotated image but we have a raw thermal + anomalies,
        // generate an annotated image client-side so printable record shows boxes.
        if (!serverAnnotatedNormalized && imgs && imgs.thermal && anomalies && anomalies.length) {
          try {
            const gen = await createAnnotatedDataUrl(imgs.thermal, anomalies, []);
            if (gen) serverAnnotatedNormalized = normalizeImg(gen) || serverAnnotatedNormalized;
          } catch (e) {
            // ignore generation failures
          }
        }

        let html: string;
        if (sheetMeta && typeof sheetMeta === 'string' && sheetMeta.trim().startsWith('<')) {
          html = sheetMeta;
        } else {
          // pass annotated image if available, otherwise fall back to the raw thermal image
          html = buildRecordHtml(inspectionNo, sheetMeta, anomalies, serverAnnotatedNormalized || normalizeImg(imgs.thermal), 'Server Record');
        }
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
      // try to prefer an annotated image if the inspectionImage endpoint produced one
      let inspectionAnnotatedRaw = imgs2.annotatedImage || imgs2.annotatedImg || null;
      // if not present, prefer local captured annotated image
      if (!inspectionAnnotatedRaw) {
        try {
          const rawLocal = localStorage.getItem(`maintenance_record_${inspectionNo}`);
          if (rawLocal) {
            const recLocal = JSON.parse(rawLocal);
            if (recLocal && recLocal.annotatedImage) inspectionAnnotatedRaw = recLocal.annotatedImage;
          }
        } catch (_) {}
      }
      const normalizeImg = (img: any) => {
        if (!img) return null;
        const s = String(img).trim();
        const m = s.match(/^data:\w+\/(png|jpeg|jpg);base64,(.*)$/i);
        if (m && m[2]) return m[2];
        return s;
      };
      // Try to generate an annotated inspection image if only the raw thermal is available
      let inspectionAnnotated = normalizeImg(inspectionAnnotatedRaw) || null;
      if (!inspectionAnnotated && imgs2 && imgs2.thermal && anomalies2 && anomalies2.length) {
        try {
          const gen2 = await createAnnotatedDataUrl(imgs2.thermal, anomalies2, []);
          if (gen2) inspectionAnnotated = normalizeImg(gen2) || inspectionAnnotated;
        } catch (e) {
          // ignore
        }
      }
      if (!inspectionAnnotated) inspectionAnnotated = normalizeImg(imgs2.thermal);
      const html2 = buildRecordHtml(inspectionNo, null, anomalies2, inspectionAnnotated, 'Inspection Image');
      setRecordHtml(html2);
      setRecordDialogOpen(true);
      return;
    } catch (err) {
      // If server/fallback fetch failed, check for a locally-saved record in localStorage
      try {
        const raw = localStorage.getItem(`maintenance_record_${inspectionNo}`);
        if (raw) {
            const rec = JSON.parse(raw);
            // try to extract annotated image from local record (stored as base64 without prefix)
            let annotated = rec.annotatedImage ? rec.annotatedImage : null;
            const localAnomalies = rec.annotations || [];
            // If local record lacks an annotated image but we have a base thermal + anomalies, try to generate
            if (!annotated && (rec.thermal || rec.baseImage || rec.rawThermal) && localAnomalies && localAnomalies.length) {
              try {
                const base = rec.thermal || rec.baseImage || rec.rawThermal;
                const genLocal = await createAnnotatedDataUrl(base, rec.aiResults || rec.anomalies || [], localAnomalies);
                if (genLocal) annotated = (String(genLocal).match(/^data:\w+\/(png|jpeg|jpg);base64,(.*)$/i) || [])[2] || genLocal;
              } catch (e) {
                // ignore
              }
            }
            const htmlLocal = buildRecordHtml(inspectionNo, rec, localAnomalies, annotated, 'Local Record');
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