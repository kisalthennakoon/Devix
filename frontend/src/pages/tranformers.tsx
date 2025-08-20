import React from "react";
import { Box, Typography} from "@mui/material";
import InspectionBar from "../components/inspectionBar";
import { TransformerInspections } from "../components/transformerInspections";


const inspectionDetails = {
    id: "0123456",
    transformerNo: "AZ-8370",
    poleNo: "EN-122-A",
    branch: "Nugegoda",
    inspectedBy: "John Doe",
    updatedDate: "Mon(21),May,2023",
    updatedTime: "12:55 PM",
    status: "In Progress",
    capacity: "102.97",
    type: "Bulk",
    noOfFreeders: "2",
    location: "Keels, Embuldeniya"
};

function Transformers() {
    return (
        <div>
            <Box sx={{ marginTop: 1 }}>
                <InspectionBar inspectionDetails={inspectionDetails} />
            </Box>
        <TransformerInspections />
        </div>
    );
}

export default Transformers;