# ml_service.py
from fastapi import FastAPI
import uvicorn

app = FastAPI()

@app.post("/predict")
def predict(features: dict):
    prediction = {"Fault": "FaultA", "Confidence": 0.95, "Cordinates": [[2,3],[4,5]]}
    return prediction

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5001)
