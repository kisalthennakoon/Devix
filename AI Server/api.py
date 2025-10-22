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
    
class EditReq(BaseModel):
    imageUrl: str
    current_detections: list[dict]
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
def update_thresholds_endpoint(request: EditReq):
    try:
        imageUrl = request.imageUrl
        imgArray = cv2.imread(imageUrl)

        def parse_bbox(bbox_str):
            # Converts '[676,248,383,136]' to (676, 248, 383, 136)
            if isinstance(bbox_str, str):
                return tuple(map(int, bbox_str.strip("[]").split(",")))
            elif isinstance(bbox_str, (list, tuple)):
                return tuple(bbox_str)
            return (0, 0, 0, 0)

        def transform_detection(d):
            return {
                "bbox": parse_bbox(d.get("bbox")),
                "label": d.get("faultType", "Unknown"),
                "severity": float(d.get("faultSeverity", 0.0)) if d.get("faultSeverity") not in [None, "None", ""] else 0.0,
                "status": d.get("anomalyStatus", "AI")
            }

        def transform_edit(e):
            edit = {
                "bbox": parse_bbox(e.get("bbox")),
                "label": e.get("faultType", "Unknown"),
                "status": e.get("anomalyStatus", "added")
            }
            # If edit is "edited", you may need to provide "old_bbox"
            if edit["status"] == "edited" and "old_bbox" in e:
                edit["old_bbox"] = parse_bbox(e["old_bbox"])
            return edit

        current_detections = [transform_detection(d) for d in request.current_detections]
        edits = [transform_edit(e) for e in request.edits]

        updated_TH = apply_feedback_and_recalibrate(
            img_bgr=imgArray,
            current_detections=current_detections,
            edits=edits
        )
        update_thresholds(updated_TH)
        return {"status": "Thresholds updated successfully."}
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5001)
