import { Box, Button, IconButton, Dialog } from "@mui/material";
import React, { useState } from "react";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import ImageIcon from "@mui/icons-material/Image";
import BaselineImage from "./baselineImage";
import BaselineImageShow from "./baselineImageShow";
// import BaselineImage from "./BaselineImage"; // adjust path as needed
 // adjust path as needed

function BaselineButton({ transformerNo }: { transformerNo: string }): JSX.Element {
    const [openBaseline, setOpenBaseline] = useState(false);
    const [openShow, setOpenShow] = useState(false);

    const handleDelete = async () => {
        try {
            await fetch(`https://automatic-pancake-wrrpg66ggvj535gq-8080.app.github.dev/api/transformer/deleteBaseImages/${transformerNo}`, { method: "DELETE" });
            alert("Deleted!");
        } catch (e) {
            alert("Delete failed!");
        }
    };

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, backgroundColor: '#e0e0e0', borderRadius: 2, p: 1 }}>
            <Button
                size="small"
                startIcon={<ImageIcon />}
                onClick={() => setOpenBaseline(true)}
                sx={{ mr: 1, textTransform: 'none' }}
            >
                Baseline Image
            </Button>
            <IconButton aria-label="view" color="primary" onClick={() => setOpenShow(true)} sx={{ mr: 1 }}>
                <VisibilityIcon />
            </IconButton>
            <IconButton aria-label="delete" color="error" onClick={handleDelete}>
                <DeleteIcon />
            </IconButton>

            <Dialog open={openBaseline} onClose={() => setOpenBaseline(false)} maxWidth="md" fullWidth>
                <BaselineImage
                    transformerNo={transformerNo}
                    onClose={() => setOpenBaseline(false)}
                    open={openBaseline}
                    onConfirm={() => setOpenBaseline(false)}
                />
            </Dialog>
            <Dialog open={openShow} onClose={() => setOpenShow(false)} maxWidth="md" fullWidth>
                <BaselineImageShow
                    transformerNo={transformerNo}
                    onClose={() => setOpenShow(false)}
                    open={openShow}
                />
            </Dialog>
        </Box>
    );
}

export default BaselineButton;