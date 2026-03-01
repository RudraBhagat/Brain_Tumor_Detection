# NeuroScan - AI-Powered Brain Tumor Detection

NeuroScan is a real-world, professional-grade web application that uses deep learning to analyze MRI brain scans for tumor detection. Built with Flask and a VGG16-based transfer learning model, the platform delivers accurate, fast, and privacy-conscious AI diagnostics suitable for medical research and educational purposes.

---

## 🚀 Features

- **AI Brain Tumor Classification** (Glioma, Meningioma, Pituitary, No Tumor)
- **Model Accuracy:** 92.97% on test data
- **Upload Interface:** Drag-and-drop or browse MRI images (JPG/PNG, ≤10 MB)
- **Real-time Results:** Confidence meters, classification breakdown, model performance metrics
- **Clinical Recommendations:** Treatment suggestions based on detected tumor type
- **Reset Button:** "Analyze Another Image" for repeated scans
- **Responsive & Accessible UI:** Mobile-first design, WCAG AA compliant, clean professional look
- **Educational Content:** Comprehensive information page with statistics, tumor types, risk factors, diagnosis methods, symptoms
- **Privacy Focus:** All processing performed locally on server, no external uploads

---

## 🛠️ Tech Stack

- **Backend:** Python, Flask, TensorFlow, OpenCV
- **Frontend:** HTML5, CSS3 (custom `healthcare.css`), JavaScript (`healthcare.js`), FontAwesome
- **Model:** VGG16 transfer learning (saved as `brain_tumor_detection_model.keras`)
- **Development:** Virtual environment (`venv`), requirements managed via `requirements.txt`

---

## 📁 Project Structure

```
app.py
brain_tumor_detection_model.keras
requirements.txt
runtime.txt
training_model.ipynb
static/
    healthcare.css
    healthcare.js
    ... (legacy files)
templates/
    home.html
    information.html
    prediction.html
    index.html (legacy)
Testing/  Training/ folders with sample MRI images
HEALTHCARE_REDESIGN_NOTES.md
README.md
```

---

## 🧩 Setup & Installation

1. **Clone the repository**
   ```bash
   git clone <repo-url> NeuroScan
   cd NeuroScan
   ```
2. **Create and activate a virtual environment**
   ```powershell
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1          # Windows PowerShell
   ```
3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```
4. **Run the server**
   ```bash
   python app.py
   ```
5. **Browse to** `http://localhost:8080` and start using the application.

> Note: The training notebook (`training_model.ipynb`) can be used to retrain the model on new data.

---

## 🧪 Testing

- Upload MRI images located under `Testing/` to verify prediction functionality.
- Use browser devtools to simulate various screen sizes for responsive layout.

---

## 🚧 Next Steps

- Add more image preprocessing and augmentation for improved accuracy
- Integrate user authentication and logging
- Deploy using a production-ready WSGI server (e.g., Gunicorn) on cloud infrastructure
- Add unit/integration tests for backend prediction logic and frontend components

---

## ⚠️ Disclaimer

This tool is intended for educational and research purposes only. The AI-generated analysis is **not** a medical diagnosis. Always consult a qualified healthcare professional for clinical decisions.

---

## 📝 License

MIT License – feel free to modify and use in your projects.

