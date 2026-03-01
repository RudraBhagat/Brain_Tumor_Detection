/* =====================================================
   NEUROSCAN - HEALTHCARE JAVASCRIPT
   File Upload, Prediction, and UI Management
   ===================================================== */

document.addEventListener('DOMContentLoaded', function() {
    initializeUploadArea();
    initializeTabs();
    initializeReset();
});

/* ====== FILE UPLOAD HANDLING ====== */
function initializeUploadArea() {
    const uploadBox = document.getElementById('uploadBox');
    const fileInput = document.getElementById('fileInput');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const previewImage = document.getElementById('previewImage');
    const filePreview = document.getElementById('filePreview');
    const fileName = document.getElementById('fileName');
    const fileSize = document.getElementById('fileSize');

    if (!uploadBox) return;

    // Click to upload
    uploadBox.addEventListener('click', () => fileInput.click());
    const browseLink = document.querySelector('.browse-link');
    if (browseLink) {
        browseLink.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            fileInput.click();
        });
    }

    // Drag and drop
    uploadBox.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        uploadBox.classList.add('dragover');
    });

    uploadBox.addEventListener('dragleave', (e) => {
        e.preventDefault();
        e.stopPropagation();
        uploadBox.classList.remove('dragover');
    });

    uploadBox.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        uploadBox.classList.remove('dragover');

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
    });

    // File input change
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileSelect(e.target.files[0]);
        }
    });

    // Analyze button
    if (analyzeBtn) {
        analyzeBtn.addEventListener('click', () => {
            if (fileInput.files.length > 0) {
                submitPrediction(fileInput.files[0]);
            }
        });
    }

    function handleFileSelect(file) {
        // Validate file type and size
        const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        const maxSize = 10 * 1024 * 1024; // 10MB

        if (!validTypes.includes(file.type)) {
            showAlert('error', 'Invalid file type. Please upload a JPG or PNG image.');
            return;
        }

        if (file.size > maxSize) {
            showAlert('error', 'File size exceeds 10MB limit.');
            return;
        }

        // Update file input
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInput.files = dataTransfer.files;

        // Show file preview
        const reader = new FileReader();
        reader.onload = (e) => {
            if (previewImage) {
                previewImage.src = e.target.result;
                if (filePreview) filePreview.style.display = 'block';
                if (uploadBox) uploadBox.style.display = 'none';
            }
        };
        reader.readAsDataURL(file);

        if (fileName) {
            fileName.textContent = file.name;
        }
        if (fileSize) {
            const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
            fileSize.textContent = `${sizeMB} MB`;
        }

        if (analyzeBtn) {
            analyzeBtn.disabled = false;
        }

        showAlert('success', 'File loaded successfully. Click "Analyze MRI" to start the prediction.');
    }
}

function submitPrediction(file) {
    const analyzeBtn = document.getElementById('analyzeBtn');
    const progressBar = document.getElementById('progressBar');
    const resetBtn = document.getElementById('resetBtn');
    const originalText = analyzeBtn ? analyzeBtn.textContent : '';
    // hide reset if previously shown
    if (resetBtn) resetBtn.style.display = 'none';

    // Show progress
    if (progressBar) progressBar.style.display = 'block';
    if (analyzeBtn) {
        analyzeBtn.disabled = true;
        analyzeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';
    }

    // Create FormData
    const formData = new FormData();
    formData.append('file', file);

    // Send prediction request
    fetch('/predict', {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            if (progressBar) progressBar.style.display = 'none';

            if (data.error) {
                showAlert('error', data.error);
            } else {
                displayResults(data);
            }
        })
        .catch(error => {
            if (progressBar) progressBar.style.display = 'none';
            console.error('Error:', error);
            showAlert('error', 'An error occurred during prediction. Please try again.');
        })
        .finally(() => {
            if (analyzeBtn) {
                analyzeBtn.disabled = false;
                analyzeBtn.textContent = originalText;
            }
        });
}

