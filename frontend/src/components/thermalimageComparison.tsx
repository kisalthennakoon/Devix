import React, { useEffect } from "react";
import { Grid, Card, CardMedia, Box, Typography } from "@mui/material";

// interface SideBySideImagesProps {
//   leftImageUrl: string;
//   rightImageUrl: string;
// }

interface InspectionImages {
  baseImageUrl: string;
  baseImageUploadedBy: string;
  baseImageUploadedTime: string;
  baseImageUploadedDate: string;

  thermal: string;
  thermalUploadedBy: string;
  thermalUploadedTime: string;
  thermalUploadedDate: string;
}

type ThermalImageComparisonProps = InspectionImages;

const ThermalImageComparison = (inspectionImages: ThermalImageComparisonProps) => {
  const getDirectLink = (url: string, size: number = 1000) => {
    const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    return match
      ? `https://drive.google.com/thumbnail?id=${match[1]}&sz=w${size}`
      : url;
  };

  useEffect(() => {
    console.log('left', getDirectLink(inspectionImages.baseImageUrl))
    console.log('right', getDirectLink(inspectionImages.thermal))
  }, [inspectionImages])

  return (
    <Box
      sx={{
        p: 3,
        borderRadius: 3,
        boxShadow: 6,
        backgroundColor: "#f9f9f9",
      }}
    >
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        Thermal Image Comparison
      </Typography>

      <Box
        sx={{
          display: "flex",
          gap: 2,
          justifyContent: "center",
          alignItems: "flex-start",
          flexWrap: "nowrap", // prevents stacking
        }}
      >
        {/* Left Image */}
        <Box sx={{ flex: 1, mr: 1 }}>
          <Card sx={{ borderRadius: 2, boxShadow: 4, flex: 1 }}>
            <CardMedia
              component="img"
              image={getDirectLink(inspectionImages.baseImageUrl)}
              alt="Left Image"
              sx={{ objectFit: "contain", width: "100%", maxHeight: 600 }}
            />
          </Card>
          <Typography
            sx={{
              fontSize: 13,
              color: "#888",
              fontStyle: "italic",
              mt: 1,
            }}
          >
            Uploaded Time: {inspectionImages.baseImageUploadedDate} {inspectionImages.baseImageUploadedTime}
          </Typography>
          <Typography
            sx={{
              marginTop: 0.5,
              fontSize: 13,
              color: "#888",
              fontStyle: "italic",
            }}
          >
            Uploaded By: {inspectionImages.baseImageUploadedBy}
          </Typography>
        </Box>

        {/* Right Image */}
        <Box sx={{ flex: 1, ml: 1 }}>
          <Card sx={{ borderRadius: 2, boxShadow: 4, flex: 1 }}>
            <CardMedia
              component="img"
              image={getDirectLink(inspectionImages.thermal)}
              alt="Right Image"
              sx={{ objectFit: "contain", width: "100%", maxHeight: 600 }}
            />
          </Card>
          <Typography
            sx={{
              marginTop: 0.5,
              fontSize: 13,
              color: "#888",
              fontStyle: "italic",
            }}
          >
            Uploaded Time: {inspectionImages.thermalUploadedDate} {inspectionImages.thermalUploadedTime}
          </Typography>
          <Typography
            sx={{
              
              fontSize: 13,
              color: "#888",
              fontStyle: "italic",
            }}
          >
            Uploaded By: {inspectionImages.thermalUploadedBy}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default ThermalImageComparison;