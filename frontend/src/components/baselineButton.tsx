import { Box, Button, IconButton, Dialog, Snackbar, Alert } from "@mui/material";
import React, { useState, type JSX } from "react";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import ImageIcon from "@mui/icons-material/Image";
import BaselineImage from "./baselineImage";
import BaselineImageShow from "./baselineImageShow";

// import BaselineImage from "./BaselineImage"; 


type Props = {
    transformerNo?: string;
    onChange?: () => void;
};

function BaselineButton({ transformerNo, onChange }: Props): JSX.Element {
    const [openBaseline, setOpenBaseline] = useState(false);
    const [openShow, setOpenShow] = useState(false);

    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
        open: false,
        message: "",
        severity: "success",
    });
    const handleSnackbarClose = () => setSnackbar(s => ({ ...s, open: false }));

    const handleDelete = async () => {
        try {
            await fetch(`/api/baseImage/delete/${transformerNo}`, { method: "DELETE" });
            //alert("Deleted!");
            setSnackbar({ open: true, message: "Baseline Images Deleted!", severity: "success" });
            if(onChange) onChange();
        } catch (e) {
            setSnackbar({ open: true, message: "Baseline Images Delete failed!", severity: "error" });
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
                    onChange={onChange}
                    snackBar={setSnackbar}
                />
            </Dialog>
            <Dialog open={openShow} onClose={() => setOpenShow(false)} maxWidth="md" fullWidth>
                <BaselineImageShow
                    transformerNo={transformerNo}
                    onClose={() => setOpenShow(false)}
                    open={openShow}
                />
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
                <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}

export default BaselineButton;