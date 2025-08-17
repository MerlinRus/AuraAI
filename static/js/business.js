// Business website functionality

document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeTabs();
    initializeAnimations();
    initializeUpload();
    initializeForms();
});

// Navigation functionality
function initializeNavigation() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Navbar scroll effect
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

// Tab functionality for analytics preview
function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.dataset.tab;
            
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked button and corresponding content
            button.classList.add('active');
            const targetContent = document.getElementById(`${targetTab}-tab`);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });
}

// Animation and scroll effects
function initializeAnimations() {
    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    document.querySelectorAll('.feature-card, .demo-card, .pricing-card, .metric-card').forEach(el => {
        observer.observe(el);
    });
    
    // Counter animation for stats
    animateCounters();
}

// Counter animation
function animateCounters() {
    const counters = document.querySelectorAll('.stat-number, .metric-number');
    
    counters.forEach(counter => {
        const target = parseInt(counter.textContent.replace(/[^\d]/g, ''));
        if (isNaN(target)) return;
        
        let current = 0;
        const increment = target / 50;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                counter.textContent = counter.textContent.replace(/\d+/, target);
                clearInterval(timer);
            } else {
                counter.textContent = counter.textContent.replace(/\d+/, Math.floor(current));
            }
        }, 50);
    });
}

// Enhanced upload functionality
function initializeUpload() {
    const fileUploadArea = document.getElementById('fileUploadArea');
    const videoFileInput = document.getElementById('videoFile');
    const uploadForm = document.getElementById('uploadForm');
    const uploadBtn = document.getElementById('uploadBtn');
    const uploadProgress = document.getElementById('uploadProgress');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const progressPercent = document.getElementById('progressPercent');
    
    if (!fileUploadArea || !videoFileInput || !uploadForm) return;
    
    // Click to upload
    fileUploadArea.addEventListener('click', () => {
        videoFileInput.click();
    });
    
    // Drag and drop
    fileUploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        fileUploadArea.classList.add('dragover');
    });
    
    fileUploadArea.addEventListener('dragleave', () => {
        fileUploadArea.classList.remove('dragover');
    });
    
    fileUploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        fileUploadArea.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            videoFileInput.files = files;
            handleFileSelection(files[0]);
        }
    });
    
    // File selection
    videoFileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileSelection(e.target.files[0]);
        }
    });
    
    // Form submission
    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!videoFileInput.files[0]) {
            showNotification('Please select a video file', 'error');
            return;
        }
        
        await uploadAndAnalyze(videoFileInput.files[0]);
    });
    
    function handleFileSelection(file) {
        // Validate file type
        const allowedTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/quicktime'];
        if (!allowedTypes.includes(file.type)) {
            showNotification('Please select a valid video file (MP4, AVI, MOV)', 'error');
            return;
        }
        
        // Validate file size (500MB)
        const maxSize = 500 * 1024 * 1024;
        if (file.size > maxSize) {
            showNotification('File size must be less than 500MB', 'error');
            return;
        }
        
        // Update UI
        const uploadText = fileUploadArea.querySelector('.upload-text');
        uploadText.innerHTML = `
            <h4><i class="fas fa-check-circle" style="color: var(--success-color);"></i> File Selected</h4>
            <p><strong>${file.name}</strong></p>
            <small>Size: ${formatFileSize(file.size)}</small>
        `;
        
        uploadBtn.disabled = false;
        uploadBtn.innerHTML = '<i class="fas fa-magic"></i> Analyze Video';
    }
    
    async function uploadAndAnalyze(file) {
        // Show progress
        uploadProgress.style.display = 'block';
        uploadBtn.disabled = true;
        uploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        
        const formData = new FormData();
        formData.append('file', file);
        
        try {
            // Simulate progress
            updateProgress(10, 'Uploading video...');
            
            const response = await fetch('/upload-video/', {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            updateProgress(50, 'Analyzing video...');
            
            const result = await response.json();
            
            if (result.status === 'success') {
                updateProgress(100, 'Analysis complete!');
                
                // Show results
                setTimeout(() => {
                    displayResults(result.analytics);
                    scrollToSection('results');
                }, 1000);
                
                showNotification('Video analysis completed successfully!', 'success');
            } else {
                throw new Error(result.message || 'Analysis failed');
            }
            
        } catch (error) {
            console.error('Upload error:', error);
            showNotification(`Upload failed: ${error.message}`, 'error');
            resetUploadForm();
        }
    }
    
    function updateProgress(percent, message) {
        if (progressFill) progressFill.style.width = `${percent}%`;
        if (progressText) progressText.textContent = message;
        if (progressPercent) progressPercent.textContent = `${percent}%`;
    }
    
    function resetUploadForm() {
        uploadProgress.style.display = 'none';
        uploadBtn.disabled = true;
        uploadBtn.innerHTML = '<i class="fas fa-magic"></i> Analyze Video';
        
        const uploadText = fileUploadArea.querySelector('.upload-text');
        uploadText.innerHTML = `
            <h4>Drop your video here</h4>
            <p>or <span class="browse-link">browse files</span></p>
            <small>Supports MP4, AVI, MOV up to 500MB</small>
        `;
        
        videoFileInput.value = '';
    }
}

// Form handling
function initializeForms() {
    const contactForm = document.querySelector('.contact-form .form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData);
            
            // Simulate form submission
            showNotification('Thank you for your message! We\'ll get back to you soon.', 'success');
            contactForm.reset();
        });
    }
}

