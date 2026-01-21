"""
Flask ML API for Solar Panel Analysis
Serves predictions from the trained efficiency loss model and image classification
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import os
import io
import base64
import torch
import torch.nn as nn
from torchvision import transforms, models
from PIL import Image

app = Flask(__name__)
CORS(app)

# ============ EFFICIENCY LOSS MODEL ============
MODEL_PATH = os.path.join(os.path.dirname(__file__), "efficiency_loss_model.pkl")

try:
    model = joblib.load(MODEL_PATH)
    print(f"✅ Efficiency model loaded successfully from {MODEL_PATH}")
except Exception as e:
    print(f"⚠️ Error loading efficiency model: {e}")
    model = None

# ============ IMAGE CLASSIFICATION MODEL ============
IMAGE_MODEL_PATH = os.path.join(os.path.dirname(__file__), "pv_classifier.pth")
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

try:
    # Initialize ResNet18 architecture
    image_model = models.resnet18(weights=None)
    image_model.fc = nn.Linear(image_model.fc.in_features, 2)
    image_model.load_state_dict(torch.load(IMAGE_MODEL_PATH, map_location=device))
    image_model = image_model.to(device)
    image_model.eval()
    print(f"✅ Image classifier loaded successfully from {IMAGE_MODEL_PATH}")
    print(f"   Running on: {device}")
except Exception as e:
    print(f"⚠️ Error loading image classifier: {e}")
    image_model = None

# Image preprocessing transforms (same as training)
image_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])


@app.route("/health", methods=["GET"])
def health():
    """Health check endpoint"""
    return jsonify({
        "status": "ok" if model is not None else "partial",
        "model_loaded": model is not None,
        "image_classifier_loaded": image_model is not None,
        "device": str(device),
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
        "target": "efficiency_loss",
        "image_classifier": {
            "loaded": image_model is not None,
            "architecture": "ResNet18",
            "classes": ["DEFECTIVE (BAD) - Class 0", "NORMAL (GOOD) - Class 1"],
            "class_order_note": "ImageFolder sorts alphabetically: bad=0, good=1",
            "input_size": "224x224",
            "device": str(device)
        }
    })


# ============ IMAGE CLASSIFICATION ENDPOINTS ============

@app.route("/predict/panel-defect", methods=["POST"])
def predict_panel_defect():
    """
    Classify a solar panel image as Normal or Defective
    
    Accepts:
    - multipart/form-data with 'image' file
    - JSON with 'image_base64' field (base64 encoded image)
    """
    if image_model is None:
        return jsonify({"error": "Image classifier not loaded"}), 500
    
    try:
        img = None
        
        # Check for file upload
        if 'image' in request.files:
            file = request.files['image']
            if file.filename == '':
                return jsonify({"error": "No file selected"}), 400
            img = Image.open(file.stream).convert("RGB")
        
        # Check for base64 encoded image
        elif request.is_json and 'image_base64' in request.json:
            image_data = request.json['image_base64']
            # Remove data URL prefix if present
            if ',' in image_data:
                image_data = image_data.split(',')[1]
            image_bytes = base64.b64decode(image_data)
            img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        
        else:
            return jsonify({"error": "No image provided. Use 'image' file or 'image_base64' JSON field"}), 400
        
        # Preprocess image
        img_tensor = image_transform(img).unsqueeze(0).to(device)
        
        # Run inference
        with torch.no_grad():
            output = image_model(img_tensor)
            probabilities = torch.nn.functional.softmax(output, dim=1)[0]
            pred_class = torch.argmax(output, dim=1).item()
        
        # Map prediction to labels
        # IMPORTANT: ImageFolder sorts classes alphabetically!
        # bad -> Class 0, good -> Class 1
        label_map = {0: "DEFECTIVE", 1: "NORMAL"}
        status_map = {0: "bad", 1: "good"}
        
        confidence = float(probabilities[pred_class]) * 100
        
        # Generate recommendations based on result
        if pred_class == 1:  # Normal (Class 1 = good folder)
            recommendation = "Panel appears healthy. Continue regular monitoring."
            severity = "none"
            action_required = False
        else:  # Defective (Class 0 = bad folder)
            if confidence > 90:
                recommendation = "High confidence defect detected! Schedule immediate inspection."
                severity = "critical"
            elif confidence > 70:
                recommendation = "Likely defect detected. Schedule inspection within 1 week."
                severity = "high"
            else:
                recommendation = "Possible defect detected. Monitor closely and verify manually."
                severity = "medium"
            action_required = True
        
        return jsonify({
            "success": True,
            "prediction": {
                "label": label_map[pred_class],
                "status": status_map[pred_class],
                "class_id": pred_class,
                "confidence": round(confidence, 2),
                "confidence_percent": f"{round(confidence, 2)}%"
            },
            "probabilities": {
                # Class 0 = defective (bad), Class 1 = normal (good)
                "defective": round(float(probabilities[0]) * 100, 2),
                "normal": round(float(probabilities[1]) * 100, 2)
            },
            "analysis": {
                "severity": severity,
                "action_required": action_required,
                "recommendation": recommendation
            },
            "model_info": {
                "architecture": "ResNet18",
                "device": str(device),
                "input_size": "224x224"
            }
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/predict/panel-defect/batch", methods=["POST"])
def predict_panel_defect_batch():
    """
    Batch classification for multiple panel images
    
    Accepts multipart/form-data with multiple 'images' files
    """
    if image_model is None:
        return jsonify({"error": "Image classifier not loaded"}), 500
    
    try:
        if 'images' not in request.files:
            return jsonify({"error": "No images provided"}), 400
        
        files = request.files.getlist('images')
        if len(files) == 0:
            return jsonify({"error": "No images provided"}), 400
        
        results = []
        normal_count = 0
        defective_count = 0
        
        for idx, file in enumerate(files):
            try:
                img = Image.open(file.stream).convert("RGB")
                img_tensor = image_transform(img).unsqueeze(0).to(device)
                
                with torch.no_grad():
                    output = image_model(img_tensor)
                    probabilities = torch.nn.functional.softmax(output, dim=1)[0]
                    pred_class = torch.argmax(output, dim=1).item()
                
                # Class 0 = bad (defective), Class 1 = good (normal) - alphabetical order
                label_map = {0: "DEFECTIVE", 1: "NORMAL"}
                confidence = float(probabilities[pred_class]) * 100
                
                if pred_class == 1:  # Normal
                    normal_count += 1
                else:  # Defective (Class 0)
                    defective_count += 1
                
                results.append({
                    "index": idx,
                    "filename": file.filename,
                    "prediction": label_map[pred_class],
                    "confidence": round(confidence, 2),
                    "is_defective": pred_class == 0  # Class 0 is defective
                })
                
            except Exception as e:
                results.append({
                    "index": idx,
                    "filename": file.filename,
                    "error": str(e)
                })
        
        return jsonify({
            "success": True,
            "total_processed": len(results),
            "summary": {
                "normal_count": normal_count,
                "defective_count": defective_count,
                "defect_rate": round((defective_count / len(results)) * 100, 2) if results else 0
            },
            "results": results
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    print("\n" + "="*60)
    print("🌞 Starting Solar ML API...")
    print("="*60)
    print("\n📡 Endpoints:")
    print("   GET  /health                    - Health check")
    print("   POST /predict/efficiency-loss   - Predict efficiency loss")
    print("   POST /predict/degradation       - Calculate degradation index")
    print("   POST /predict/batch             - Batch efficiency predictions")
    print("   POST /predict/panel-defect      - Classify panel image (defect detection)")
    print("   POST /predict/panel-defect/batch- Batch image classification")
    print("   GET  /model/info                - Model information")
    print("\n📦 Models Loaded:")
    print(f"   • Efficiency Loss Model: {'✅ Ready' if model else '❌ Not loaded'}")
    print(f"   • Image Classifier:      {'✅ Ready' if image_model else '❌ Not loaded'}")
    print(f"   • Device:                {device}")
    print("\n" + "="*60 + "\n")
    app.run(host="0.0.0.0", port=5001, debug=False)
