import React, { useEffect, useState } from "react";
import { Dialog, DialogTitle, DialogContent, Grid, Box, Card, CardMedia, Typography, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";

interface SideBySideImagesProps {
  open: boolean;
  onClose: () => void;
  leftTitle?: string;
  midTitle?: string;
  rightTitle?: string;
  transformerNo? : string;
}

const BaselineImageShow: React.FC<SideBySideImagesProps> = ({
  open,
  onClose,
  transformerNo,
  leftTitle = "Sunny",
  midTitle = "Cloudy",
  rightTitle = "Rainy",
}) => {
  const getDirectLink = (url: string, size: number = 1000) => {
    const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    return match
      ? `https://drive.google.com/thumbnail?id=${match[1]}&sz=w${size}`
      : url;
  };

  const [baselineImages, setBaselineImages] = useState({
      sunny: null as string | null,
      cloudy: null as string | null,
      rainy: null as string | null,
    });
    const [error, setError] = useState(false);
  
    useEffect(() => {
      axios
        .get(`/api/baseImage/get/${transformerNo}`)
        .then((res) => {
          setBaselineImages(res.data);
          setError(false);
        })
        .catch((err) => {
          console.error("Error fetching inspection:", err);
          setError(true); // mark that request failed
        });
    }, []);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2 }}>
        Baseline Images
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {error ||
        (!baselineImages.sunny && !baselineImages.cloudy && !baselineImages.rainy) ? (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            minHeight={200}
          >
            <Typography variant="h6" color="text.secondary" align="center">
              No images found. Please add base images.
            </Typography>
          </Box>
        ) : (
          <Box display="flex" flexDirection="row" justifyContent="center" alignItems="flex-start" gap={2}>
            {/* Left Image */}
            <Box flex={1} minWidth={0}>
              <Typography align="center" variant="subtitle1" sx={{ mb: 1 }}>
                {leftTitle}
              </Typography>
              <Card sx={{ borderRadius: 2, boxShadow: 4 }}>
                <CardMedia
                  component="img"
                  image={getDirectLink(baselineImages.sunny ?? "")}
                  alt={leftTitle}
                  sx={{ objectFit: "contain", width: "100%", maxHeight: 400 }}
                />
              </Card>
            </Box>
            {/* Middle Image */}
            <Box flex={1} minWidth={0}>
              <Typography align="center" variant="subtitle1" sx={{ mb: 1 }}>
                {midTitle}
              </Typography>
              <Card sx={{ borderRadius: 2, boxShadow: 4 }}>
                <CardMedia
                  component="img"
                  image={getDirectLink(baselineImages.cloudy ?? "")}
                  alt={midTitle}
                  sx={{ objectFit: "contain", width: "100%", maxHeight: 400 }}
                />
              </Card>
            </Box>
            {/* Right Image */}
            <Box flex={1} minWidth={0}>
              <Typography align="center" variant="subtitle1" sx={{ mb: 1 }}>
                {rightTitle}
              </Typography>
              <Card sx={{ borderRadius: 2, boxShadow: 4 }}>
                <CardMedia
                  component="img"
                  image={getDirectLink(baselineImages.rainy ?? "")}
                  alt={rightTitle}
                  sx={{ objectFit: "contain", width: "100%", maxHeight: 400 }}
                />
              </Card>
            </Box>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BaselineImageShow;