/* ====== RESULTS DISPLAY ====== */
function displayResults(data) {
    const resultsContainer = document.getElementById('resultsContainer');
    const detailsSection = document.getElementById('detailsSection');

    if (!resultsContainer) return;

    // Get prediction data
    const prediction = data.prediction;
    const confidence = (data.confidence * 100).toFixed(2);
    const allPredictions = data.predictions || {};

    // Determine tumor type and styling
    const tumorTypes = {
        'glioma': { label: 'Glioma Tumor', color: 'primary', icon: 'fa-virus' },
        'meningioma': { label: 'Meningioma Tumor', color: 'secondary', icon: 'fa-circle' },
        'no_tumor': { label: 'No Tumor Detected', color: 'success', icon: 'fa-check-circle' },
        'pituitary': { label: 'Pituitary Tumor', color: 'info', icon: 'fa-square' }
    };

    const tumorInfo = tumorTypes[prediction] || { label: prediction, color: 'primary', icon: 'fa-brain' };

    // Build quick results HTML
    let resultsHTML = `
        <div class="result-card quick-result">
            <div class="result-header">
                <div class="result-icon ${tumorInfo.color}">
                    <i class="fas ${tumorInfo.icon}"></i>
                </div>
                <div class="result-info">
                    <h3>${tumorInfo.label}</h3>
                    <p class="confidence">
                        <strong>Confidence:</strong> <span class="confidence-value">${confidence}%</span>
                    </p>
                </div>
            </div>
            <div class="confidence-meter">
                <div class="confidence-bar" style="width: ${confidence}%"></div>
            </div>
        </div>

        <div class="classification-breakdown">
            <h4>Classification Probability</h4>
            <div class="classification-items">
    `;

    // Add classification for each tumor type
    const predictionOrder = ['glioma', 'meningioma', 'pituitary', 'no_tumor'];
    for (const key of predictionOrder) {
        if (!(key in allPredictions)) continue;

        const value = allPredictions[key];
        const percentage = (value * 100).toFixed(2);
        const barClass = key === prediction ? 'active' : '';
        const typeInfo = tumorTypes[key] || { label: key, color: 'primary' };

        resultsHTML += `
            <div class="classification-item ${barClass}">
                <div class="classification-label">${typeInfo.label}</div>
                <div class="classification-bar-container">
                    <div class="classification-bar ${typeInfo.color}" style="width: ${percentage}%"></div>
                </div>
                <div class="classification-percentage">${percentage}%</div>
            </div>
        `;
    }

    resultsHTML += `
            </div>
        </div>

        <div class="model-metrics">
            <h4>Model Performance</h4>
            <div class="metrics-grid">
                <div class="metric-item">
                    <div class="metric-label">Accuracy</div>
                    <div class="metric-value">92.97%</div>
                </div>
                <div class="metric-item">
                    <div class="metric-label">Algorithm</div>
                    <div class="metric-value">VGG16</div>
                </div>
            </div>
        </div>
    `;

    resultsContainer.innerHTML = resultsHTML;

    // display reset button
    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn) {
        resetBtn.style.display = 'block';
    }

    // Show the details section
    if (detailsSection) {
        detailsSection.style.display = 'block';
        displayDetailedResults(prediction, allPredictions, confidence);
        setTimeout(() => {
            detailsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 300);
    }

    showAlert('success', 'Analysis completed successfully!');
}

