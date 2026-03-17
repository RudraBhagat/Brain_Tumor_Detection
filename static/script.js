// ============================================
// NEUROSCAN AI - INTERACTIVE JAVASCRIPT
// ============================================

// ============================================
// GLOBAL STATE
// ============================================
let selectedFile = null;
let analysisResult = null;

// ============================================
// DOM READY
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initNavigation();
    initScrollEffects();
    initAnimations();
    initPredictionPage();
    initAnalytics();
});

// ============================================
// NAVIGATION
// ============================================
function initNavigation() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const navbar = document.getElementById('navbar');

    // Mobile menu toggle
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            const isClickInsideNav = navToggle.contains(event.target) || navMenu.contains(event.target);
            if (!isClickInsideNav && navMenu.classList.contains('active')) {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });

        // Close menu when clicking on a link
        const navLinks = navMenu.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }

    // Sticky navbar on scroll
    if (navbar) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#' && href.length > 1) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    const offsetTop = target.offsetTop - 80;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
}

// ============================================
// SCROLL EFFECTS
// ============================================
function initScrollEffects() {
    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe all cards and sections
    const elements = document.querySelectorAll(
        '.feature-card, .tumor-card, .doctor-card, .stat-hero-card, ' +
        '.country-item, .consensus-card, .advantage-card, .metric-card'
    );

    elements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // Parallax effect for hero background
    const heroBackground = document.querySelector('.hero-background');
    if (heroBackground) {
        window.addEventListener('scroll', function() {
            const scrolled = window.pageYOffset;
            heroBackground.style.transform = `translateY(${scrolled * 0.5}px)`;
        });
    }
}

// ============================================
// ANIMATIONS
// ============================================
function initAnimations() {
    // Animate numbers on scroll
    const animateNumbers = function() {
        const numbers = document.querySelectorAll('.stat-value, .confidence-value, .metric-value');
        
        numbers.forEach(number => {
            const text = number.textContent;
            const value = parseFloat(text.replace(/[^0-9.]/g, ''));
            
            if (value && !number.dataset.animated) {
                const observer = new IntersectionObserver(function(entries) {
                    entries.forEach(entry => {
                        if (entry.isIntersecting && !number.dataset.animated) {
                            number.dataset.animated = true;
                            animateValue(number, 0, value, 2000, text);
                            observer.unobserve(entry.target);
                        }
                    });
                }, { threshold: 0.5 });
                
                observer.observe(number);
            }
        });
    };

    function animateValue(element, start, end, duration, originalText) {
        const range = end - start;
        const increment = range / (duration / 16);
        let current = start;
        const suffix = originalText.replace(/[0-9.]/g, '');

        const timer = setInterval(function() {
            current += increment;
            if (current >= end) {
                current = end;
                clearInterval(timer);
            }
            
            if (suffix.includes('%')) {
                element.textContent = current.toFixed(1) + '%';
            } else if (suffix.includes('K')) {
                element.textContent = current.toFixed(0) + 'K+';
            } else if (suffix.includes('s')) {
                element.textContent = '<' + current.toFixed(0) + 's';
            } else {
                element.textContent = Math.round(current);
            }
        }, 16);
    }

    animateNumbers();

    // Animate progress bars
    const animateProgressBars = function() {
        const progressBars = document.querySelectorAll('.progress-fill, .bar-fill, .confidence-fill');
        
        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.dataset.animated) {
                    entry.target.dataset.animated = true;
                    const width = entry.target.style.width || '0%';
                    entry.target.style.width = '0%';
                    setTimeout(() => {
                        entry.target.style.width = width;
                    }, 100);
                }
            });
        }, { threshold: 0.5 });

        progressBars.forEach(bar => observer.observe(bar));
    };

    animateProgressBars();

    // Animate age bars
    const animateAgeBars = function() {
        const ageBars = document.querySelectorAll('.age-bar');
        
        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.dataset.animated) {
                    entry.target.dataset.animated = true;
                    const width = getComputedStyle(entry.target).getPropertyValue('--width') || '0%';
                    entry.target.style.setProperty('--width', '0%');
                    setTimeout(() => {
                        entry.target.style.setProperty('--width', width);
                    }, 100);
                }
            });
        }, { threshold: 0.5 });

        ageBars.forEach(bar => observer.observe(bar));
    };

    animateAgeBars();
}

