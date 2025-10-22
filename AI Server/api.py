# ml_service.py

from fastapi import FastAPI
from pydantic import BaseModel
import uvicorn
from model import interface
import cv2
from retraining_pipeline import apply_feedback_and_recalibrate, update_thresholds
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="AI Model Server", version="1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_credentials=True,
    allow_methods=["*"], allow_headers=["*"],
)

# Define a Pydantic model for the request body
class FeaturesRequest(BaseModel):
    imageUrl: str
    
class CurrentDetectionsRequest(BaseModel):
    current_detections: list[dict]
    
class EditsRequest(BaseModel):
    edits: list[dict]

@app.post("/predict")
def predict(request: FeaturesRequest):
    # Access the features string from the request body
    imageUrl = request.imageUrl
    # Make path relative to the Devix folder
    # devix_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    # path = os.path.join(devix_root, imageUrl)
    # absolute_path = os.path.abspath(__file__)
    # dir_path = os.path.dirname(absolute_path)
    
    # path = os.path.join(path, imageUrl)
    # path = f"../{imageUrl}"
    # print("path: ", path)
    print("imageUrl: ", imageUrl)
    result = interface(imageUrl)
    
    
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
    
@app.post("/update_thresholds")
def update_thresholds_endpoint(request: FeaturesRequest, 
                               AI_detections: CurrentDetectionsRequest, 
                               admin: EditsRequest):
    imageUrl = request.imageUrl
    imgArray = cv2.imread(imageUrl)
    current_detections = AI_detections.current_detections
    edits = admin.edits

    updated_TH = apply_feedback_and_recalibrate(
        img_bgr=imgArray,
        current_detections=current_detections,
        edits=edits
    )
    update_thresholds(updated_TH)
    return {"status": "Thresholds updated successfully."}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5001)