function displayDetailedResults(prediction, allPredictions, confidence) {
    const tumorTypes = {
        'glioma': { label: 'Glioma Tumor', color: 'primary', icon: 'fa-virus' },
        'meningioma': { label: 'Meningioma Tumor', color: 'secondary', icon: 'fa-circle' },
        'no_tumor': { label: 'No Tumor Detected', color: 'success', icon: 'fa-check-circle' },
        'pituitary': { label: 'Pituitary Tumor', color: 'info', icon: 'fa-square' }
    };

    const tumorInfo = tumorTypes[prediction] || { label: prediction, color: 'primary', icon: 'fa-brain' };
    const recommendations = getTreatmentRecommendations(prediction);

    // Main result card
    const mainResult = document.getElementById('mainResult');
    if (mainResult) {
        mainResult.innerHTML = `
            <div class="result-header">
                <div class="result-icon ${tumorInfo.color}">
                    <i class="fas ${tumorInfo.icon} fa-2x"></i>
                </div>
                <div class="result-info">
                    <h2>${tumorInfo.label}</h2>
                    <p class="confidence">
                        <strong>Confidence Score:</strong> <span class="confidence-value">${confidence}%</span>
                    </p>
                </div>
            </div>
        `;
    }

    // Classification bars
    const classificationBars = document.getElementById('classificationBars');
    if (classificationBars) {
        let barsHTML = '';
        const predictionOrder = ['glioma', 'meningioma', 'pituitary', 'no_tumor'];
        for (const key of predictionOrder) {
            if (!(key in allPredictions)) continue;
            const value = allPredictions[key];
            const percentage = (value * 100).toFixed(2);
            const typeInfo = tumorTypes[key] || { label: key, color: 'primary' };
            const isActive = key === prediction ? 'active' : '';

            barsHTML += `
                <div class="classification-item ${isActive}">
                    <div class="classification-label">${typeInfo.label}</div>
                    <div class="classification-bar-container">
                        <div class="classification-bar ${typeInfo.color}" style="width: ${percentage}%"></div>
                    </div>
                    <div class="classification-percentage">${percentage}%</div>
                </div>
            `;
        }
        classificationBars.innerHTML = barsHTML;
    }

    // Performance metrics
    const performanceMetrics = document.getElementById('performanceMetrics');
    if (performanceMetrics) {
        performanceMetrics.innerHTML = `
            <div class="metrics-grid">
                <div class="metric-item">
                    <div class="metric-label">Model Accuracy</div>
                    <div class="metric-value">92.97%</div>
                </div>
                <div class="metric-item">
                    <div class="metric-label">Processing Time</div>
                    <div class="metric-value">&lt; 2s</div>
                </div>
                <div class="metric-item">
                    <div class="metric-label">Algorithm</div>
                    <div class="metric-value">VGG16</div>
                </div>
                <div class="metric-item">
                    <div class="metric-label">Tumor Classes</div>
                    <div class="metric-value">4</div>
                </div>
            </div>
        `;
    }

    // Recommendation
    const recommendationDiv = document.getElementById('recommendation');
    if (recommendationDiv) {
        recommendationDiv.innerHTML = recommendations;
    }

    // Medical disclaimer
    const disclaimer = document.createElement('div');
    disclaimer.className = 'alert alert-info';
    disclaimer.innerHTML = `
        <div class="alert-icon">
            <i class="fas fa-info-circle"></i>
        </div>
        <div class="alert-content">
            <strong>Medical Disclaimer:</strong> This AI analysis is for informational purposes only and should not be considered a medical diagnosis.
            Please consult with a qualified healthcare professional for proper diagnosis and treatment.
        </div>
    `;

    const mainResultDiv = document.querySelector('.main-result');
    if (mainResultDiv && mainResultDiv.parentElement) {
        mainResultDiv.parentElement.appendChild(disclaimer);
    }
}

function getTreatmentRecommendations(tumorType) {
    const recommendations = {
        'no_tumor': `
            <div class="recommendation-item success">
                <div class="recommendation-icon">
                    <i class="fas fa-heart"></i>
                </div>
                <div class="recommendation-text">
                    <strong>Good News!</strong><br>
                    No tumor detected in the scan. Continue with regular preventive health checkups.
                </div>
            </div>
        `,
        'glioma': `
            <div class="recommendation-item warning">
                <div class="recommendation-icon">
                    <i class="fas fa-hospital-user"></i>
                </div>
                <div class="recommendation-text">
                    <strong>Immediate Action Recommended:</strong><br>
                    Schedule an appointment with a neurosurgeon or oncologist for further evaluation and imaging confirmation.
                </div>
            </div>
            <div class="recommendation-item">
                <strong>Typical Treatment Options:</strong>
                <ul>
                    <li>Surgery to remove the tumor</li>
                    <li>Radiation therapy</li>
                    <li>Chemotherapy</li>
                    <li>Combination therapy</li>
                </ul>
            </div>
        `,
        'meningioma': `
            <div class="recommendation-item warning">
                <div class="recommendation-icon">
                    <i class="fas fa-hospital-user"></i>
                </div>
                <div class="recommendation-text">
                    <strong>Specialist Consultation Required:</strong><br>
                    Consult a neurosurgeon for evaluation and treatment planning.
                </div>
            </div>
            <div class="recommendation-item">
                <strong>Treatment Approach:</strong>
                <ul>
                    <li>Surgical resection (if symptomatic)</li>
                    <li>Radiation therapy</li>
                    <li>Close monitoring if asymptomatic</li>
                    <li>Regular imaging follow-ups</li>
                </ul>
            </div>
        `,
        'pituitary': `
            <div class="recommendation-item warning">
                <div class="recommendation-icon">
                    <i class="fas fa-hospital-user"></i>
                </div>
                <div class="recommendation-text">
                    <strong>Endocrinologist Consultation Needed:</strong><br>
                    Contact an endocrinologist or neurosurgeon for comprehensive evaluation.
                </div>
            </div>
            <div class="recommendation-item">
                <strong>Management Options:</strong>
                <ul>
                    <li>Hormone level assessment</li>
                    <li>Surgery (transsphenoidal approach)</li>
                    <li>Radiation therapy if needed</li>
                    <li>Hormone replacement therapy</li>
                </ul>
            </div>
        `
    };

    return recommendations[tumorType] || `
        <div class="recommendation-item">
            <strong>Additional Steps:</strong>
            <ul>
                <li>Follow up with your healthcare provider</li>
                <li>Keep detailed medical records</li>
                <li>Schedule regular checkups</li>
            </ul>
        </div>
    `;
}

