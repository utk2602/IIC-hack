"""
Flask ML API for Solar Panel Analysis
Serves predictions from the trained efficiency loss model
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import os

app = Flask(__name__)
CORS(app)

# Load the trained model
MODEL_PATH = os.path.join(os.path.dirname(__file__), "efficiency_loss_model.pkl")

try:
    model = joblib.load(MODEL_PATH)
    print(f" Model loaded successfully from {MODEL_PATH}")
except Exception as e:
    print(f" Error loading model: {e}")
    model = None


@app.route("/health", methods=["GET"])
def health():
    """Health check endpoint"""
    return jsonify({
        "status": "ok" if model is not None else "error",
        "model_loaded": model is not None,
        "service": "solar-ml-api"
    })


@app.route("/predict/efficiency-loss", methods=["POST"])
def predict_efficiency_loss():
    """
    Predict efficiency loss based on panel and weather data
    
    Expected JSON:
    {
        "temperature": float,
        "humidity": float,
        "wind_speed": float,
        "irradiance": float,
        "voltage": float,
        "current": float,
        "days_since_installation": int
    }
    """
    if model is None:
        return jsonify({"error": "Model not loaded"}), 500
    
    try:
        data = request.json
        
        # Validate required fields
        required_fields = [
            "temperature", "humidity", "wind_speed", 
            "irradiance", "voltage", "current", "days_since_installation"
        ]
        
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing field: {field}"}), 400
        
        # Create feature array in the same order as training
        features = np.array([[
            data["temperature"],
            data["humidity"],
            data["wind_speed"],
            data["irradiance"],
            data["voltage"],
            data["current"],
            data["days_since_installation"]
        ]])
        
        # Make prediction
        prediction = model.predict(features)[0]
        
        # Determine status based on efficiency loss
        if prediction < 5:
            status = "healthy"
            recommendation = "Panel performing optimally"
        elif prediction < 10:
            status = "good"
            recommendation = "Minor efficiency loss detected, monitor regularly"
        elif prediction < 15:
            status = "degrading"
            recommendation = "Consider scheduling maintenance inspection"
        else:
            status = "critical"
            recommendation = "Immediate inspection recommended"
        
        return jsonify({
            "success": True,
            "efficiency_loss": round(float(prediction), 2),
            "efficiency_loss_percent": f"{round(float(prediction), 2)}%",
            "status": status,
            "recommendation": recommendation,
            "input_features": data
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/predict/degradation", methods=["POST"])
def predict_degradation():
    """
    Calculate degradation index based on stress factors
    
    Expected JSON:
    {
        "temperature": float,
        "humidity": float,
        "voltage_max": float,
        "voltage_min": float,
        "current_max": float,
        "current_min": float,
        "days_since_installation": int
    }
    """
    try:
        data = request.json
        
        # Calculate thermal stress (excess temperature over 25°C)
        thermal_stress = max(0, data.get("temperature", 25) - 25)
        
        # Humidity stress (scaled 0-1)
        humidity_stress = data.get("humidity", 50) / 100
        
        # Electrical stress (voltage and current instability)
        v_max = data.get("voltage_max", 1)
        v_min = data.get("voltage_min", 1)
        i_max = data.get("current_max", 1)
        i_min = data.get("current_min", 1)
        
        voltage_drop = (v_max - v_min) / v_max if v_max > 0 else 0
        current_drop = (i_max - i_min) / i_max if i_max > 0 else 0
        electrical_stress = voltage_drop + current_drop
        
        # Aging stress (normalized by max expected lifespan ~25 years)
        days = data.get("days_since_installation", 0)
        aging_stress = min(1, days / (25 * 365))
        
        # Calculate composite degradation index
        degradation_index = (
            0.30 * thermal_stress +
            0.20 * humidity_stress +
            0.30 * electrical_stress +
            0.20 * aging_stress
        )
        
        # Normalize to 0-1 range
        degradation_index = min(1, max(0, degradation_index))
        
        # Determine status
        if degradation_index < 0.4:
            status = "Healthy"
            recommendation = "No action required"
        elif degradation_index < 0.7:
            status = "Degrading"
            recommendation = "Schedule preventive maintenance"
        else:
            status = "Critical"
            recommendation = "Immediate inspection required"
        
        return jsonify({
            "success": True,
            "degradation_index": round(float(degradation_index), 3),
            "status": status,
            "recommendation": recommendation,
            "stress_factors": {
                "thermal_stress": round(thermal_stress, 3),
                "humidity_stress": round(humidity_stress, 3),
                "electrical_stress": round(electrical_stress, 3),
                "aging_stress": round(aging_stress, 3)
            }
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/predict/batch", methods=["POST"])
def predict_batch():
    """
    Batch prediction for multiple panels/timepoints
    
    Expected JSON:
    {
        "data": [
            { ...panel1 data... },
            { ...panel2 data... }
        ]
    }
    """
    if model is None:
        return jsonify({"error": "Model not loaded"}), 500
    
    try:
        data = request.json
        records = data.get("data", [])
        
        results = []
        for i, record in enumerate(records):
            features = np.array([[
                record.get("temperature", 25),
                record.get("humidity", 50),
                record.get("wind_speed", 5),
                record.get("irradiance", 500),
                record.get("voltage", 30),
                record.get("current", 8),
                record.get("days_since_installation", 0)
            ]])
            
            prediction = model.predict(features)[0]
            
            results.append({
                "index": i,
                "panel_id": record.get("panel_id", f"panel_{i}"),
                "efficiency_loss": round(float(prediction), 2),
                "status": "healthy" if prediction < 5 else "degrading" if prediction < 15 else "critical"
            })
        
        return jsonify({
            "success": True,
            "count": len(results),
            "predictions": results
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/model/info", methods=["GET"])
def model_info():
    """Get information about the loaded model"""
    if model is None:
        return jsonify({"error": "Model not loaded"}), 500
    
    return jsonify({
        "model_type": type(model).__name__,
        "n_estimators": getattr(model, "n_estimators", None),
        "features": [
            "temperature",
            "humidity", 
            "wind_speed",
            "irradiance",
            "voltage",
            "current",
            "days_since_installation"
        ],
        "target": "efficiency_loss"
    })


if __name__ == "__main__":
    print("Starting Solar ML API...")
    print("Endpoints:")
    print("   GET  /health                  - Health check")
    print("   POST /predict/efficiency-loss - Predict efficiency loss")
    print("   POST /predict/degradation     - Calculate degradation index")
    print("   POST /predict/batch           - Batch predictions")
    print("   GET  /model/info              - Model information")
    print("")
    app.run(host="0.0.0.0", port=5001, debug=False)
