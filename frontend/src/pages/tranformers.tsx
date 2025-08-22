import React from "react";
import { Box, Typography} from "@mui/material";
import InspectionBar from "../components/inspectionBar";
import ThermalImageCard from "../components/thermalimagecard";


const inspectionDetails = {
    id: "0123456",
    transformerNo: "AZ-123",
    poleNo: "2023-10-01",
    branch: "Nugegoda",
    inspectedBy: "John Doe",
    updatedDate: "2023-10-02",
    updatedTime: "10:00 AM",
    status: "In Progress"
};

function Transformers() {
    return (
        <div>
            <Box>
                <Typography variant="h4">Transformer</Typography>
            </Box>
            <Box sx={{ marginTop: 5 }}>
                <InspectionBar inspectionDetails={inspectionDetails} />
            </Box>

          
<Box sx={{ mt: 3, display: "flex", justifyContent: "flex-start", alignItems: "flex-start" }}>
  <Box sx={{ flex: { xs: "1 1 100%", md: "0 0 360px" }, maxWidth: { md: 360 } }}>
    <ThermalImageCard />
  </Box>
</Box>

          
            
        </div>
    );

}

export default Transformers;