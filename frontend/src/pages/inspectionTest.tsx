import { Box} from "@mui/material";
import TransformerHead from "../components/transformerHead";
import { TransformerInspections } from "../components/transformerInspections";


const transformerDetails = {
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

function InspectionTest() {
    return (
        <div>
            <Box sx={{ marginTop: 1 }}>
                <TransformerHead transformerDetails={transformerDetails} onBaselineClick={() => alert('Baseline Image clicked!')} />
            </Box>
        <TransformerInspections />
        </div>
    );
}

export default InspectionTest;