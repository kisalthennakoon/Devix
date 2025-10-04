# ml_service.py

from fastapi import FastAPI
from pydantic import BaseModel
import uvicorn
from model import interface
import os

app = FastAPI()


# Define a Pydantic model for the request body
class FeaturesRequest(BaseModel):
    imageUrl: str

@app.post("/predict")
def predict(request: FeaturesRequest):
    # Access the features string from the request body
    imageUrl = request.imageUrl
    
    # Fix faulty path format: convert backslashes to forward slashes to avoid JSON escape issues
    corrected_imageUrl = imageUrl.replace('\\', '/')
    print(f"Original imageUrl: {imageUrl}")
    if imageUrl != corrected_imageUrl:
        print(f"Corrected imageUrl: {corrected_imageUrl}")
    
    # Create path relative to githubdev folder
    githubdev_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    # Normalize the imageUrl path separators for the OS
    normalized_imageUrl = corrected_imageUrl.replace('/', os.sep)
    path = os.path.join(githubdev_path, normalized_imageUrl)
    print(f"Received imageUrl: {imageUrl}")
    print(f"Absolute path: {path}")
    print(f"File exists: {os.path.exists(path)}")
    result = interface(path)
    
    
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
