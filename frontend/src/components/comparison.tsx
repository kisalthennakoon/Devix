
import React, { use, useEffect, useState } from "react";
import ThermalImageCard from "../components/thermalimagecard";
import axios from "axios";
import ThermalImageComparison from "../components/thermalimageComparison";
import { Alert, Box, Snackbar, Typography } from "@mui/material";

// interface InspectionImages {
//   baseImageUrl: string;
//   baseImageUploadedBy: string;
//   baseImageUploadedTime: string;
//   baseImageUploadedDate: string;

//   thermal: string;
//   thermalUploadedBy: string;
//   thermalUploadedTime: string;
//   thermalUploadedDate: string;

//   aiResults: Array<Map<string, any>>;
// }

export default function Comparison({ inspectionNo, transformerNo, onRefresh }: { inspectionNo: string, transformerNo: string, onRefresh: () => void }) {
  // const [inspectionImages, setInspectionImages] = useState<InspectionImages>();

  const [error, setError] = useState(false);

  // const fetchComparisnon = async () => {
  //   axios
  //     .get(`/api/inspectionImage/get/${inspectionNo}`)
  //     .then((res) => {
  //       setInspectionImages(res.data);
  //       setError(false);
  //     })
  //     .catch((err) => {
  //       console.error("Error fetching inspection:", err);
  //       setError(true); // mark that request failed
  //     });

      
  // }

  const [statusData, setStatusData] = useState<{inspectionStatus: string, baselineImageStatus: string}>();

  const checkStatus = async () => {
    axios
      .get(`/api/inspection/status/${inspectionNo}`)
      .then((res) => {
        setStatusData(res.data);
        setError(false);
      })
      .catch((err) => {
        console.error("Error fetching inspection:", err);
        setError(true); // mark that request failed
      });
  }

  useEffect(() => {
    checkStatus();
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

  if (statusData?.baselineImageStatus == "exist" && statusData?.inspectionStatus == "no_image") {
    return (
      <ThermalImageCard
        inspectionNo={inspectionNo}
        transformerNo={transformerNo}
        baseImageExist={true}
        onUploadSuccess={onRefresh}
        aiProgress={false}
      />

    );
  }

  if (statusData?.baselineImageStatus == "exist" && statusData?.inspectionStatus == "pending") {
    //show analysisi bars
    return <ThermalImageCard
      inspectionNo={inspectionNo}
      transformerNo={transformerNo}
      baseImageExist={true}
      onUploadSuccess={onRefresh}
      aiProgress={true}
    />;
  }
  // CASE 2: Backend ok but no images
  if (statusData?.baselineImageStatus == "no_image" && statusData?.inspectionStatus == "no_image") {
    //default to upload base image first
    return <ThermalImageCard
      inspectionNo={inspectionNo}
      transformerNo={transformerNo}
      baseImageExist={false}
      onUploadSuccess={onRefresh}
      aiProgress={false}
    />;
  }

  if (statusData?.baselineImageStatus == "exist" && statusData?.inspectionStatus == "in_progress") {

      return(
      <ThermalImageComparison
        // leftImageUrl={inspectionImages.baseImageUrl ?? ""}
        // rightImageUrl={inspectionImages.thermal ?? ""}
        inspectionNo={inspectionNo}
      />
    )
    
  }

  // return (
  //     <ThermalImageComparison
  //       // leftImageUrl={inspectionImages.baseImageUrl ?? ""}
  //       // rightImageUrl={inspectionImages.thermal ?? ""}
  //       {...inspectionImages}
  //     />
  //   );


}