/* ====== UI UTILITIES ====== */
function showAlert(type, message) {
    // Create alert container if not exists
    let alertContainer = document.getElementById('alertContainer');

    if (!alertContainer) {
        alertContainer = document.createElement('div');
        alertContainer.id = 'alertContainer';
        alertContainer.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            z-index: 1000;
            max-width: 400px;
        `;
        document.body.appendChild(alertContainer);
    }

    // Create alert element
    const alert = document.createElement('div');
    const iconMap = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-warning',
        info: 'fa-info-circle'
    };

    alert.className = `alert alert-${type}`;
    alert.innerHTML = `
        <div class="alert-icon">
            <i class="fas ${iconMap[type]}"></i>
        </div>
        <div class="alert-content">
            ${message}
        </div>
    `;

    alert.style.cssText = `
        animation: slideIn 0.3s ease-out;
        margin-bottom: 10px;
    `;

    alertContainer.appendChild(alert);

    // Auto remove after 5 seconds
    setTimeout(() => {
        alert.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => alert.remove(), 300);
    }, 5000);
}

/* ====== RESET BEHAVIOR ====== */
function initializeReset() {
    const resetBtn = document.getElementById('resetBtn');
    if (!resetBtn) return;
    resetBtn.addEventListener('click', () => {
        // clear file input and preview
        const fileInput = document.getElementById('fileInput');
        const previewImage = document.getElementById('previewImage');
        const filePreview = document.getElementById('filePreview');
        const uploadBox = document.getElementById('uploadBox');
        const resultsContainer = document.getElementById('resultsContainer');
        const detailsSection = document.getElementById('detailsSection');
        const analyzeBtn = document.getElementById('analyzeBtn');

        if (fileInput) {
            fileInput.value = '';
        }
        if (previewImage) {
            previewImage.src = '';
        }
        if (filePreview) {
            filePreview.style.display = 'none';
        }
        if (uploadBox) {
            uploadBox.style.display = 'block';
        }
        if (resultsContainer) {
            resultsContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-brain"></i>
                    <h3>No Analysis Yet</h3>
                    <p>Upload an MRI image to see results here</p>
                </div>
            `;
        }
        if (detailsSection) {
            detailsSection.style.display = 'none';
        }
        if (analyzeBtn) {
            analyzeBtn.disabled = true;
        }
        resetBtn.style.display = 'none';
    });
}

/* ====== TABS ====== */
function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.getAttribute('data-tab');

            // Remove active class from all buttons and contents
            document.querySelectorAll('.tab-button').forEach(btn => {
                btn.classList.remove('active');
            });

            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });

            // Add active class to clicked button and corresponding content
            button.classList.add('active');
            const tabContent = document.getElementById(tabName);
            if (tabContent) {
                tabContent.classList.add('active');
            }
        });
    });
}