// Display analysis results
function displayResults(analytics) {
    const resultsSection = document.getElementById('results');
    const resultsContainer = document.getElementById('resultsContainer');
    
    if (!resultsSection || !resultsContainer) return;
    
    resultsSection.style.display = 'block';
    
    const resultsHTML = generateResultsHTML(analytics);
    resultsContainer.innerHTML = resultsHTML;
    
    // Initialize result interactions
    initializeResultInteractions();
}

function generateResultsHTML(analytics) {
    const summary = analytics.summary || {};
    const heatmap = analytics.heatmap || {};
    const desirePaths = analytics.desire_paths || {};
    const queueAnalysis = analytics.queue_analysis || {};
    
    return `
        <div class="results-grid">
            <!-- Summary Card -->
            <div class="result-card summary-card">
                <div class="card-header">
                    <h3><i class="fas fa-chart-line"></i> Analysis Summary</h3>
                </div>
                <div class="card-content">
                    <div class="summary-stats">
                        <div class="stat-item">
                            <span class="stat-number">${summary.total_visitors || 0}</span>
                            <span class="stat-label">Total Visitors</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-number">${summary.max_concurrent_visitors || 0}</span>
                            <span class="stat-label">Peak Concurrent</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-number">${Math.round(summary.avg_visit_duration || 0)}s</span>
                            <span class="stat-label">Avg Duration</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-number">${summary.peak_time || 'N/A'}</span>
                            <span class="stat-label">Peak Time</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Heatmap Card -->
            <div class="result-card image-card">
                <div class="card-header">
                    <h3><i class="fas fa-fire"></i> Heat Map Analysis</h3>
                    <div class="card-actions">
                        <button class="btn-icon" onclick="downloadImage('${heatmap.image_path}')">
                            <i class="fas fa-download"></i>
                        </button>
                    </div>
                </div>
                <div class="card-content">
                    ${heatmap.image_path ? 
                        `<div class="image-container">
                            <img src="${heatmap.image_path}" alt="Heat Map" class="result-image" onclick="openImageModal('${heatmap.image_path}', 'Heat Map Analysis')">
                        </div>` :
                        '<div class="no-data">No heat map data available</div>'
                    }
                    <div class="insights">
                        <h4>Key Insights</h4>
                        <ul>
                            <li>High-traffic areas identified for optimal product placement</li>
                            <li>Customer flow patterns reveal bottlenecks and opportunities</li>
                            <li>Zone analysis provides actionable layout recommendations</li>
                        </ul>
                    </div>
                </div>
            </div>
            
            <!-- Paths Card -->
            <div class="result-card image-card">
                <div class="card-header">
                    <h3><i class="fas fa-route"></i> Customer Journeys</h3>
                    <div class="card-actions">
                        <button class="btn-icon" onclick="downloadImage('${desirePaths.image_path}')">
                            <i class="fas fa-download"></i>
                        </button>
                    </div>
                </div>
                <div class="card-content">
                    ${desirePaths.image_path ? 
                        `<div class="image-container">
                            <img src="${desirePaths.image_path}" alt="Customer Paths" class="result-image" onclick="openImageModal('${desirePaths.image_path}', 'Customer Journey Analysis')">
                        </div>` :
                        '<div class="no-data">No path data available</div>'
                    }
                    <div class="path-stats">
                        <div class="stat-row">
                            <span class="stat-label">Total Paths:</span>
                            <span class="stat-value">${desirePaths.total_paths || 0}</span>
                        </div>
                        <div class="stat-row">
                            <span class="stat-label">Avg Duration:</span>
                            <span class="stat-value">${Math.round(desirePaths.avg_path_duration || 0)}s</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Queue Analysis Card -->
            <div class="result-card image-card">
                <div class="card-header">
                    <h3><i class="fas fa-users"></i> Queue Analysis</h3>
                    <div class="card-actions">
                        <button class="btn-icon" onclick="downloadImage('${queueAnalysis.image_path}')">
                            <i class="fas fa-download"></i>
                        </button>
                    </div>
                </div>
                <div class="card-content">
                    ${queueAnalysis.image_path ? 
                        `<div class="image-container">
                            <img src="${queueAnalysis.image_path}" alt="Queue Analysis" class="result-image" onclick="openImageModal('${queueAnalysis.image_path}', 'Queue Analysis')">
                        </div>` :
                        '<div class="no-data">No queue data available</div>'
                    }
                    <div class="queue-stats">
                        <div class="stat-row">
                            <span class="stat-label">Max Concurrent:</span>
                            <span class="stat-value">${queueAnalysis.max_concurrent || 0}</span>
                        </div>
                        <div class="stat-row">
                            <span class="stat-label">Avg Concurrent:</span>
                            <span class="stat-value">${queueAnalysis.avg_concurrent || 0}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Recommendations Card -->
            <div class="result-card recommendations-card full-width">
                <div class="card-header">
                    <h3><i class="fas fa-lightbulb"></i> AI Recommendations</h3>
                </div>
                <div class="card-content">
                    <div class="recommendations-grid">
                        <div class="recommendation-item">
                            <div class="recommendation-icon">
                                <i class="fas fa-store"></i>
                            </div>
                            <div class="recommendation-content">
                                <h4>Optimize Layout</h4>
                                <p>Based on heat map analysis, consider relocating high-demand items to high-traffic zones to increase visibility and sales.</p>
                                <span class="impact-badge positive">+15% Revenue Potential</span>
                            </div>
                        </div>
                        <div class="recommendation-item">
                            <div class="recommendation-icon">
                                <i class="fas fa-users"></i>
                            </div>
                            <div class="recommendation-content">
                                <h4>Staff Optimization</h4>
                                <p>Peak time analysis suggests adding staff during high-traffic periods to reduce wait times and improve customer experience.</p>
                                <span class="impact-badge positive">+20% Customer Satisfaction</span>
                            </div>
                        </div>
                        <div class="recommendation-item">
                            <div class="recommendation-icon">
                                <i class="fas fa-route"></i>
                            </div>
                            <div class="recommendation-content">
                                <h4>Improve Flow</h4>
                                <p>Customer journey analysis reveals bottlenecks. Consider widening pathways or repositioning displays to improve traffic flow.</p>
                                <span class="impact-badge positive">+10% Efficiency</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function initializeResultInteractions() {
    // Add click handlers for result images
    document.querySelectorAll('.result-image').forEach(img => {
        img.style.cursor = 'pointer';
        img.addEventListener('click', () => {
            openImageModal(img.src, img.alt);
        });
    });
}

// Utility functions
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

function formatFileSize(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 2rem;
        right: 2rem;
        background: ${type === 'success' ? 'var(--success-color)' : type === 'error' ? 'var(--error-color)' : 'var(--primary-color)'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-lg);
        z-index: 1000;
        animation: slideInRight 0.3s ease;
        max-width: 400px;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

function openImageModal(imageSrc, imageAlt) {
    const modal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    
    if (modal && modalImage) {
        modalImage.src = imageSrc;
        modalImage.alt = imageAlt;
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function closeImageModal() {
    const modal = document.getElementById('imageModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

function downloadImage(imagePath) {
    if (!imagePath) return;
    
    const link = document.createElement('a');
    link.href = imagePath;
    link.download = imagePath.split('/').pop();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Global functions for demo videos
window.selectDemoVideo = function(videoPath, videoName) {
    console.log(`Selected demo video: ${videoName} (${videoPath})`);
    
    // Show progress
    const uploadProgress = document.getElementById('uploadProgress');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const progressPercent = document.getElementById('progressPercent');
    
    if (uploadProgress) {
        uploadProgress.style.display = 'block';
        
        // Simulate analysis progress
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                
                // Simulate completion
                setTimeout(() => {
                    // Generate demo results
                    const demoResults = generateDemoResults(videoName);
                    displayResults(demoResults);
                    scrollToSection('results');
                    showNotification('Demo analysis completed!', 'success');
                }, 500);
            }
            
            if (progressFill) progressFill.style.width = `${progress}%`;
            if (progressText) progressText.textContent = `Analyzing ${videoName}...`;
            if (progressPercent) progressPercent.textContent = `${Math.round(progress)}%`;
        }, 200);
    }
};

function generateDemoResults(videoName) {
    return {
        summary: {
            total_visitors: Math.floor(Math.random() * 50) + 20,
            max_concurrent_visitors: Math.floor(Math.random() * 15) + 5,
            avg_concurrent_visitors: Math.floor(Math.random() * 8) + 3,
            avg_visit_duration: Math.floor(Math.random() * 180) + 60,
            peak_time: `${Math.floor(Math.random() * 12) + 10}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`
        },
        heatmap: {
            image_path: '/static/images/demo_heatmap.png'
        },
        desire_paths: {
            image_path: '/static/images/demo_paths.png',
            total_paths: Math.floor(Math.random() * 40) + 15,
            avg_path_duration: Math.floor(Math.random() * 120) + 30
        },
        queue_analysis: {
            image_path: '/static/images/demo_queue.png',
            max_concurrent: Math.floor(Math.random() * 15) + 5,
            avg_concurrent: Math.floor(Math.random() * 8) + 3
        }
    };
}

// Modal event listeners
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('imageModal');
    const modalClose = document.getElementById('modalClose');
    
    if (modalClose) {
        modalClose.addEventListener('click', closeImageModal);
    }
    
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeImageModal();
            }
        });
    }
    
    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && modal.style.display === 'flex') {
            closeImageModal();
        }
    });
});

// Add animation styles
const animationStyles = `
    <style>
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        
        .animate-in {
            animation: fadeInUp 0.6s ease forwards;
        }
        
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .result-card {
            background: white;
            border-radius: var(--radius-xl);
            padding: 1.5rem;
            box-shadow: var(--shadow-md);
            border: 1px solid var(--border-color);
            transition: all 0.3s ease;
        }
        
        .result-card:hover {
            transform: translateY(-4px);
            box-shadow: var(--shadow-xl);
        }
        
        .result-card.full-width {
            grid-column: 1 / -1;
        }
        
        .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid var(--border-color);
        }
        
        .card-header h3 {
            font-size: 1.125rem;
            font-weight: 600;
            color: var(--text-primary);
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .summary-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 1rem;
        }
        
        .image-container {
            margin-bottom: 1rem;
        }
        
        .result-image {
            width: 100%;
            height: auto;
            border-radius: var(--radius-md);
            cursor: pointer;
            transition: transform 0.3s ease;
        }
        
        .result-image:hover {
            transform: scale(1.02);
        }
        
        .insights ul {
            list-style: none;
            padding: 0;
        }
        
        .insights li {
            padding: 0.5rem 0;
            color: var(--text-secondary);
            border-bottom: 1px solid var(--border-color);
        }
        
        .insights li:last-child {
            border-bottom: none;
        }
        
        .stat-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.5rem 0;
            border-bottom: 1px solid var(--border-color);
        }
        
        .stat-row:last-child {
            border-bottom: none;
        }
        
        .stat-label {
            color: var(--text-secondary);
            font-weight: 500;
        }
        
        .stat-value {
            color: var(--text-primary);
            font-weight: 600;
        }
        
        .recommendations-grid {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
        }
        
        .recommendation-item {
            display: flex;
            gap: 1rem;
            padding: 1.5rem;
            background: var(--bg-secondary);
            border-radius: var(--radius-lg);
        }
        
        .recommendation-icon {
            width: 3rem;
            height: 3rem;
            background: var(--primary-color);
            color: white;
            border-radius: var(--radius-md);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.25rem;
            flex-shrink: 0;
        }
        
        .recommendation-content h4 {
            font-size: 1rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
            color: var(--text-primary);
        }
        
        .recommendation-content p {
            color: var(--text-secondary);
            margin-bottom: 0.75rem;
            line-height: 1.5;
        }
        
        .impact-badge {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            border-radius: var(--radius-sm);
            font-size: 0.875rem;
            font-weight: 600;
        }
        
        .impact-badge.positive {
            background: rgba(16, 185, 129, 0.1);
            color: var(--success-color);
        }
        
        .no-data {
            text-align: center;
            color: var(--text-muted);
            padding: 2rem;
            font-style: italic;
        }
        
        .notification-content {
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }
        
        @media (max-width: 768px) {
            .results-grid {
                grid-template-columns: 1fr;
            }
            
            .summary-stats {
                grid-template-columns: repeat(2, 1fr);
            }
            
            .recommendation-item {
                flex-direction: column;
                text-align: center;
            }
        }
    </style>
`;

document.head.insertAdjacentHTML('beforeend', animationStyles);