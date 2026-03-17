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

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "brain_tumor_detection_model.keras")
IMAGE_SIZE = 150

LABELS = [
    "glioma_tumor",
    "meningioma_tumor",
    "no_tumor",
    "pituitary_tumor"
]

LABELS_DICT = {i: label for i, label in enumerate(LABELS)}

# ============================================================
# FLASK APP INITIALIZATION
# ============================================================

app = Flask(__name__, template_folder="templates", static_folder="static")
CORS(app)

model = None
model_load_error = None

# ============================================================
# MODEL ARCHITECTURE
# ============================================================

def create_model():
    base_model = VGG16(
        weights=None,   # prevents downloading imagenet weights
        include_top=False,
        input_shape=(IMAGE_SIZE, IMAGE_SIZE, 3)
    )

    for layer in base_model.layers:
        layer.trainable = False

    model_final = Sequential([
        base_model,
        Flatten(),
        Dense(512, activation="relu"),
        Dropout(0.5),
        Dense(len(LABELS), activation="softmax")
    ])

    return model_final


# ============================================================
# MODEL LOADING
# ============================================================

def load_model():
    global model, model_load_error

    if not os.path.exists(MODEL_PATH):
        model_load_error = f"Model file not found: {MODEL_PATH}"
        print(f"❌ {model_load_error}")
        return False

    try:
        print(f"🚀 Loading AI model from: {MODEL_PATH}")

        # Prefer loading as a full .keras model first.
        # If that fails (older/newer format mismatch), fall back to architecture + weights.
        try:
            model = tf.keras.models.load_model(MODEL_PATH, compile=False)
            print("✅ Model loaded as full Keras model!")
        except Exception as full_model_error:
            print(f"⚠️ Full model load failed, trying weights fallback: {full_model_error}")
            model = create_model()
            model.load_weights(MODEL_PATH)
            print("✅ Model loaded using architecture + weights fallback!")

        model_load_error = None
        return True

    except Exception as e:
        model_load_error = f"Model loading failed: {e}"
        print(f"❌ {model_load_error}")
        return False


# Load model when server starts
load_model()

# ============================================================
# IMAGE PREPROCESSING
# ============================================================

def preprocess_image(image_data):

    try:
        image_array = np.frombuffer(image_data, np.uint8)
        img = cv2.imdecode(image_array, cv2.IMREAD_COLOR)

        if img is None:
            raise ValueError("Invalid image file")

        img = cv2.resize(img, (IMAGE_SIZE, IMAGE_SIZE))
        img = img / 255.0
        img = np.expand_dims(img, axis=0)

        return img

    except Exception as e:
        raise ValueError(f"Image preprocessing error: {e}")


# ============================================================
# ROUTES
# ============================================================

@app.route("/")
def home():
    return render_template("index.html")


@app.route("/information")
def information():
    return render_template("information.html")


@app.route("/statistics")
def statistics():
    return render_template("statistics.html")


@app.route("/experts")
def experts():
    return render_template("experts.html")


@app.route("/model")
def model_info():
    return render_template("model.html")


@app.route("/predict")
def predict_page():
    return render_template("predict.html")


@app.route("/privacy-policy")
def privacy_policy():
    return render_template("privacy_policy.html")


@app.route("/terms-of-service")
def terms_of_service():
    return render_template("terms_of_service.html")


@app.route("/medical-disclaimer")
def medical_disclaimer():
    return render_template("medical_disclaimer.html")


@app.route("/contact-us")
def contact_us():
    return render_template("contact_us.html")


@app.route("/documentation")
def documentation():
    return render_template("documentation.html")


@app.route("/research-papers")
def research_papers():
    return render_template("research_papers.html")


# ============================================================
# PREDICTION API
# ============================================================

@app.route("/predict", methods=["POST"])
def predict():

    if model is None:
        return jsonify({"error": model_load_error or "Model not loaded"}), 500

    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]

    if file.filename == "":
        return jsonify({"error": "Empty file"}), 400

    try:
        image_bytes = file.read()

        processed_image = preprocess_image(image_bytes)

        predictions_raw = model.predict(processed_image, verbose=0)

        predicted_index = np.argmax(predictions_raw[0])
        predicted_label = LABELS_DICT[predicted_index]

        confidence = float(predictions_raw[0][predicted_index])

        predictions_dict = {}

        for i, label in enumerate(LABELS):
            clean_label = label.replace("_tumor", "")
            predictions_dict[clean_label] = float(predictions_raw[0][i])

        final_prediction = predicted_label.replace("_tumor", "")

        result = {
            "prediction": final_prediction,
            "confidence": confidence,
            "predictions": predictions_dict
        }

        print(f"🧠 Prediction: {final_prediction} ({confidence*100:.2f}%)")

        return jsonify(result)

    except Exception as e:
        print(f"❌ Prediction error: {e}")
        return jsonify({"error": str(e)}), 500


# ============================================================
# SERVER START
# ============================================================

if __name__ == "__main__":

    port = int(os.environ.get("PORT", 10000))

    print("🚀 NeuroScan AI server starting...")
    app.run(host="0.0.0.0", port=port)