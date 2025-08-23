import React, { useEffect, useState } from "react";
import ThermalImageCard from "../components/thermalimagecard";
import axios from "axios";
import ThermalImageComparison from "../components/thermalimageComparison";

export default function Comparison({ inspectionNo }: { inspectionNo: string }) {
  const [inspectionImages, setInspectionImages] = useState({
    baseImageUrl: null as string | null,
    thermal: null as string | null,
  });
  const [error, setError] = useState(false);

  useEffect(() => {
    axios
      .get(`https://automatic-pancake-wrrpg66ggvj535gq-8080.app.github.dev/api/inspection/getComparisonImage/${inspectionNo}`)
      .then((res) => {
        setInspectionImages(res.data);
        setError(false);
      })
      .catch((err) => {
        console.error("Error fetching inspection:", err);
        setError(true); // mark that request failed
      });
  }, []);

  // CASE 1: Backend failed (500)
  if (error) {
    return <ThermalImageCard
        inspectionNo = {inspectionNo}
    />;
  }

  // CASE 2: Backend ok but no images
  if (!inspectionImages.baseImageUrl && !inspectionImages.thermal) {
    return <ThermalImageCard
         inspectionNo = {inspectionNo}
    />;
  }

  // CASE 3: Images exist
  return (
    <ThermalImageComparison
      leftImageUrl={inspectionImages.baseImageUrl}
      rightImageUrl={inspectionImages.thermal}
    />
  );
}