/* ====== CSS ANIMATIONS & STYLES (Injected) ====== */
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }

    .upload-box {
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .upload-box.dragover {
        background-color: #e6f0ff;
        border-color: #003d99;
    }

    .file-preview img {
        max-width: 100%;
        border-radius: 8px;
    }

    .result-card {
        animation: fadeIn 0.5s ease;
    }

    .result-header {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 16px;
    }

    .result-icon {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
    }

    .result-icon.primary {
        background: linear-gradient(135deg, #0066cc, #003d99);
    }

    .result-icon.secondary {
        background: linear-gradient(135deg, #00a699, #00654d);
    }

    .result-icon.success {
        background: linear-gradient(135deg, #27ae60, #1e8449);
    }

    .result-icon.info {
        background: linear-gradient(135deg, #3498db, #2874a6);
    }

    .result-info h3 {
        margin: 0 0 8px 0;
        font-size: 20px;
    }

    .result-info .confidence {
        margin: 0;
        color: #666;
        font-size: 14px;
    }

    .confidence-value {
        color: #0066cc;
        font-weight: 700;
    }

    .confidence-meter {
        width: 100%;
        height: 8px;
        background-color: #e0e0e0;
        border-radius: 9999px;
        overflow: hidden;
    }

    .confidence-bar {
        height: 100%;
        background: linear-gradient(90deg, #0066cc, #00a699);
        border-radius: 9999px;
        transition: width 0.6s ease;
    }

    .classification-breakdown {
        background: white;
        border: 1px solid #f0f0f0;
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 24px;
    }

    .classification-breakdown h4 {
        margin-top: 0;
        color: #1a1a1a;
        font-size: 16px;
    }

    .classification-items {
        display: grid;
        gap: 12px;
    }

    .classification-item {
        display: grid;
        grid-template-columns: 120px 1fr 60px;
        align-items: center;
        gap: 12px;
        padding: 12px;
        border-radius: 8px;
        background-color: #fafafa;
        transition: all 0.3s ease;
    }

    .classification-item.active {
        background-color: #e6f0ff;
        border: 1px solid #0066cc;
    }

    .classification-label {
        font-weight: 500;
        color: #333;
        font-size: 14px;
    }

    .classification-bar-container {
        height: 6px;
        background-color: #e0e0e0;
        border-radius: 3px;
        overflow: hidden;
    }

    .classification-bar {
        height: 100%;
        border-radius: 3px;
        transition: width 0.6s ease;
    }

    .classification-bar.primary {
        background: #0066cc;
    }

    .classification-bar.secondary {
        background: #00a699;
    }

    .classification-bar.success {
        background: #27ae60;
    }

    .classification-bar.info {
        background: #3498db;
    }

    .classification-percentage {
        text-align: right;
        font-weight: 600;
        color: #0066cc;
        font-size: 14px;
    }

    .model-metrics {
        background: white;
        border: 1px solid #f0f0f0;
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 24px;
    }

    .model-metrics h4 {
        margin-top: 0;
        color: #1a1a1a;
    }

    .metrics-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 12px;
    }

    .metric-item {
        background: linear-gradient(135deg, #f8f9ff 0%, #f0f7ff 100%);
        border: 1px solid #e6f0ff;
        border-radius: 8px;
        padding: 16px;
        text-align: center;
    }

    .metric-label {
        font-size: 12px;
        color: #666;
        font-weight: 500;
        margin-bottom: 8px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .metric-value {
        font-size: 20px;
        font-weight: 700;
        color: #0066cc;
    }

    .recommendation-item {
        display: flex;
        gap: 12px;
        align-items: flex-start;
        padding: 14px;
        border-radius: 8px;
        background-color: #fafafa;
        font-size: 14px;
        line-height: 1.6;
        margin-bottom: 12px;
    }

    .recommendation-item.success {
        background-color: #d5f4e6;
        border-left: 4px solid #27ae60;
    }

    .recommendation-item.warning {
        background-color: #fef5e7;
        border-left: 4px solid #f39c12;
    }

    .recommendation-icon {
        font-size: 20px;
        flex-shrink: 0;
        color: #0066cc;
        width: 24px;
        text-align: center;
    }

    .recommendation-item.success .recommendation-icon {
        color: #27ae60;
    }

    .recommendation-item.warning .recommendation-icon {
        color: #f39c12;
    }

    .recommendation-text {
        color: #333;
    }

    .recommendation-item ul {
        margin: 8px 0 0 0;
        padding-left: 20px;
    }

    .recommendation-item li {
        margin-bottom: 4px;
    }

    @media (max-width: 768px) {
        .result-header {
            flex-direction: column;
            text-align: center;
        }

        .classification-item {
            grid-template-columns: 1fr;
        }

        .metrics-grid {
            grid-template-columns: repeat(2, 1fr);
        }

        .result-icon {
            width: 50px;
            height: 50px;
            font-size: 24px;
        }
    }
`;
document.head.appendChild(style);
