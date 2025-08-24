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



// const transformersData: TransformerDetails[] = [
//   { no: "AZ-8890", pole: "EN-122-A", region: "Nugegoda", type: "Bulk" },
//   { no: "AZ-1649", pole: "EN-122-A", region: "Nugegoda", type: "Bulk" },
//   { no: "AZ-7316", pole: "EN-122-B", region: "Nugegoda", type: "Bulk" },
//   { no: "AZ-4613", pole: "EN-122-B", region: "Maharagama", type: "Bulk" },
//   { no: "AX-8993", pole: "EN-122-A", region: "Nugegoda", type: "Distribution" },
//   { no: "AY-8790", pole: "EN-122-B", region: "Maharagama", type: "Distribution" },
//   { no: "AY-8798", pole: "EN-122-A", region: "Maharagama", type: "Distribution" },
//   { no: "AY-8799", pole: "EN-122-B", region: "Maharagama", type: "Distribution" },
//   { no: "AZ-88901", pole: "EN-122-A", region: "Nugegoda", type: "Bulk" },
//   { no: "AZ-16491", pole: "EN-122-A", region: "Nugegoda", type: "Bulk" },
//   { no: "AZ-731611", pole: "EN-122-B", region: "Nugegoda", type: "Bulk" },
//   { no: "AZ-4613111", pole: "EN-122-B", region: "Maharagama", type: "Bulk" },
//   { no: "AX-89931111", pole: "EN-122-A", region: "Nugegoda", type: "Distribution" },
//   { no: "AY-87902222", pole: "EN-122-B", region: "Maharagama", type: "Distribution" },
//   { no: "AY-87981123", pole: "EN-122-A", region: "Maharagama", type: "Distribution" },
//   { no: "AY-87990988", pole: "EN-122-B", region: "Maharagama", type: "Distribution" },
// ];



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

  // const [transformersData, setTransformersData] = useState<TransformerDetails[]>([]);
  
  // useEffect(() => {
  //   axios.get("https://automatic-pancake-wrrpg66ggvj535gq-8080.app.github.dev/api/transformer/getAll")
  //     .then((res) => setTransformersData(res.data))
  //     .catch((err) => console.error("Failed to fetch transformers:", err));
  // }, []);

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
          />
          {/* <ThermalImageCard
           transformerNo = {selected.transformerNo}
           inspectionNo = {selectedInspection.inspectionNo}
           /> */}
           <Comparison
            inspectionNo = {selectedInspection.inspectionNo}
           />
        
        </Box>
      )}
    </div>
  );
}
export default Transformers;