import React, { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import TransformerTable from "../components/transformerTable";
import TransformerHead from "../components/transformerHead";
import { TransformerInspections } from "../components/transformerInspections";
import type { TransformerDetails } from "../components/transformerTable";
import InspectionBar from "../components/inspectionBar";
import ThermalImageCard from "../components/thermalimagecard";
import axios from "axios";
import ThermalImageComparison from "../components/thermalimageComparison";
import Comparison from "../components/comparison";



function Transformers() {

  const [selected, setSelected] = useState<TransformerDetails | null>(null);
  type SelectedInspection = {
    id: string;
    inspectionNo: string;
    inspectedDate: string;
    inspectionTime: string;
    maintenanceDate: string | null;
    inspectionStatus: "in progress" | null;
    transformerNo: string;
    inspectionBranch: string;
    isFavorite: boolean;
  };
  const [selectedInspection, setSelectedInspection] = useState<SelectedInspection | null>(null); // NEW
  // adapter to satisfy your existing TransformerHead props shape
  const toHeadProps = (t: TransformerDetails) => ({
    id: t.transformerNo,
    transformerNo: t.transformerNo,
    poleNo: t.transformerPoleNo,
    region: t.transformerRegion,
    location: t.transformerLocation,
    inspectedBy: "-",
    updatedDate: "-",
    updatedTime: "-",
    status: "-",
    capacity: "-",
    type: t.transformerType,
    noOfFreeders: "-"
  });

  const toInspectionBarProps = (t: TransformerDetails, i: SelectedInspection) => ({
    id: i.inspectionNo,
    transformerNo: t.transformerNo,
    poleNo: t.transformerPoleNo,
    branch: i.inspectionBranch,
    inspectedBy: "-",
    updatedDate: i.inspectedDate,
    updatedTime: "",
    status: i.inspectionStatus || "in progress",

  });

  const [comparisonKey, setComparisonKey] = useState(0);

  const handleComparisonRefresh = () => setComparisonKey(k => k + 1);



  return (
    <div>
      <Box>
        <Typography variant="h4">Transformer</Typography>
      </Box>

      {/* List view */}
      {!selected && (
        <Box sx={{ mt: 5 }}>
          <TransformerTable
            // transformers={transformersData}
            onView={(t) => setSelected(t)}     // ← open details
          />
        </Box>
      )}

      {/* Details view */}
      {selected && !selectedInspection && (
        <Box sx={{ mt: 3, display: "grid", gap: 3 }}>
          <TransformerHead
            transformerDetails={toHeadProps(selected)}
            onBack={() => setSelected(null)}
            onBaselineClick={() => console.log("Baseline clicked")}
          />
          <TransformerInspections
            transformerNo={selected.transformerNo}
            onView={(ins) => setSelectedInspection(ins)}
          />
        </Box>
      )}
      {selected && selectedInspection && (
        <Box sx={{ mt: 3, display: "grid", gap: 3 }}>
          <InspectionBar
            inspectionDetails={toInspectionBarProps(selected, selectedInspection)}
            onBack={() => setSelectedInspection(null)}
            onBaselineClick={() => {/* open your baseline modal later */ }}
            onRefresh={handleComparisonRefresh}
          />
          {/* <ThermalImageCard
           transformerNo = {selected.transformerNo}
           inspectionNo = {selectedInspection.inspectionNo}
           /> */}
          <Comparison
            key={comparisonKey}
            inspectionNo={selectedInspection.inspectionNo}
            transformerNo={selected.transformerNo}
            onRefresh={handleComparisonRefresh}
          />

        </Box>
      )}
    </div>
  );
}
export default Transformers;