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
    Renders the main landing page with navigation.
    """
    return render_template('index.html')

@app.route('/information')
def information():
    """
    Renders the brain tumor information page with statistics.
    """
    return render_template('information.html')

@app.route('/statistics')
def statistics():
    """
    Renders the global statistics page.
    """
    return render_template('statistics.html')

@app.route('/experts')
def experts():
    """
    Renders the expert opinions page.
    """
    return render_template('experts.html')

@app.route('/model')
def model_info():
    """
    Renders the AI model information page.
    """
    return render_template('model.html')

@app.route('/predict')
def predict_page():
    """
    Renders the prediction page.
    """
    return render_template('predict.html')


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
        predictions_raw = model.predict(processed_image)
        predicted_index = np.argmax(predictions_raw[0])
        predicted_label = LABELS_DICT[predicted_index]
        confidence = float(predictions_raw[0][predicted_index])

        # Step 4: Prepare prediction dict with normalized label names
        predictions_dict = {}
        for i, label in enumerate(LABELS):
            # Convert label format from 'glioma_tumor' to 'glioma'
            normalized_label = label.replace('_tumor', '')
            predictions_dict[normalized_label] = float(predictions_raw[0][i])

        # Normalize the predicted label too
        normalized_predicted = predicted_label.replace('_tumor', '')

        result = {
            "prediction": normalized_predicted,
            "confidence": confidence,
            "predictions": predictions_dict
        }

        print(f"🧠 Prediction: {normalized_predicted} ({confidence*100:.2f}%)")
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
