import os
import numpy as np
import cv2
import tensorflow as tf
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Flatten, Dense, Dropout
from tensorflow.keras.applications import VGG16

# ============================================================
# CONFIGURATION
# ============================================================
MODEL_PATH = 'brain_tumor_detection_model.keras'  # Ensure your model file is in the same directory
IMAGE_SIZE = 150
LABELS = ['glioma_tumor', 'meningioma_tumor', 'no_tumor', 'pituitary_tumor']
LABELS_DICT = {i: label for i, label in enumerate(LABELS)}

# Initialize Flask App
app = Flask(__name__, template_folder='templates', static_folder='static')
CORS(app)

model = None

# ============================================================
# MODEL LOADING
# ============================================================

def create_model():
    """
    Recreate the architecture used during training (VGG16-based transfer learning).
    This ensures compatibility with the saved .keras weights.
    """
    base_model = VGG16(weights='imagenet', include_top=False, input_shape=(IMAGE_SIZE, IMAGE_SIZE, 3))
    for layer in base_model.layers:
        layer.trainable = False

    model_final = Sequential([
        base_model,
        Flatten(),
        Dense(512, activation='relu'),
        Dropout(0.5),
        Dense(len(LABELS), activation='softmax')
    ])
    return model_final


def load_model():
    """
    Load the trained model weights from the .keras file.
    """
    global model
    if not os.path.exists(MODEL_PATH):
        print(f"❌ Model file not found at {MODEL_PATH}")
        return False

    try:
        model = create_model()
        model.load_weights(MODEL_PATH)
        print("✅ Model loaded successfully.")
        return True
    except Exception as e:
        print(f"❌ Failed to load model: {e}")
        return False


# ============================================================
# IMAGE PREPROCESSING
# ============================================================

def preprocess_image(image_data):
    """
    Preprocesses uploaded MRI image for model prediction.
    Converts image bytes → OpenCV image → resized & normalized tensor.
    """
    try:
        image_array = np.frombuffer(image_data, np.uint8)
        img = cv2.imdecode(image_array, cv2.IMREAD_COLOR)

        if img is None:
            raise ValueError("Invalid image format or corrupted file.")

        img_resized = cv2.resize(img, (IMAGE_SIZE, IMAGE_SIZE))
        img_norm = img_resized / 255.0
        img_expanded = np.expand_dims(img_norm, axis=0)

        return img_expanded
    except Exception as e:
        raise ValueError(f"Image preprocessing failed: {e}")


# ============================================================
# ROUTES
# ============================================================

@app.route('/')
def home():
    """
    Renders the main UI page.
    """
    return render_template('index.html')


@app.route('/predict', methods=['POST'])
def predict():
    """
    Accepts an uploaded MRI image and returns a tumor prediction with confidence scores.
    """
    if model is None:
        return jsonify({"error": "Model not loaded. Please restart the server."}), 500

    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded."}), 400

    file = request.files['file']

    if file.filename == '':
        return jsonify({"error": "Empty file name received."}), 400

    try:
        # Step 1: Read image bytes
        contents = file.read()

        # Step 2: Preprocess image
        processed_image = preprocess_image(contents)

        # Step 3: Make prediction
        predictions = model.predict(processed_image)
        predicted_index = np.argmax(predictions[0])
        predicted_label = LABELS_DICT[predicted_index]
        confidence = float(predictions[0][predicted_index] * 100)

        # Step 4: Prepare full confidence map
        raw_predictions = [
            {"label": LABELS[i], "confidence": round(float(predictions[0][i] * 100), 2)}
            for i in range(len(LABELS))
        ]

        result = {
            "predicted_label": predicted_label,
            "confidence": round(confidence, 2),
            "raw_predictions": raw_predictions
        }

        print(f"🧠 Prediction: {predicted_label} ({confidence:.2f}%)")
        return jsonify(result)

    except Exception as e:
        print(f"❌ Prediction error: {e}")
        return jsonify({"error": f"Internal error: {e}"}), 500


# ============================================================
# SERVER STARTUP
# ============================================================

if __name__ == '__main__':
    print("🚀 Initializing Brain Tumor Detection Flask Server...")
    load_model()
    app.run(host='0.0.0.0', port=8080, debug=True)
