import React, { useEffect, useState } from "react";
import ThermalImageCard from "../components/thermalimagecard";
import axios from "axios";
import ThermalImageComparison from "../components/thermalimageComparison";
import { Alert, Box, Snackbar, Typography } from "@mui/material";



export default function Comparison({ inspectionNo, onRefresh }: { inspectionNo: string, onRefresh: () => void }) {
  const [inspectionImages, setInspectionImages] = useState({
    baseImageUrl: null as string | null,
    thermal: null as string | null,
  });
  const [error, setError] = useState(false);

  const fetchComparisnon = async () => {
    axios
      .get(`/api/inspection/getComparisonImage/${inspectionNo}`)
      .then((res) => {
        setInspectionImages(res.data);
        setError(false);
      })
      .catch((err) => {
        console.error("Error fetching inspection:", err);
        setError(true); // mark that request failed
      });
  }

  const [snackBar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({ open: false, message: "", severity: "success" });
  const handleSnackbarClose = () => setSnackbar(s => ({ ...s, open: false }));


  useEffect(() => {
    fetchComparisnon();
  }, []);

  // CASE 1: Backend failed (500)
  if (error) {
    return (
      <Box>
        <Typography variant="body1" color="error">
          Something went wrong. Try again later.
        </Typography>
      </Box>
    );
  }

  if (inspectionImages.baseImageUrl && !inspectionImages.thermal) {
    return (
        <ThermalImageCard
          inspectionNo={inspectionNo}
          baseImageExist={true}
          onUploadSuccess={onRefresh}          
        />
        
    );
  }

  if (!inspectionImages.baseImageUrl && inspectionImages.thermal) {
    return <ThermalImageCard
      inspectionNo={inspectionNo}
      baseImageExist={false}
      onUploadSuccess={onRefresh}
    />;
  }
  // CASE 2: Backend ok but no images
  if (!inspectionImages.baseImageUrl && !inspectionImages.thermal) {
    return <ThermalImageCard
      inspectionNo={inspectionNo}
      baseImageExist={false}
      onUploadSuccess={onRefresh}
    />;
  }

  if (inspectionImages.baseImageUrl && inspectionImages.thermal) {
    return (
      <ThermalImageComparison
        leftImageUrl={inspectionImages.baseImageUrl ?? ""}
        rightImageUrl={inspectionImages.thermal ?? ""}
      />
    );
  }


}
