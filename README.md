# NeuroScan AI - Brain Tumor Detection (Flask + VGG16)

NeuroScan AI is a web-based deep learning application for MRI brain tumor classification.
It uses a VGG16 transfer-learning model and a Flask backend to provide fast predictions for:

- `glioma`
- `meningioma`
- `pituitary`
- `no_tumor`

This project is intended for educational and research use.

## Features

- MRI image upload and AI-based tumor class prediction
- Class-wise confidence scores in JSON response
- Informational pages about brain tumors and statistics
- Model details and expert-opinion pages
- Newly added legal/resource pages from footer:
   - Privacy Policy
   - Terms of Service
   - Medical Disclaimer
   - Contact Us
   - Documentation
   - Research Papers
- Responsive UI with a healthcare-focused theme

## Tech Stack

- Backend: Python, Flask, Flask-CORS
- ML/AI: TensorFlow/Keras, VGG16, NumPy, OpenCV
- Frontend: HTML, CSS, JavaScript, Font Awesome

## Project Structure

```text
app.py
brain_tumor_detection_model.keras
requirements.txt
runtime.txt
training_model.ipynb
HEALTHCARE_REDESIGN_NOTES.md
README.md

static/
   style.css
   script.js
   images/

templates/
   index.html
   information.html
   statistics.html
   experts.html
   model.html
   predict.html
   privacy_policy.html
   terms_of_service.html
   medical_disclaimer.html
   contact_us.html
   documentation.html
   research_papers.html

Testing/
   glioma_tumor/
   meningioma_tumor/
   no_tumor/
   pituitary_tumor/

Training/
   glioma_tumor/
   meningioma_tumor/
   no_tumor/
   pituitary_tumor/
```

## Application Routes

Main pages:

- `GET /` -> Home
- `GET /information` -> Information page
- `GET /statistics` -> Statistics page
- `GET /experts` -> Expert opinions
- `GET /model` -> Model details
- `GET /predict` -> Prediction page

Prediction API:

- `POST /predict` -> Accepts uploaded MRI image as form-data key `file`

Footer legal/resource pages:

- `GET /privacy-policy`
- `GET /terms-of-service`
- `GET /medical-disclaimer`
- `GET /contact-us`
- `GET /documentation`
- `GET /research-papers`

## Setup and Run

1. Clone the repository.
2. Create and activate a virtual environment.
3. Install dependencies.
4. Run the Flask app.

### Windows PowerShell

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py
```

Open: `http://localhost:8080`

## Model Notes

- The code recreates a VGG16-based architecture in `app.py` and loads weights from:
   - `brain_tumor_detection_model.keras`
- Input size used by the model pipeline: `150 x 150`

If the model file is missing, startup will report that the model could not be loaded.

## Quick Test

- Start the app.
- Open `/predict`.
- Upload MRI samples from the `Testing/` subfolders.
- Verify prediction label and confidence values.

## Important Disclaimer

This software is an AI-assisted analysis tool and not a medical diagnosis system.
Always consult qualified healthcare professionals for clinical decisions.

## License

MIT

