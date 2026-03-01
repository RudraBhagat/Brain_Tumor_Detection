// ================================================
// BrainCare AI - Modern Prediction Interface
// Author: AI Assistant
// ================================================

document.addEventListener('DOMContentLoaded', () => {
    // --- CONFIGURATION ---
    const API_URL = '/predict';

    // --- ELEMENT SELECTORS ---
    const uploadForm = document.getElementById('uploadForm');
    const fileInput = document.getElementById('mriFile');
    const uploadArea = document.getElementById('uploadArea');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const progressContainer = document.getElementById('progressContainer');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const resultsContainer = document.getElementById('resultsContainer');
    const resultsPlaceholder = document.getElementById('resultsPlaceholder');

    // --- UTILITIES ---
    const updateProgress = (text, percentage) => {
        progressContainer.style.display = 'block';
        progressText.textContent = text;
        progressFill.style.width = `${percentage}%`;
    };

    const showResults = (data) => {
        const isTumor = data.predicted_label !== 'no_tumor';
        const resultClass = isTumor ? 'danger-gradient' : 'success-gradient';
        const resultIcon = isTumor ? 'fas fa-exclamation-triangle' : 'fas fa-check-circle';
        const resultHeader = isTumor ? 'POSITIVE FINDING' : 'NEGATIVE FINDING';

        resultsContainer.innerHTML = `
            <!-- Main Result Card -->
            <div class="result-card ${resultClass}">
                <div class="result-header">
                    <i class="${resultIcon}"></i>
                    <h3>${resultHeader}</h3>
                </div>
                <div class="result-details">
                    <div class="result-item">
                        <span class="label">Detected:</span>
                        <span class="value">${data.predicted_label.toUpperCase().replace(/_/g, ' ')}</span>
                    </div>
                    <div class="result-item">
                        <span class="label">Confidence:</span>
                        <span class="value">${data.confidence.toFixed(2)}%</span>
                    </div>
                </div>
            </div>

            <!-- Classification Details Card -->
            <div class="analysis-card">
                <div class="card-header">
                    <i class="fas fa-chart-pie"></i>
                    <h4>Classification Details</h4>
                </div>
                <div class="card-content">
                    <p>The AI model analyzed the MRI scan and classified the image based on trained patterns from thousands of medical images.</p>
                    <div class="classification-grid">
                        ${data.raw_predictions.map(p => `
                            <div class="classification-item">
                                <span class="class-label">${p.label.replace(/_/g, ' ').toUpperCase()}:</span>
                                <span class="class-value">${p.confidence.toFixed(2)}%</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>

            <!-- Medical Recommendation Card -->
            <div class="analysis-card">
                <div class="card-header">
                    <i class="fas fa-user-md"></i>
                    <h4>Medical Recommendation</h4>
                </div>
                <div class="card-content">
                    <div class="recommendation-content">
                        <div class="recommendation-text">
                            ${isTumor ?
                                'This analysis suggests the presence of a brain tumor. Please consult with a qualified medical professional immediately for proper diagnosis and treatment planning.' :
                                'No tumor detected in the analyzed image. However, this AI analysis should not replace professional medical advice. Consult a healthcare provider for any concerning symptoms.'
                            }
                        </div>
                        <div class="recommendation-actions">
                            <div class="action-item">
                                <i class="fas fa-calendar-check"></i>
                                <span>Schedule follow-up appointment</span>
                            </div>
                            <div class="action-item">
                                <i class="fas fa-phone"></i>
                                <span>Contact healthcare provider</span>
                            </div>
                            <div class="action-item">
                                <i class="fas fa-file-medical"></i>
                                <span>Bring this report to your doctor</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Action Buttons -->
            <div class="action-buttons">
                <button class="btn btn-secondary" onclick="resetInterface()">
                    <i class="fas fa-redo"></i> Analyze Another Image
                </button>
            </div>
        `;

        resultsPlaceholder.style.display = 'none';
        resultsContainer.style.display = 'block';
    };

    // --- RESET INTERFACE ---
    window.resetInterface = () => {
        uploadForm.reset();
        resultsContainer.style.display = 'none';
        resultsPlaceholder.style.display = 'block';
        progressContainer.style.display = 'none';
        analyzeBtn.disabled = false;
        analyzeBtn.innerHTML = '<i class="fas fa-search"></i> Analyze Image';
    };

    // --- DRAG AND DROP ---
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
        }, false);
    });

    uploadArea.addEventListener('drop', (e) => {
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            fileInput.files = e.dataTransfer.files;
        }
    });

    uploadArea.addEventListener('click', () => fileInput.click());

    // --- FORM SUBMISSION ---
    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(uploadForm);
        if (!formData.get('file')) return;

        analyzeBtn.disabled = true;
        analyzeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';
        updateProgress('Processing image...', 30);

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                body: formData
            });

            updateProgress('Analyzing results...', 70);

            if (!response.ok) {
                throw new Error('Prediction failed. Please try again.');
            }

            const data = await response.json();

            updateProgress('Complete!', 100);

            setTimeout(() => {
                showResults(data);
                progressContainer.style.display = 'none';
                analyzeBtn.disabled = false;
                analyzeBtn.innerHTML = '<i class="fas fa-search"></i> Analyze Image';
            }, 500);

        } catch (err) {
            console.error(err);
            resultsContainer.innerHTML = `
                <div class="error-card">
                    <i class="fas fa-times-circle"></i>
                    <h3>Error</h3>
                    <p>${err.message}</p>
                    <button class="btn btn-primary" onclick="resetInterface()">Try Again</button>
                </div>`;
            resultsPlaceholder.style.display = 'none';
            resultsContainer.style.display = 'block';
            progressContainer.style.display = 'none';
            analyzeBtn.disabled = false;
            analyzeBtn.innerHTML = '<i class="fas fa-search"></i> Analyze Image';
        }
    });

    // --- FILE INPUT CHANGE ---
    fileInput.addEventListener('change', () => {
        if (fileInput.files.length > 0) {
            analyzeBtn.disabled = false;
        } else {
            analyzeBtn.disabled = true;
        }
    });

    // --- INITIALIZATION ---
    analyzeBtn.disabled = true;
});

    uploadArea.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => handleFile(e.target.files[0]));

    // --- TAB SWITCHING ---
    const renderTabContent = (tabName, data) => {
        if (!data) return;
        if (tabName === 'results') renderResults(data);
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
        const resultClass = isTumor ? 'danger-gradient' : 'success-gradient';
        const resultIcon = isTumor ? 'fas fa-exclamation-triangle' : 'fas fa-check-circle';
        const resultHeader = isTumor ? 'POSITIVE FINDING' : 'NEGATIVE FINDING';
        const confidence = data.confidence.toFixed(2);

        // Generate suggestions based on tumor type
        let suggestions = '';
        if (isTumor) {
            switch(data.predicted_label) {
                case 'glioma_tumor':
                    suggestions = `
                        <div class="suggestions-card">
                            <h4><i class="fas fa-lightbulb"></i> Treatment Suggestions</h4>
                            <ul>
                                <li><strong>Surgery:</strong> Surgical removal of the tumor is often the first step.</li>
                                <li><strong>Radiation Therapy:</strong> High-energy radiation to target remaining cancer cells.</li>
                                <li><strong>Chemotherapy:</strong> Medications to kill cancer cells, often combined with radiation.</li>
                                <li><strong>Follow-up:</strong> Regular MRI scans and neurological check-ups.</li>
                            </ul>
                            <p class="warning"><i class="fas fa-exclamation-triangle"></i> Consult a neurosurgeon immediately for personalized treatment plan.</p>
                        </div>
                    `;
                    break;
                case 'meningioma_tumor':
                    suggestions = `
                        <div class="suggestions-card">
                            <h4><i class="fas fa-lightbulb"></i> Treatment Suggestions</h4>
                            <ul>
                                <li><strong>Surgery:</strong> Complete surgical resection is the primary treatment for accessible tumors.</li>
                                <li><strong>Radiation Therapy:</strong> Stereotactic radiosurgery (Gamma Knife) for tumors in difficult locations.</li>
                                <li><strong>Monitoring:</strong> Small, asymptomatic tumors may be monitored with regular imaging.</li>
                                <li><strong>Symptom Management:</strong> Medications for seizures or other symptoms if present.</li>
                            </ul>
                            <p class="warning"><i class="fas fa-exclamation-triangle"></i> Seek evaluation by a neurosurgeon for appropriate management.</p>
                        </div>
                    `;
                    break;
                case 'pituitary_tumor':
                    suggestions = `
                        <div class="suggestions-card">
                            <h4><i class="fas fa-lightbulb"></i> Treatment Suggestions</h4>
                            <ul>
                                <li><strong>Surgery:</strong> Transsphenoidal surgery to remove the tumor through the nose.</li>
                                <li><strong>Medication:</strong> Dopamine agonists or somatostatin analogs to shrink certain tumors.</li>
                                <li><strong>Radiation Therapy:</strong> Used when surgery is not possible or for residual tumor.</li>
                                <li><strong>Hormone Replacement:</strong> If pituitary function is affected.</li>
                            </ul>
                            <p class="warning"><i class="fas fa-exclamation-triangle"></i> Consult an endocrinologist and neurosurgeon for comprehensive care.</p>
                        </div>
                    `;
                    break;
            }
        }

        resultsContent.innerHTML = `
            <!-- Main Result Card -->
            <div class="result-card ${resultClass}">
                <div class="result-header">
                    <i class="${resultIcon}"></i>
                    <h3>${resultHeader}</h3>
                </div>
                <div class="result-details">
                    <div class="result-item">
                        <span class="label">Detected:</span>
                        <span class="value">${data.predicted_label.toUpperCase().replace(/_/g, ' ')}</span>
                    </div>
                    <div class="result-item">
                        <span class="label">Confidence:</span>
                        <span class="value">${confidence}%</span>
                    </div>
                </div>
            </div>

            <!-- Classification Details Card -->
            <div class="analysis-card">
                <div class="card-header">
                    <i class="fas fa-chart-pie"></i>
                    <h4>Classification Details</h4>
                </div>
                <div class="card-content">
                    <p>The AI model analyzed the MRI scan and classified the image based on trained patterns from thousands of medical images.</p>
                    <div class="classification-grid">
                        <div class="classification-item">
                            <span class="class-label">Glioma Tumor:</span>
                            <span class="class-value">${data.raw_predictions.find(p => p.label === 'glioma_tumor')?.confidence || 0}%</span>
                        </div>
                        <div class="classification-item">
                            <span class="class-label">Meningioma Tumor:</span>
                            <span class="class-value">${data.raw_predictions.find(p => p.label === 'meningioma_tumor')?.confidence || 0}%</span>
                        </div>
                        <div class="classification-item">
                            <span class="class-label">Pituitary Tumor:</span>
                            <span class="class-value">${data.raw_predictions.find(p => p.label === 'pituitary_tumor')?.confidence || 0}%</span>
                        </div>
                        <div class="classification-item">
                            <span class="class-label">No Tumor:</span>
                            <span class="class-value">${data.raw_predictions.find(p => p.label === 'no_tumor')?.confidence || 0}%</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Model Performance Card -->
            <div class="analysis-card">
                <div class="card-header">
                    <i class="fas fa-tachometer-alt"></i>
                    <h4>Model Performance</h4>
                </div>
                <div class="card-content">
                    <div class="performance-grid">
                        <div class="performance-item">
                            <div class="perf-icon">
                                <i class="fas fa-bullseye"></i>
                            </div>
                            <div class="perf-content">
                                <div class="perf-value">93.1%</div>
                                <div class="perf-label">Accuracy Rate</div>
                            </div>
                        </div>
                        <div class="performance-item">
                            <div class="perf-icon">
                                <i class="fas fa-clock"></i>
                            </div>
                            <div class="perf-content">
                                <div class="perf-value">&lt; 2s</div>
                                <div class="perf-label">Processing Time</div>
                            </div>
                        </div>
                        <div class="performance-item">
                            <div class="perf-icon">
                                <i class="fas fa-brain"></i>
                            </div>
                            <div class="perf-content">
                                <div class="perf-value">4</div>
                                <div class="perf-label">Classes Detected</div>
                            </div>
                        </div>
                        <div class="performance-item">
                            <div class="perf-icon">
                                <i class="fas fa-shield-alt"></i>
                            </div>
                            <div class="perf-content">
                                <div class="perf-value">100%</div>
                                <div class="perf-label">Privacy Protected</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Medical Recommendation Card -->
            <div class="analysis-card">
                <div class="card-header">
                    <i class="fas fa-user-md"></i>
                    <h4>Medical Recommendation</h4>
                </div>
                <div class="card-content">
                    <div class="recommendation-content">
                        <div class="recommendation-text">
                            ${isTumor ?
                                'This analysis suggests the presence of a brain tumor. Please consult with a qualified medical professional immediately for proper diagnosis and treatment planning.' :
                                'No tumor detected in the analyzed image. However, this AI analysis should not replace professional medical advice. Consult a healthcare provider for any concerning symptoms.'
                            }
                        </div>
                        <div class="recommendation-actions">
                            <div class="action-item">
                                <i class="fas fa-calendar-check"></i>
                                <span>Schedule follow-up appointment</span>
                            </div>
                            <div class="action-item">
                                <i class="fas fa-phone"></i>
                                <span>Contact healthcare provider</span>
                            </div>
                            <div class="action-item">
                                <i class="fas fa-file-medical"></i>
                                <span>Bring this report to your doctor</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            ${suggestions}

            <!-- Action Buttons -->
            <div class="action-buttons">
                <button class="btn btn-secondary" onclick="resetInterface()">
                    <i class="fas fa-redo"></i> Analyze Another Image
                </button>
            </div>
        `;

        resultsTabs.style.display = 'flex';
    };

    const renderConfidenceMap = (data) => {
        const predictions = data.raw_predictions.sort((a, b) => b.confidence - a.confidence);
        let html = '<h4>Confidence Distribution</h4><div class="confidence-container">';

        predictions.forEach((p, i) => {
            const isTop = i === 0;
            const percentage = p.confidence.toFixed(1);
            html += `
                <div class="confidence-item">
                    <div class="confidence-info">
                        <span class="confidence-label ${isTop ? 'top-confidence' : ''}">${p.label.toUpperCase().replace(/_/g, ' ')}</span>
                        <span class="confidence-value">${percentage}%</span>
                    </div>
                    <div class="confidence-bar">
                        <div class="confidence-fill ${isTop ? 'top-fill' : ''}" style="width: ${percentage}%;"></div>
                    </div>
                </div>
            `;
        });

        html += '</div>';
        resultsContent.innerHTML = html;
    };

    // --- RESET INTERFACE ---
    window.resetInterface = () => {
        uploadedFile = null;
        cachedPredictionData = null;
        fileInput.value = '';
        fileInfo.style.display = 'none';
        resultsContent.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-brain"></i>
                <h3>Ready for Analysis</h3>
                <p>Upload an MRI image and click "Analyze Image" to get started</p>
            </div>
        `;
        resultsTabs.style.display = 'none';
        tabButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.tab === 'results') btn.classList.add('active');
        });
        analyzeBtn.disabled = true;
        progressContainer.style.display = 'none';
    };

    // --- PREDICTION API ---
    analyzeBtn.addEventListener('click', async () => {
        if (!uploadedFile || !apiIsReady) return;

        analyzeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';
        analyzeBtn.disabled = true;
        updateProgress('Initializing analysis...', 10);

        const formData = new FormData();
        formData.append('file', uploadedFile);

        try {
            updateProgress('Processing image...', 30);

            const response = await fetch(API_URL, { method: 'POST', body: formData });

            updateProgress('Analyzing results...', 70);

            if (!response.ok) throw new Error('Prediction failed.');

            const data = await response.json();
            cachedPredictionData = data;

            updateProgress('Complete!', 100);

            setTimeout(() => {
                renderResults(data);
                progressContainer.style.display = 'none';
            }, 500);

        } catch (err) {
            console.error(err);
            resultsContent.innerHTML = `
                <div class="error-card">
                    <i class="fas fa-times-circle"></i>
                    <h3>Error</h3>
                    <p>${err.message}</p>
                    <button class="btn btn-primary" onclick="resetInterface()">Try Again</button>
                </div>`;
        } finally {
            analyzeBtn.innerHTML = '<i class="fas fa-search"></i> Analyze Image';
            analyzeBtn.disabled = !uploadedFile;
        }
    });

    // --- INITIALIZATION ---
    checkApiStatus();
    setInterval(checkApiStatus, 15000);
    resetInterface();
});