// ================================================
// AI Brain Tumor Detector UI Logic
// Author: Rudra Bhagat
// ================================================

document.addEventListener('DOMContentLoaded', () => {
    // --- CONFIGURATION ---
    const API_URL = '/predict';
    const API_STATUS_URL = '/';

    // --- ELEMENT SELECTORS ---
    const fileInput = document.getElementById('mriFile');
    const fileStatus = document.getElementById('fileStatus');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const uploadArea = document.getElementById('uploadArea');
    const imageViewer = document.getElementById('imageViewer');
    const progressBarContainer = document.getElementById('progressBarContainer');
    const progressBarFill = document.getElementById('progressBar');
    const progressBarLabel = document.getElementById('progressLabel');
    const reportContent = document.getElementById('reportContent');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const modelStatusElement = document.getElementById('modelStatus');

    // ✅ Added preview box element
    let imagePreviewBox = document.createElement('div');
    imagePreviewBox.classList.add('image-preview-box');
    imageViewer.appendChild(imagePreviewBox);

    // --- STATE MANAGEMENT ---
    let uploadedFile = null;
    let cachedPredictionData = null;
    let apiIsReady = false;

    // --- UTILITIES ---
    const updateProgressBar = (label, width) => {
        progressBarContainer.style.display = 'block';
        progressBarLabel.textContent = label;
        progressBarFill.style.width = `${width}%`;
    };

    const setApiStatus = (status, message) => {
        modelStatusElement.className = `model-status status-${status}`;
        modelStatusElement.textContent = `API Status: ${message}`;
        apiIsReady = (status === 'ready');
        analyzeBtn.disabled = !(uploadedFile && apiIsReady);
    };

    // --- BACKEND STATUS CHECK ---
    const checkApiStatus = async () => {
        try {
            const res = await fetch(API_STATUS_URL);
            if (res.ok) setApiStatus('ready', 'Operational');
            else setApiStatus('error', 'Model Unavailable');
        } catch {
            setApiStatus('connecting', 'Connecting...');
        }
    };

    // --- FILE HANDLING ---
    const handleFile = (file) => {
        if (!file || !file.type.startsWith('image/')) {
            fileStatus.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Invalid file type. Please upload an image.';
            uploadedFile = null;
            analyzeBtn.disabled = true;
            return;
        }

        uploadedFile = file;
        fileStatus.innerHTML = `<i class="fas fa-file-image"></i> <span class="file-name">${file.name}</span>`;

        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreviewBox.style.display = 'flex';
            imagePreviewBox.innerHTML = `<img src="${e.target.result}" alt="MRI Preview">`;
        };
        reader.readAsDataURL(file);

        analyzeBtn.disabled = !apiIsReady;
        resetReport();
    };

    const resetReport = () => {
        reportContent.innerHTML = `
            <div class="initial-msg-box">
                <i class="fas fa-brain initial-icon"></i>
                <h3>Ready for Analysis</h3>
                <p>Press RUN DIAGNOSTIC to begin AI-based tumor detection.</p>
            </div>
        `;
        tabButtons.forEach(btn => btn.disabled = true);
        document.querySelector('.tab-btn[data-tab="classification"]').classList.add('active');
    };

    fileInput.addEventListener('change', (e) => handleFile(e.target.files[0]));

    uploadArea.addEventListener('click', () => fileInput.click());

    // Drag and drop events
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        imageViewer.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
        }, false);
    });
    imageViewer.addEventListener('drop', (e) => {
        const file = e.dataTransfer.files[0];
        handleFile(file);
    });

    // --- TAB SWITCHING ---
    const renderTabContent = (tabName, data) => {
        if (!data) return;
        if (tabName === 'classification') renderResults(data);
        else if (tabName === 'confidence') renderConfidenceMap(data);
    };

    tabButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (!cachedPredictionData) return;
            tabButtons.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            renderTabContent(e.target.dataset.tab, cachedPredictionData);
        });
    });

    // --- RESULTS RENDERING ---
    const renderResults = (data) => {
        const isTumor = data.predicted_label !== 'no_tumor';
        const resultClass = isTumor ? 'tumor-result' : 'no-tumor-result';
        const resultIcon = isTumor ? 'fas fa-exclamation-triangle' : 'fas fa-check-circle';
        const resultHeader = isTumor ? 'POSITIVE FINDING' : 'NEGATIVE FINDING';
        const resultColorClass = isTumor ? 'severity-high' : 'severity-low';
        const confidence = data.confidence.toFixed(2);

        reportContent.innerHTML = `
            <div class="result-box ${resultClass}">
                <h3><i class="${resultIcon}"></i> ${resultHeader}</h3>
                <div class="confidence-display">
                    <span class="confidence-label">Detected:</span>
                    <span class="confidence-value">${data.predicted_label.toUpperCase().replace(/_/g, ' ')}</span>
                </div>
                <div class="confidence-display">
                    <span class="confidence-label">Confidence:</span>
                    <span class="confidence-value">${confidence}%</span>
                </div>
            </div>

            <div class="report-details">
                <h4>Summary</h4>
                <p>The system analyzed the MRI scan and produced the following results. For more details, view the Confidence Map tab.</p>
                <div class="detail-kpi">
                    <span><i class="fas fa-tag"></i> Classification</span>
                    <span class="${resultColorClass}">${data.predicted_label.toUpperCase().replace(/_/g, ' ')}</span>
                </div>
                <div class="detail-kpi">
                    <span><i class="fas fa-user-md"></i> Recommendation</span>
                    <span class="${resultColorClass}">${isTumor ? 'Consult a specialist immediately' : 'No tumor detected'}</span>
                </div>
            </div>

            <div style="text-align:center; margin-top:15px;">
                <button id="reUploadBtn" class="diagnostic-btn" style="width:auto;"><i class="fas fa-redo"></i> Re-upload Image</button>
            </div>
        `;

        document.getElementById('reUploadBtn').addEventListener('click', resetUI);
    };

    const renderConfidenceMap = (data) => {
        const predictions = data.raw_predictions.sort((a, b) => b.confidence - a.confidence);
        let html = '<h4>Confidence Distribution</h4><div class="confidence-map-container">';
        predictions.forEach((p, i) => {
            const isTop = i === 0;
            html += `
                <div class="confidence-bar-item">
                    <div class="label-row">
                        <span class="${isTop ? 'highest-label' : ''}">${p.label.toUpperCase().replace(/_/g, ' ')}</span>
                        <span>${p.confidence.toFixed(2)}%</span>
                    </div>
                    <div class="confidence-bar-bg">
                        <div class="confidence-bar-fill ${isTop ? 'highest-fill' : ''}" style="width: ${p.confidence}%;"></div>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        reportContent.innerHTML = html;
    };

    const resetUI = () => {
        uploadedFile = null;
        cachedPredictionData = null;
        fileInput.value = '';
        imagePreviewBox.innerHTML = '';
        imagePreviewBox.style.display = 'none';
        fileStatus.innerHTML = '<i class="fas fa-file-image"></i> <span class="file-name">No file selected.</span>';
        resetReport();
        analyzeBtn.disabled = true;
    };

    // --- PREDICTION API ---
    analyzeBtn.addEventListener('click', async () => {
        if (!uploadedFile || !apiIsReady) return;

        analyzeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';
        analyzeBtn.disabled = true;
        updateProgressBar('Processing MRI...', 25);

        const formData = new FormData();
        formData.append('file', uploadedFile);

        try {
            const response = await fetch(API_URL, { method: 'POST', body: formData });
            if (!response.ok) throw new Error('Prediction failed.');
            const data = await response.json();
            cachedPredictionData = data;
            updateProgressBar('Analysis Complete', 100);
            renderResults(data);
            tabButtons.forEach(btn => btn.disabled = false);
        } catch (err) {
            console.error(err);
            reportContent.innerHTML = `
                <div class="result-box tumor-result">
                    <h3><i class="fas fa-times-circle"></i> Error</h3>
                    <p>${err.message}</p>
                </div>`;
        } finally {
            analyzeBtn.innerHTML = '<i class="fas fa-terminal"></i> RUN DIAGNOSTIC';
            analyzeBtn.disabled = !uploadedFile;
            setTimeout(() => (progressBarContainer.style.display = 'none'), 1500);
        }
    });

    // --- INITIALIZATION ---
    checkApiStatus();
    setInterval(checkApiStatus, 15000);
});
