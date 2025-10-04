# ml_service.py

from fastapi import FastAPI, File, UploadFile
from pydantic import BaseModel
import uvicorn
from model import interface
import os

app = FastAPI()


# Define a Pydantic model for the request body
class FeaturesRequest(BaseModel):
    imageUrl: str

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    # Save the uploaded file to a temp location
    temp_path = f"/tmp/{file.filename}"
    with open(temp_path, "wb") as f:
        content = await file.read()
        f.write(content)

    # Pass the temp_path to your model interface
    result = interface(temp_path)    
    
    print(f"AI Model Result: {result}")
    
    # Return the actual AI model results instead of hardcoded data
    if result == "No anomalies found.":
        return []
    else:
        # Convert the model result to the expected format
        predictions = []
        for anomaly in result:
            prediction = {
                "fault_type": anomaly.get("fault_type", "Unknown"),
                "severity": str(anomaly.get("severity", 0.0)),
                "confidence": str(min(1.0, anomaly.get("severity", 0.0) + 0.5)),  # Convert severity to confidence
                "x_coordinate": str(anomaly.get("centroid", [0, 0])[0]),
                "y_coordinate": str(anomaly.get("centroid", [0, 0])[1]),
                "bbox": anomaly.get("bbox", [0, 0, 0, 0]),
                "area_px": anomaly.get("area_px", 0)
            }
            # Add hotspot coordinates if available
            if "hotspot_xy" in anomaly:
                prediction["hotspot_x"] = str(anomaly["hotspot_xy"][0])
                prediction["hotspot_y"] = str(anomaly["hotspot_xy"][1])
            
            predictions.append(prediction)
        
        return predictions

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5001)
