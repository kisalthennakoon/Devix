import React from "react";
import { Box, Typography} from "@mui/material";
import InspectionBar from "../components/inspectionBar";


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
        </div>
    );
}

export default Transformers;