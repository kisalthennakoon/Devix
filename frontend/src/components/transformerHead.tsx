import { Box, Button, Typography, IconButton } from "@mui/material";
import ImageIcon from '@mui/icons-material/Image';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import { Navigation } from "@mui/icons-material";

interface transformerDetails {
    id: string;
    transformerNo: string;
    poleNo: string;
    branch: string;
    inspectedBy: string;
    updatedDate: string;
    updatedTime: string;
    status: string;
    capacity: string;
    noOfFreeders: string;
    type: string;
    location: string;
}

type InspectionBarProps = {
    transformerDetails: transformerDetails;
    onBaselineClick?: () => void;
};

function TransformerHead({transformerDetails, onBaselineClick}: InspectionBarProps) {
    return (
        <Box sx={{ backgroundColor: '#ffffffff', boxShadow: 5, borderRadius: 2, p: 2 }}>

            <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                        <Button variant="contained" color="primary" sx={{ marginRight: 2, width: 'fit-content' }} onClick={() => alert('Back clicked!')}>
                            <ChevronLeftIcon />
                        </Button>
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                                {transformerDetails.transformerNo}
                            </Typography>
                            <Typography variant="subtitle1" sx={{ fontSize: 12, color: '#666', display: 'flex', alignItems: 'center' }}>
                                {transformerDetails.branch} <Navigation sx={{ color: 'red', fontSize: 16, mr: 0.5 }} /> {transformerDetails.location}
                            </Typography>
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, mt: 2 }}>
                        {[
                            { title: 'Pole No', value: transformerDetails.poleNo },
                            { title: 'Capacity', value: transformerDetails.capacity },
                            { title: 'Type', value: transformerDetails.type },
                            { title: 'No. of Freeders', value: transformerDetails.noOfFreeders}
                        ].map((item, idx) => (
                            <Box key={idx} sx={{ width: 100, height: 50, backgroundColor: '#e0e0e0', borderRadius: 2, boxShadow: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', p: 1 }}>

                                <Typography variant="body2" sx={{ fontSize: 18, fontWeight: "bold" }}>
                                    {item.value}
                                </Typography>

                                <Typography variant="subtitle2" sx={{ fontSize: 12, color: '#666' }}>
                                    {item.title}
                                </Typography>

                            </Box>
                        ))}
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-end', marginLeft: 'auto' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                        <Box>
                            <Typography variant="subtitle1" sx={{ fontSize: 12, color: '#666' }}>
                                Last Inspected Date: {transformerDetails.updatedDate} {transformerDetails.updatedTime}
                            </Typography>
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, backgroundColor: '#e0e0e0', borderRadius: 2, p: 1 }}>
                        <Button
                            size="small"
                            startIcon={<ImageIcon />}
                            onClick={onBaselineClick}
                            sx={{ mr: 1, textTransform: 'none' }}
                            >
                                Baseline Image
                        </Button>   
                        <IconButton aria-label="view" color="primary" onClick={() => alert('View clicked!')} sx={{ mr: 1 }}>
                            <VisibilityIcon />
                        </IconButton>
                        <IconButton aria-label="delete" color="error" onClick={() => alert('Delete clicked!')}>
                            <DeleteIcon />
                        </IconButton>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}

export default TransformerHead;
