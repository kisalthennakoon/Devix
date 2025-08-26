import { Box, Button, Typography, IconButton } from "@mui/material";
import ImageIcon from '@mui/icons-material/Image';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import { Navigation } from "@mui/icons-material";
import type { TransformerDetails } from "./transformerTable";
import BaselineButton from "./baselineButton";
import axios from "axios";
import { useEffect, useState } from "react";

interface transformerDetails {
    id: string;
    transformerNo: string;
    poleNo: string;
    location: string;
    region: string;
    inspectedBy: string;
    updatedDate: string;
    updatedTime: string;
    status: string;
    capacity: string;
    type: string;
    noOfFreeders: string;
}

type TransformerBarProps = {
    transformerDetails?: transformerDetails;
    onBack?: () => void;
    onBaselineClick?: () => void;
};

function TransformerHead({ transformerDetails, onBack, onBaselineClick }: TransformerBarProps) {

    const [lastInspectedDate, setLastInspectedDate] = useState(
        {
            date: null,
            time: null
        }
    );
    const getLastInspectedDate = async () => {
       
        try{
            const res = await axios.get(`/api/transformer/getLastInspected/${transformerDetails?.transformerNo}`);
            setLastInspectedDate(res.data);
        }catch(err){
            console.error(err);
            return null;
        }
    }

    useEffect(() => {
        getLastInspectedDate();
    }, []);

    return (
        <Box sx={{ backgroundColor: '#ffffffff', boxShadow: 5, borderRadius: 2, p: 2 }}>

            <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                        <Button variant="contained" color="primary" sx={{ marginRight: 2, width: 'fit-content' }} onClick={onBack}>
                            <ChevronLeftIcon />
                        </Button>
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                                {transformerDetails?.transformerNo}
                            </Typography>
                            <Typography variant="subtitle1" sx={{ fontSize: 12, color: '#666', display: 'flex', alignItems: 'center' }}>
                                {transformerDetails?.region} <Navigation sx={{ color: 'red', fontSize: 16, mr: 0.5 }} /> {transformerDetails.location}
                            </Typography>
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, mt: 2 }}>
                        {[
                            { title: 'Pole No', value: transformerDetails?.poleNo },
                            { title: 'Capacity', value: transformerDetails?.capacity },
                            { title: 'Type', value: transformerDetails?.type },
                            { title: 'No. of Freeders', value: transformerDetails?.noOfFreeders }
                        ].map((item, idx) => (
                            <Box key={idx} sx={{ width: 100, height: 50, backgroundColor: '#e0e0e0', borderRadius: 2, boxShadow: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', p: 1 }}>

                                <Typography variant="body2" sx={{
                                    fontSize: 18,
                                    fontWeight: "bold",
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    width: '100%',
                                }}>
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
                                Last Inspected Date: {lastInspectedDate?.date} {lastInspectedDate?.time}
                            </Typography>
                        </Box>
                    </Box>
                    {/* <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, backgroundColor: '#e0e0e0', borderRadius: 2, p: 1 }}>
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
                    </Box> */}
                    <Box>
                        <BaselineButton transformerNo={transformerDetails?.transformerNo ?? ""} />
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}

export default TransformerHead;


// import { Box, Button, Typography, IconButton } from "@mui/material";
// import ImageIcon from '@mui/icons-material/Image';
// import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
// import VisibilityIcon from '@mui/icons-material/Visibility';
// import DeleteIcon from '@mui/icons-material/Delete';

// interface InspectionDetails {
//     id: string;
//     transformerNo: string;
//     poleNo: string;
//     branch: string;
//     inspectedBy: string;
//     updatedDate: string;
//     updatedTime: string;
//     status: string;
// }

// type InspectionBarProps = {
//     inspectionDetails: InspectionDetails;
//     onBaselineClick?: () => void;
//     onBack?: () => void;
// };

// function InspectionBar({ inspectionDetails, onBaselineClick, onBack }: InspectionBarProps) {
//     return (
//         <Box sx={{ backgroundColor: '#ffffffff', boxShadow: 5, borderRadius: 2, p: 2 }}>

//             <Box sx={{ display: 'flex', flexDirection: 'row' }}>
//                 <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
//                     <Box sx={{ display: 'flex', flexDirection: 'row' }}>
//                         <Button
//                             variant="contained"
//                             color="primary"
//                             sx={{ marginRight: 2, width: 'fit-content' }}
//                             onClick={onBack}                     // CHANGED (was alert)
//                             >
//                             <ChevronLeftIcon />
//                         </Button>
//                         <Box>
//                             <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
//                                 {inspectionDetails.id}
//                             </Typography>
//                             <Typography variant="subtitle1" sx={{ fontSize: 12, color: '#666' }}>
//                                 {inspectionDetails.updatedDate} {inspectionDetails.updatedTime}
//                             </Typography>
//                         </Box>
//                     </Box>
//                     <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, mt: 2 }}>
//                         {[
//                             { title: 'Transformer No', value: inspectionDetails.transformerNo },
//                             { title: 'Pole No', value: inspectionDetails.poleNo },
//                             { title: 'Branch', value: inspectionDetails.branch },
//                             { title: 'Inspected By', value: inspectionDetails.inspectedBy }
//                         ].map((item, idx) => (
//                             <Box key={idx} sx={{ width: 100, height: 50, backgroundColor: '#e0e0e0', borderRadius: 2, boxShadow: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', p: 1 }}>

//                                 <Typography variant="body2" sx={{ fontSize: 18, fontWeight: "bold" }}>
//                                     {item.value}
//                                 </Typography>

//                                 <Typography variant="subtitle2" sx={{ fontSize: 12, color: '#666' }}>
//                                     {item.title}
//                                 </Typography>

//                             </Box>
//                         ))}
//                     </Box>
//                 </Box>
//                 <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-end', marginLeft: 'auto' }}>
//                     <Box sx={{ display: 'flex', flexDirection: 'row' }}>
//                         <Box>
//                             <Typography variant="subtitle1" sx={{ fontSize: 12, color: '#666' }}>
//                                 Last Updated: {inspectionDetails.updatedDate} {inspectionDetails.updatedTime}
//                             </Typography>
//                         </Box>
//                         <Box sx={{
//                             backgroundColor: '#e0e0e0',
//                             borderRadius: 2,
//                             marginLeft: 1,
//                             width: 100,
//                             display: 'flex',
//                             alignItems: 'center',
//                             justifyContent: 'center',
//                             outline: '1px solid #ff0303ff',

//                         }}>
//                             <Typography variant="subtitle1" sx={{ fontSize: 12, color: '#ff0000ff' }}>
//                                 {inspectionDetails.status}
//                             </Typography>

//                         </Box>
//                     </Box>
//                     <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, backgroundColor: '#e0e0e0', borderRadius: 2, p: 1 }}>
//                         <Button
//                             size="small"
//                             startIcon={<ImageIcon />}
//                             onClick={onBaselineClick}
//                             sx={{ mr: 1, textTransform: 'none' }}
//                             >
//                             Baseline Image
//                         </Button>
//                         <IconButton aria-label="view" color="primary" onClick={() => alert('View clicked!')} sx={{ mr: 1 }}>
//                             <VisibilityIcon />
//                         </IconButton>
//                         <IconButton aria-label="delete" color="error" onClick={() => alert('Delete clicked!')}>
//                             <DeleteIcon />
//                         </IconButton>
//                     </Box>
//                 </Box>
//             </Box>
//         </Box>
//     );
// }

// export default InspectionBar;