import { Box, Button, Typography, IconButton } from "@mui/material";
import ImageIcon from '@mui/icons-material/Image';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import { Navigation } from "@mui/icons-material";

interface InspectionDetails {
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
    inspectionDetails: InspectionDetails;
};

function InspectionBar({ inspectionDetails }: InspectionBarProps) {
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
                                {inspectionDetails.transformerNo}
                            </Typography>
                            <Typography variant="subtitle1" sx={{ fontSize: 12, color: '#666', display: 'flex', alignItems: 'center' }}>
                                {inspectionDetails.branch} <Navigation sx={{ color: 'red', fontSize: 16, mr: 0.5 }} /> {inspectionDetails.location}
                            </Typography>
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, mt: 2 }}>
                        {[
                            { title: 'Pole No', value: inspectionDetails.poleNo },
                            { title: 'Capacity', value: inspectionDetails.capacity },
                            { title: 'Type', value: inspectionDetails.type },
                            { title: 'No. of Freeders', value: inspectionDetails.noOfFreeders}
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
                                Last Inspected Date: {inspectionDetails.updatedDate} {inspectionDetails.updatedTime}
                            </Typography>
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, backgroundColor: '#e0e0e0', borderRadius: 2, p: 1 }}>
                        <Typography sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                            <ImageIcon sx={{ mr: 1 }} />
                            Baseline Image
                        </Typography>
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

export default InspectionBar;