// ============================================
// PREDICTION PAGE
// ============================================
function initPredictionPage() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const browseBtn = document.getElementById('browseBtn');
    const imagePreview = document.getElementById('imagePreview');
    const previewImg = document.getElementById('previewImg');
    const fileName = document.getElementById('fileName');
    const fileSize = document.getElementById('fileSize');
    const removeBtn = document.getElementById('removeBtn');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const uploadForm = document.getElementById('uploadForm');
    const uploadCard = document.getElementById('uploadCard');
    const resultsCard = document.getElementById('resultsCard');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const newScanBtn = document.getElementById('newScanBtn');
    const downloadBtn = document.getElementById('downloadBtn');

    if (!uploadArea) return; // Not on prediction page

    // Click to browse
    if (browseBtn) {
        browseBtn.addEventListener('click', function() {
            fileInput.click();
        });
    }

    if (uploadArea) {
        uploadArea.addEventListener('click', function() {
            fileInput.click();
        });
    }

    // File input change
    if (fileInput) {
        fileInput.addEventListener('change', function(e) {
            handleFileSelect(e.target.files[0]);
        });
    }

    // Drag and drop
    if (uploadArea) {
        uploadArea.addEventListener('dragover', function(e) {
            e.preventDefault();
            uploadArea.classList.add('drag-over');
        });

        uploadArea.addEventListener('dragleave', function(e) {
            e.preventDefault();
            uploadArea.classList.remove('drag-over');
        });

        uploadArea.addEventListener('drop', function(e) {
            e.preventDefault();
            uploadArea.classList.remove('drag-over');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                handleFileSelect(files[0]);
            }
        });
    }

    // Remove image
    if (removeBtn) {
        removeBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            resetUploadArea();
        });
    }

    // Form submission
    if (uploadForm) {
        uploadForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (selectedFile) {
                analyzeImage();
            }
        });
    }

    // New scan button
    if (newScanBtn) {
        newScanBtn.addEventListener('click', function() {
            resetUploadArea();
            resultsCard.style.display = 'none';
            uploadCard.style.display = 'block';
        });
    }

    // Download report
    if (downloadBtn) {
        downloadBtn.addEventListener('click', function() {
            downloadReport();
        });
    }

    // Helper functions
    function handleFileSelect(file) {
        if (!file) return;

        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!validTypes.includes(file.type)) {
            showNotification('Please select a valid image file (JPG or PNG)', 'error');
            return;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            showNotification('File size should be less than 10MB', 'error');
            return;
        }

        selectedFile = file;

        // Show preview
        const reader = new FileReader();
        reader.onload = function(e) {
            previewImg.src = e.target.result;
            fileName.textContent = file.name;
            fileSize.textContent = formatFileSize(file.size);
            
            uploadArea.style.display = 'none';
            imagePreview.style.display = 'block';
            analyzeBtn.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }

    function resetUploadArea() {
        selectedFile = null;
        fileInput.value = '';
        uploadArea.style.display = 'flex';
        imagePreview.style.display = 'none';
        analyzeBtn.style.display = 'none';
        previewImg.src = '';
    }

    function analyzeImage() {
        if (!selectedFile) {
            showNotification('Please select an MRI image before analysis.', 'error');
            return;
        }

        const formData = new FormData();
        formData.append('file', selectedFile);

        // Show loading
        loadingOverlay.style.display = 'flex';

        // Simulate loading steps
        setTimeout(() => {
            document.getElementById('step2').classList.add('active');
            document.getElementById('step2').innerHTML = '<i class="fas fa-check-circle"></i> Preprocessed';
        }, 800);

        setTimeout(() => {
            document.getElementById('step3').classList.add('active');
            document.getElementById('step3').innerHTML = '<i class="fas fa-spinner fa-spin"></i> Classifying...';
        }, 1600);

        // Send to backend
        fetch('/predict', {
            method: 'POST',
            body: formData
        })
        .then(async response => {
            const data = await response.json();
            if (!response.ok || data.error) {
                throw new Error(data.error || 'Prediction request failed.');
            }
            return data;
        })
        .then(data => {
            setTimeout(() => {
                document.getElementById('step3').innerHTML = '<i class="fas fa-check-circle"></i> Complete';
                
                setTimeout(() => {
                    loadingOverlay.style.display = 'none';
                    displayResults(data);
                }, 500);
            }, 2400);
        })
        .catch(error => {
            console.error('Error:', error);
            loadingOverlay.style.display = 'none';
            showNotification(error.message || 'An error occurred during analysis. Please try again.', 'error');
        });
    }

    function displayResults(data) {
        analysisResult = data;
        
        // Update result label and icon
        const resultLabel = document.getElementById('resultLabel');
        const resultIcon = document.getElementById('resultIcon');
        const confidenceValue = document.getElementById('confidenceValue');
        const confidenceFill = document.getElementById('confidenceFill');
        
        const prediction = normalizePredictionKey(data.prediction);
        const confidence = (data.confidence * 100).toFixed(1);
        
        // Set result text
        const resultText = {
            'glioma': 'Glioma Tumor Detected',
            'meningioma': 'Meningioma Tumor Detected',
            'pituitary': 'Pituitary Tumor Detected',
            'no': 'No Tumor Detected'
        };
        
        resultLabel.textContent = resultText[prediction] || 'Analysis Complete';
        
        // Set icon color based on result
        if (prediction === 'no') {
            resultIcon.style.background = 'linear-gradient(135deg, #4ECDC4 0%, #95E1D3 100%)';
        } else {
            resultIcon.style.background = 'linear-gradient(135deg, #FF6B6B 0%, #FFB347 100%)';
        }
        
        // Set confidence
        confidenceValue.textContent = confidence + '%';
        confidenceFill.style.width = confidence + '%';
        
        // Display probabilities
        const probabilityList = document.getElementById('probabilityList');
        probabilityList.innerHTML = '';
        
        const labels = {
            'glioma': 'Glioma',
            'meningioma': 'Meningioma',
            'pituitary': 'Pituitary',
            'no': 'No Tumor'
        };
        
        Object.keys(data.predictions).forEach(rawKey => {
            const key = normalizePredictionKey(rawKey);
            const value = (data.predictions[rawKey] * 100).toFixed(1);
            const item = document.createElement('div');
            item.className = 'probability-item';
            item.innerHTML = `
                <span class="probability-name">${labels[key] || key}</span>
                <span class="probability-value">${value}%</span>
            `;
            probabilityList.appendChild(item);
        });
        
        // Display tumor information
        const resultInfo = document.getElementById('resultInfo');
        const tumorInfo = getTumorInfo(prediction);
        resultInfo.innerHTML = `
            <h4>${tumorInfo.title}</h4>
            <p>${tumorInfo.description}</p>
        `;
        
        // Show results card
        uploadCard.style.display = 'none';
        resultsCard.style.display = 'block';
        resultsCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function getTumorInfo(prediction) {
        const info = {
            'glioma': {
                title: 'About Glioma',
                description: 'Gliomas are tumors that originate from glial cells. This is a malignant tumor that requires immediate medical attention. Please consult with a neurosurgeon or neuro-oncologist as soon as possible for proper diagnosis and treatment planning.'
            },
            'meningioma': {
                title: 'About Meningioma',
                description: 'Meningiomas arise from the meninges surrounding the brain and spinal cord. Most are benign and slow-growing. Consult with a neurosurgeon to determine if monitoring or treatment is needed based on size and location.'
            },
            'pituitary': {
                title: 'About Pituitary Tumor',
                description: 'Pituitary tumors develop in the pituitary gland and are usually benign. They may affect hormone production. Consult with an endocrinologist and neurosurgeon for evaluation and treatment options.'
            },
            'no': {
                title: 'Healthy Brain Scan',
                description: 'No tumor detected in this scan. This is a positive result! However, if you are experiencing symptoms, please consult with a healthcare professional for a comprehensive evaluation.'
            }
        };
        
        return info[prediction] || {
            title: 'Analysis Complete',
            description: 'Please consult with a healthcare professional for proper interpretation of these results.'
        };
    }

    function downloadReport() {
        if (!analysisResult) return;

        const reportContent = generateReportHTML();
        const blob = new Blob([reportContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `neuroscan-report-${new Date().getTime()}.html`;
        a.click();
        URL.revokeObjectURL(url);

        showNotification('Report downloaded successfully', 'success');
    }

    function generateReportHTML() {
        const prediction = analysisResult.prediction;
        const confidence = (analysisResult.confidence * 100).toFixed(1);
        const date = new Date().toLocaleString();

        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>NeuroScan AI - Analysis Report</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; }
        h1 { color: #2E86AB; }
        .header { border-bottom: 3px solid #2E86AB; padding-bottom: 20px; margin-bottom: 30px; }
        .result { background: #f0f8ff; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .confidence { font-size: 24px; color: #2E86AB; font-weight: bold; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #2E86AB; color: white; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #ddd; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🧠 NeuroScan AI - Brain Tumor Analysis Report</h1>
        <p><strong>Date:</strong> ${date}</p>
    </div>
    
    <div class="result">
        <h2>Analysis Result</h2>
        <p><strong>Prediction:</strong> ${prediction.toUpperCase()}</p>
        <p class="confidence">Confidence: ${confidence}%</p>
    </div>
    
    <h3>Detailed Probabilities</h3>
    <table>
        <thead>
            <tr>
                <th>Classification</th>
                <th>Probability</th>
            </tr>
        </thead>
        <tbody>
            ${Object.keys(analysisResult.predictions).map(key => `
                <tr>
                    <td>${key.charAt(0).toUpperCase() + key.slice(1)}</td>
                    <td>${(analysisResult.predictions[key] * 100).toFixed(1)}%</td>
                </tr>
            `).join('')}
        </tbody>
    </table>
    
    <div class="footer">
        <p><strong>Medical Disclaimer:</strong> This AI prediction is intended to assist medical professionals and should not be used as a sole basis for diagnosis. Always consult with qualified healthcare providers for proper medical evaluation and treatment.</p>
        <p>&copy; 2026 NeuroScan AI. All rights reserved.</p>
    </div>
</body>
</html>
        `;
    }

    function formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        else return (bytes / 1048576).toFixed(1) + ' MB';
    }

    function normalizePredictionKey(key) {
        if (!key) return '';
        if (key === 'no_tumor') return 'no';
        return key.replace('_tumor', '');
    }
}

// ============================================
// NOTIFICATIONS
// ============================================
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'error' ? '#FF6B6B' : type === 'success' ? '#4ECDC4' : '#2E86AB'};
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 16px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease;
        max-width: 300px;
    `;
    notification.textContent = message;

    // Add to document
    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Add notification animations
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
`;
document.head.appendChild(style);

// ============================================
// ANALYTICS (Placeholder)
// ============================================
function initAnalytics() {
    // Track page views
    console.log('Page loaded:', window.location.pathname);
    
    // You can integrate Google Analytics or other analytics tools here
}

// ============================================
// UTILITY FUNCTIONS
// ============================================
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ============================================
// ERROR HANDLING
// ============================================
window.addEventListener('error', function(e) {
    console.error('Global error:', e.error);
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled promise rejection:', e.reason);
});

// ============================================
// PERFORMANCE MONITORING
// ============================================
window.addEventListener('load', function() {
    if (window.performance) {
        const perfData = window.performance.timing;
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
        console.log(`Page load time: ${pageLoadTime}ms`);
    }
});

// ============================================
// CONSOLE BRANDING
// ============================================
console.log('%c🧠 NeuroScan AI', 'color: #2E86AB; font-size: 24px; font-weight: bold;');
console.log('%cAdvanced Brain Tumor Detection System', 'color: #4ECDC4; font-size: 14px;');
console.log('%c© 2026 All Rights Reserved', 'color: #6B7F8E; font-size: 12px;');
