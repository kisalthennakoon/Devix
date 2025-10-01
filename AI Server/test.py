# ml_service.py

from fastapi import FastAPI
from pydantic import BaseModel
import uvicorn

app = FastAPI()


# Define a Pydantic model for the request body
class FeaturesRequest(BaseModel):
    imageUrl: str

@app.post("/predict")
def predict(request: FeaturesRequest):
    # Access the features string from the request body
    imageUrl = request.imageUrl
    print(f"Received imageUrl: {imageUrl}")
    prediction = [
        {"fault_type": "FaultA", "severity": "high", "confidence": 0.95, "x_coordinate": "22.5", "y_coordinate": "45.3"},
        {"fault_type": "FaultB", "severity": "medium", "confidence": 0.85, "x_coordinate": "30.1", "y_coordinate": "50.2"}
    ]
    return prediction

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5001)
