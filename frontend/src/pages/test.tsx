import { Typography, Box } from "@mui/material";
import TransformerTable from "../components/TestComponent";
import type { TransformerDetails } from "../components/TestComponent"; 



const transformersData: TransformerDetails[] = [
  { no: "AZ-8890", pole: "EN-122-A", region: "Nugegoda", type: "Bulk" },
  { no: "AZ-1649", pole: "EN-122-A", region: "Nugegoda", type: "Bulk" },
  { no: "AZ-7316", pole: "EN-122-B", region: "Nugegoda", type: "Bulk" },
  { no: "AZ-4613", pole: "EN-122-B", region: "Maharagama", type: "Bulk" },
  { no: "AX-8993", pole: "EN-122-A", region: "Nugegoda", type: "Distribution" },
  { no: "AY-8790", pole: "EN-122-B", region: "Maharagama", type: "Distribution" },
  { no: "AY-8798", pole: "EN-122-A", region: "Maharagama", type: "Distribution" },
  { no: "AY-8799", pole: "EN-122-B", region: "Maharagama", type: "Distribution" },
  { no: "AZ-88901", pole: "EN-122-A", region: "Nugegoda", type: "Bulk" },
  { no: "AZ-16491", pole: "EN-122-A", region: "Nugegoda", type: "Bulk" },
  { no: "AZ-731611", pole: "EN-122-B", region: "Nugegoda", type: "Bulk" },
  { no: "AZ-4613111", pole: "EN-122-B", region: "Maharagama", type: "Bulk" },
  { no: "AX-89931111", pole: "EN-122-A", region: "Nugegoda", type: "Distribution" },
  { no: "AY-87902222", pole: "EN-122-B", region: "Maharagama", type: "Distribution" },
  { no: "AY-87981123", pole: "EN-122-A", region: "Maharagama", type: "Distribution" },
  { no: "AY-87990988", pole: "EN-122-B", region: "Maharagama", type: "Distribution" },
];


function TestTransformersPage() {
  return (
    <div>
      <Box>
        <Typography variant="h4">Transformers</Typography>
      </Box>
      <Box sx={{ marginTop: 5 }}>
        <TransformerTable transformers={transformersData} />
      </Box>
    </div>
  );
}

export default TestTransformersPage;
