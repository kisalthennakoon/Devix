import React, { useEffect, useState } from "react";
import ThermalImageCard from "../components/thermalimagecard";
import axios from "axios";
import ThermalImageComparison from "../components/thermalimageComparison";
import { Alert, Box, Snackbar, Typography } from "@mui/material";

interface InspectionImages {
  baseImageUrl: string ;
  baseImageUploadedBy: string ;
  baseImageUploadedTime: string ;
  baseImageUploadedDate: string;

  thermal: string;
  thermalUploadedBy: string;
  thermalUploadedTime: string;
  thermalUploadedDate: string;
}

export default function Comparison({ inspectionNo, transformerNo, onRefresh }: { inspectionNo: string, transformerNo: string, onRefresh: () => void }) {
  const [inspectionImages, setInspectionImages] = useState<InspectionImages>();

  const [error, setError] = useState(false);

  const fetchComparisnon = async () => {
    axios
      .get(`/api/inspectionImage/get/${inspectionNo}`)
      .then((res) => {
        setInspectionImages(res.data);
        setError(false);
      })
      .catch((err) => {
        console.error("Error fetching inspection:", err);
        setError(true); // mark that request failed
      });
  }

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

  if (inspectionImages?.baseImageUrl && !inspectionImages?.thermal) {
    return (
        <ThermalImageCard
          inspectionNo={inspectionNo}
          transformerNo={transformerNo}
          baseImageExist={true}
          onUploadSuccess={onRefresh}          
        />
        
    );
  }

  if (!inspectionImages?.baseImageUrl && inspectionImages?.thermal) {
    return <ThermalImageCard
      inspectionNo={inspectionNo}
      transformerNo={transformerNo}
      baseImageExist={false}
      onUploadSuccess={onRefresh}
    />;
  }
  // CASE 2: Backend ok but no images
  if (!inspectionImages?.baseImageUrl && !inspectionImages?.thermal) {
    return <ThermalImageCard
      inspectionNo={inspectionNo}
      transformerNo={transformerNo}
      baseImageExist={false}
      onUploadSuccess={onRefresh}
    />;
  }

  if (inspectionImages.baseImageUrl && inspectionImages.thermal) {
    return (
      <ThermalImageComparison
        // leftImageUrl={inspectionImages.baseImageUrl ?? ""}
        // rightImageUrl={inspectionImages.thermal ?? ""}
        {...inspectionImages}
      />
    );
  }


}
