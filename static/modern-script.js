// ================================================
// BrainCare AI - Modern Prediction Interface
// Author: AI Assistant
// ================================================

document.addEventListener('DOMContentLoaded', () => {
    // --- CONFIGURATION ---
    const API_URL = '/predict';
    const API_STATUS_URL = '/';

    // --- ELEMENT SELECTORS ---
    const fileInput = document.getElementById('mriFile');
    const uploadArea = document.getElementById('uploadArea');
    const fileInfo = document.getElementById('fileInfo');
    const filePreview = document.getElementById('filePreview');
    const fileName = document.getElementById('fileName');
    const fileStatus = document.getElementById('fileStatus');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const progressContainer = document.getElementById('progressContainer');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const resultsContent = document.getElementById('resultsContent');
    const resultsTabs = document.getElementById('resultsTabs');
    const tabButtons = document.querySelectorAll('.tab-btn');

    // --- STATE MANAGEMENT ---
    let uploadedFile = null;
    let cachedPredictionData = null;
    let apiIsReady = false;

    // --- UTILITIES ---
    const updateProgress = (text, percentage) => {
        progressContainer.style.display = 'block';
        progressText.textContent = text;
        progressFill.style.width = `${percentage}%`;
    };

    const setApiStatus = (status, message) => {
        // This would update a status indicator if we had one
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
            showFileError('Invalid file type. Please upload an image.');
            return;
        }

        uploadedFile = file;
        displayFileInfo(file);
        analyzeBtn.disabled = !apiIsReady;
    };

    const displayFileInfo = (file) => {
        fileInfo.style.display = 'flex';

        const reader = new FileReader();
        reader.onload = (e) => {
            filePreview.src = e.target.result;
        };
        reader.readAsDataURL(file);

        fileName.textContent = file.name;
        fileStatus.textContent = 'Ready for analysis';
        fileStatus.style.color = 'var(--text-secondary)';
    };

    const showFileError = (message) => {
        fileStatus.textContent = message;
        fileStatus.style.color = '#ef4444';
        uploadedFile = null;
        analyzeBtn.disabled = true;
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
            handleFile(file);
        });
    
        // --- INITIALIZATION ---
        checkApiStatus();
    });