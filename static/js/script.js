// Главный скрипт для Aura

// Функция для принудительного обновления CSS
function forceReloadCSS() {
    const links = document.querySelectorAll('link[rel="stylesheet"]');
    links.forEach(link => {
        if (link.href.includes('style.css')) {
            const newHref = link.href.split('?')[0] + '?v=' + Date.now();
            link.href = newHref;
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    // Функция задержки
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    // Элементы DOM
    const fileUploadArea = document.getElementById('fileUploadArea');
    const videoFileInput = document.getElementById('videoFile');
    const uploadForm = document.getElementById('uploadForm');
    const uploadBtn = document.getElementById('uploadBtn');
    const uploadProgress = document.getElementById('uploadProgress');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const resultsSection = document.getElementById('resultsSection');
    const resultsContainer = document.getElementById('resultsContainer');

    // Обработка drag & drop
    fileUploadArea.addEventListener('click', () => {
        videoFileInput.click();
    });
    
    // Инициализация прогресса
    progressFill.style.width = '0%';
    progressText.textContent = 'Готов к анализу';

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

    // Обработка выбора файла
    videoFileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileSelection(e.target.files[0]);
        }
    });

    function handleFileSelection(file) {
        // Проверка типа файла
        const allowedTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/quicktime'];
        if (!allowedTypes.includes(file.type)) {
            showError('Поддерживаются только видеофайлы форматов MP4, AVI, MOV');
            return;
        }

        // Проверка размера файла (500MB)
        const maxSize = 500 * 1024 * 1024;
        if (file.size > maxSize) {
            showError('Размер файла не должен превышать 500MB');
            return;
        }

        // Обновляем интерфейс
        fileUploadArea.querySelector('p').innerHTML = `
            <i class="fas fa-check-circle" style="color: #28a745;"></i><br>
            <strong>${file.name}</strong><br>
            <small>Размер: ${formatFileSize(file.size)}</small>
        `;
        
        uploadBtn.disabled = false;
        uploadBtn.innerHTML = '<i class="fas fa-magic"></i> Анализировать видео';
    }

    // Обработка отправки формы
    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!videoFileInput.files[0]) {
            showError('Пожалуйста, выберите видеофайл');
            return;
        }

        await uploadAndAnalyze(videoFileInput.files[0]);
    });

    async function uploadAndAnalyze(file) {
        // Показываем прогресс
        uploadProgress.style.display = 'block';
        uploadBtn.disabled = true;
        uploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Обрабатываем...';
        
        const formData = new FormData();
        formData.append('file', file);

        try {
            // Интересные сообщения загрузки
            const loadingMessages = [
                '🎬 Загружаем видео...',
                '🔍 Анализируем кадры...',
                '👥 Ищем людей...',
                '🎯 Отслеживаем движения...',
                '🛤️ Выстраиваем тропы...',
                '🔥 Строим тепловую карту...',
                '📊 Анализируем загруженность...',
                '✨ Сглаживаем траектории...',
                '🎨 Создаем визуализации...',
                '📋 Формируем отчет...'
            ];
            
            let messageIndex = 0;
            
            // Немедленно показываем первый прогресс
            updateProgress(5, loadingMessages[0]);
            
            // Обновляем сообщения каждые 1.5 секунды
            const messageInterval = setInterval(() => {
                if (messageIndex < loadingMessages.length) {
                    // Сохраняем текущий прогресс
                    const currentProgress = progressFill.style.width;
                    const progressPercent = currentProgress ? currentProgress.replace('%', '') : '0';
                    
                    // Обновляем сообщение, но сохраняем проценты
                    if (parseInt(progressPercent) > 0) {
                        progressText.innerHTML = `${loadingMessages[messageIndex]} <span class="progress-percent">${progressPercent}%</span>`;
                    } else {
                        progressText.textContent = loadingMessages[messageIndex];
                    }
                    messageIndex++;
                }
            }, 2000); // Увеличиваем интервал до 2 секунд для лучшей читаемости
            
            // Симуляция прогресса загрузки
            updateProgress(10, loadingMessages[0]);
            
            // Показываем прогресс загрузки
            updateProgress(15, loadingMessages[1]);
            
            const response = await fetch('/upload-video/', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`Ошибка HTTP: ${response.status}`);
            }

            // Показываем прогресс анализа с задержками
            await sleep(400);
            updateProgress(25, loadingMessages[2]);
            
            await sleep(400);
            updateProgress(35, loadingMessages[3]);
            
            await sleep(400);
            updateProgress(45, loadingMessages[4]);
            
            await sleep(400);
            updateProgress(55, loadingMessages[5]);
            
            await sleep(400);
            updateProgress(65, loadingMessages[6]);
            
            const result = await response.json();
            
            if (result.status === 'success') {
                await sleep(400);
                updateProgress(75, loadingMessages[7]);
                
                await sleep(400);
                updateProgress(85, loadingMessages[8]);
                
                // Небольшая задержка для симуляции обработки
                await sleep(600);
                
                updateProgress(95, loadingMessages[9]);
                
                await sleep(400);
                
                updateProgress(100, '🎉 Анализ завершен!');
                
                // Останавливаем обновление сообщений
                clearInterval(messageInterval);
                
                // Сохраняем имя файла для системы оценки
                window.currentVideoFilename = result.analytics.video_filename || file.name;
                
                // Показываем результаты
                displayResults(result.analytics);
                
            } else {
                throw new Error(result.message || 'Ошибка анализа видео');
            }
            
        } catch (error) {
            console.error('Ошибка:', error);
            showError(`Ошибка обработки видео: ${error.message}`);
            resetUploadForm();
            // Скрываем прогресс при ошибке
            uploadProgress.style.display = 'none';
        }
    }

    function updateProgress(percent, message) {
        // Плавная анимация прогресса
        progressFill.style.width = `${percent}%`;
        
        // Анимация чисел для процентов
        if (percent > 0) {
            progressText.innerHTML = `${message} <span class="progress-percent">${percent}%</span>`;
        } else {
            progressText.textContent = message;
        }
        
        // Добавляем класс для анимации
        progressFill.classList.add('progressing');
        
        // Убираем класс после анимации
        setTimeout(() => {
            progressFill.classList.remove('progressing');
        }, 800);
        
        // Отладочная информация
        console.log(`📊 Прогресс: ${percent}% - ${message}`);
    }

    function displayResults(analytics) {
        // Скрываем прогресс
        uploadProgress.style.display = 'none';
        
        // Показываем секцию результатов
        resultsSection.style.display = 'block';
        
        // Генерируем HTML с результатами
        const resultsHTML = generateResultsHTML(analytics);
        resultsContainer.innerHTML = resultsHTML;
        
        // Показываем секцию оценки траекторий
        const ratingSection = document.getElementById('ratingSection');
        if (ratingSection) {
            ratingSection.style.display = 'block';
        }
        
        // Прокручиваем к результатам
        resultsSection.scrollIntoView({ behavior: 'smooth' });
        
        // Обновляем кнопку
        uploadBtn.innerHTML = '<i class="fas fa-plus"></i> Анализировать другое видео';
        uploadBtn.disabled = false;
    }

    function generateResultsHTML(analytics) {
        const summary = analytics.summary || {};
        const heatmap = analytics.heatmap || {};
        const desirePaths = analytics.desire_paths || {};
        const queueAnalysis = analytics.queue_analysis || {};
        const anomalies = analytics.anomalies || {};

        return `
            <div class="results-grid">
                <!-- Сводка -->
                <div class="result-card">
                    <h4><i class="fas fa-chart-line"></i> Общая сводка</h4>
                    <div class="stats-grid">
                        <div class="stat">
                            <span class="stat-value">${summary.total_visitors || 0}</span>
                            <span class="stat-label">Всего посетителей</span>
                        </div>
                        <div class="stat">
                            <span class="stat-value">${summary.max_concurrent_visitors || 0}</span>
                            <span class="stat-label">Максимум одновременно</span>
                        </div>
                        <div class="stat">
                            <span class="stat-value">${Math.round(summary.avg_visit_duration || 0)}с</span>
                            <span class="stat-label">Среднее время визита</span>
                        </div>
                        <div class="stat">
                            <span class="stat-value">${summary.peak_time || 'N/A'}</span>
                            <span class="stat-label">Время пика</span>
                        </div>
                    </div>
                </div>

                <!-- Тепловая карта -->
                <div class="result-card featured-card">
                    <h4><i class="fas fa-fire"></i> Тепловая карта популярности</h4>
                    ${heatmap.image_path ? 
                        `<div class="image-container">
                            <img src="${heatmap.image_path}" alt="Тепловая карта" class="result-image impressive-image">
                            <div class="image-overlay">
                                <span class="overlay-text">Наглядная карта активности</span>
                            </div>
                        </div>` :
                        '<p class="no-data">Данные не доступны</p>'
                    }
                    ${heatmap.hot_spots && heatmap.hot_spots.length > 0 ? 
                        `<div class="hot-spots">
                            <p><strong>🔥 Зоны повышенной активности:</strong></p>
                            <ul>
                                ${heatmap.hot_spots.slice(0, 3).map(spot => 
                                    `<li><span class="zone-indicator">●</span> ${spot.location}</li>`
                                ).join('')}
                            </ul>
                        </div>` : ''
                    }
                </div>

                <!-- Тропы желаний -->
                <div class="result-card featured-card">
                    <h4><i class="fas fa-route"></i> Тропы желаний посетителей</h4>
                    ${desirePaths.image_path ? 
                        `<div class="image-container">
                            <img src="${desirePaths.image_path}" alt="Тропы желаний" class="result-image impressive-image">
                            <div class="image-overlay">
                                <span class="overlay-text">Реальные маршруты движения</span>
                            </div>
                        </div>` :
                        '<p class="no-data">Данные не доступны</p>'
                    }
                    <div class="path-insights">
                        <p><strong>📊 Проанализировано маршрутов:</strong> ${desirePaths.total_paths || 0}</p>
                        <p><strong>⏱️ Средняя длительность пути:</strong> ${Math.round(desirePaths.avg_path_duration || 0)}с</p>
                        ${desirePaths.description ? `<p><strong>💡 Описание:</strong> ${desirePaths.description}</p>` : ''}
                    </div>
                </div>

                <!-- Анализ очередей -->
                <div class="result-card">
                    <h4><i class="fas fa-users-line"></i> Анализ загруженности</h4>
                    ${queueAnalysis.image_path ? 
                        `<img src="${queueAnalysis.image_path}" alt="Анализ очередей" class="result-image">` :
                        '<p class="no-data">Данные не доступны</p>'
                    }
                    <p><strong>Максимальная загруженность:</strong> ${queueAnalysis.max_concurrent || 0} человек</p>
                    <p><strong>Средняя загруженность:</strong> ${queueAnalysis.avg_concurrent || 0} человек</p>
                </div>

                <!-- Аномалии -->
                <div class="result-card">
                    <h4><i class="fas fa-exclamation-triangle"></i> Обнаруженные аномалии</h4>
                    ${anomalies.anomalies && anomalies.anomalies.length > 0 ?
                        `<div class="anomalies-list">
                            ${anomalies.anomalies.slice(0, 3).map(anomaly => 
                                `<div class="anomaly-item severity-${anomaly.severity}">
                                    <strong>${getAnomalyTypeLabel(anomaly.type)}</strong>
                                    <p>${anomaly.description}</p>
                                </div>`
                            ).join('')}
                        </div>` :
                        '<p class="no-data">Аномалий не обнаружено</p>'
                    }
                </div>

                <!-- Рекомендации -->
                <div class="result-card full-width">
                    <h4><i class="fas fa-lightbulb"></i> Рекомендации</h4>
                    <div class="recommendations">
                        <div class="recommendation">
                            <i class="fas fa-store"></i>
                            <div>
                                <strong>Оптимизация планировки</strong>
                                <p>Переместите популярные товары в зоны с высокой активностью согласно тепловой карте</p>
                            </div>
                        </div>
                        <div class="recommendation">
                            <i class="fas fa-route"></i>
                            <div>
                                <strong>Улучшение flow</strong>
                                <p>Оптимизируйте расположение элементов согласно популярным маршрутам движения</p>
                            </div>
                        </div>
                        ${summary.max_concurrent_visitors > summary.avg_concurrent_visitors * 1.5 ?
                            `<div class="recommendation">
                                <i class="fas fa-user-plus"></i>
                                <div>
                                    <strong>Управление персоналом</strong>
                                    <p>Рассмотрите увеличение персонала в пиковые часы (${summary.peak_time})</p>
                                </div>
                            </div>` : ''
                        }
                    </div>
                </div>
            </div>
        `;
    }

    function getAnomalyTypeLabel(type) {
        const labels = {
            'stationary_person': 'Блокировка прохода',
            'crowd_surge': 'Скопление людей',
            'long_visit': 'Долгое посещение'
        };
        return labels[type] || type;
    }

    function resetUploadForm() {
        uploadProgress.style.display = 'none';
        uploadBtn.disabled = false;
        uploadBtn.innerHTML = '<i class="fas fa-magic"></i> Анализировать видео';
        fileUploadArea.querySelector('p').innerHTML = 'Перетащите видео сюда или <span class="browse-link">выберите файл</span>';
        videoFileInput.value = '';
        
        // Сбрасываем прогресс
        progressFill.style.width = '0%';
        progressText.textContent = 'Готов к анализу';
    }

    function showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <span>${message}</span>
        `;
        
        // Добавляем стили для ошибки, если их еще нет
        if (!document.getElementById('error-styles')) {
            const style = document.createElement('style');
            style.id = 'error-styles';
            style.textContent = `
                .error-message {
                    background: #f8d7da;
                    color: #721c24;
                    padding: 15px 20px;
                    border-radius: 10px;
                    margin: 20px 0;
                    border: 1px solid #f5c6cb;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    animation: slideIn 0.3s ease;
                }
                @keyframes slideIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `;
            document.head.appendChild(style);
        }
        
        // Удаляем предыдущие ошибки
        const existingErrors = document.querySelectorAll('.error-message');
        existingErrors.forEach(error => error.remove());
        
        // Добавляем новую ошибку
        uploadProgress.parentNode.insertBefore(errorDiv, uploadProgress);
        
        // Автоматически скрываем через 5 секунд
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.remove();
            }
        }, 5000);
    }

    function formatFileSize(bytes) {
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        if (bytes === 0) return '0 Byte';
        const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    }
});

// Дополнительные стили для результатов
const additionalStyles = `
    <style>
        .results-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 25px;
        }
        
        .result-card {
            background: rgba(255, 255, 255, 0.9);
            padding: 25px;
            border-radius: 15px;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
            border: 1px solid rgba(102, 126, 234, 0.1);
        }
        
        .result-card.full-width {
            grid-column: 1 / -1;
        }
        
        .featured-card {
            position: relative;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none !important;
        }
        
        .featured-card h4 {
            color: white;
            margin-bottom: 25px;
        }
        
        .featured-card h4 i {
            color: #ffd700;
        }
        
        .image-container {
            position: relative;
            overflow: hidden;
            border-radius: 12px;
            margin-bottom: 20px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }
        
        .impressive-image {
            width: 100%;
            height: auto;
            transition: transform 0.3s ease;
            border-radius: 12px;
        }
        
        .image-container:hover .impressive-image {
            transform: scale(1.02);
        }
        
        .image-overlay {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
            color: white;
            padding: 15px;
            transform: translateY(100%);
            transition: transform 0.3s ease;
        }
        
        .image-container:hover .image-overlay {
            transform: translateY(0);
        }
        
        .overlay-text {
            font-weight: 600;
            font-size: 1.1em;
        }
        
        .hot-spots ul {
            list-style: none;
            padding: 0;
        }
        
        .hot-spots li {
            background: rgba(255, 255, 255, 0.1);
            padding: 12px 15px;
            margin-bottom: 8px;
            border-radius: 8px;
            backdrop-filter: blur(10px);
        }
        
        .zone-indicator {
            color: #ff6b6b;
            font-size: 1.2em;
            margin-right: 10px;
        }
        
        .path-insights {
            background: rgba(255, 255, 255, 0.1);
            padding: 20px;
            border-radius: 10px;
            backdrop-filter: blur(10px);
        }
        
        .path-insights p {
            margin-bottom: 10px;
            color: white;
        }
        
        .result-card h4 {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 20px;
            color: #333;
            font-size: 1.2em;
        }
        
        .result-card h4 i {
            color: #667eea;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
        }
        
        .stat {
            text-align: center;
            padding: 15px;
            background: rgba(102, 126, 234, 0.05);
            border-radius: 10px;
        }
        
        .stat-value {
            display: block;
            font-size: 1.8em;
            font-weight: bold;
            color: #667eea;
            margin-bottom: 5px;
        }
        
        .stat-label {
            font-size: 0.9em;
            color: #666;
        }
        
        .result-image {
            width: 100%;
            height: auto;
            border-radius: 10px;
            margin-bottom: 15px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }
        
        .no-data {
            text-align: center;
            color: #999;
            font-style: italic;
            padding: 40px 20px;
            background: rgba(0, 0, 0, 0.02);
            border-radius: 10px;
        }
        
        .hot-spots, .anomalies-list {
            margin-top: 15px;
        }
        
        .anomaly-item {
            padding: 12px 15px;
            border-radius: 8px;
            margin-bottom: 10px;
            border-left: 4px solid;
        }
        
        .anomaly-item.severity-low {
            background: rgba(40, 167, 69, 0.1);
            border-left-color: #28a745;
        }
        
        .anomaly-item.severity-medium {
            background: rgba(255, 193, 7, 0.1);
            border-left-color: #ffc107;
        }
        
        .anomaly-item.severity-high {
            background: rgba(220, 53, 69, 0.1);
            border-left-color: #dc3545;
        }
        
        .recommendations {
            display: flex;
            flex-direction: column;
            gap: 15px;
        }
        
        .recommendation {
            display: flex;
            align-items: flex-start;
            gap: 15px;
            padding: 20px;
            background: rgba(102, 126, 234, 0.05);
            border-radius: 10px;
        }
        
        .recommendation i {
            color: #667eea;
            font-size: 1.3em;
            margin-top: 3px;
        }
        
        .recommendation strong {
            display: block;
            margin-bottom: 5px;
            color: #333;
        }
        
        .recommendation p {
            color: #666;
            line-height: 1.5;
            margin: 0;
        }
        
        @media (max-width: 768px) {
            .results-grid {
                grid-template-columns: 1fr;
            }
            
            .stats-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
`;

// Добавляем стили в head
document.head.insertAdjacentHTML('beforeend', additionalStyles);

// Обработчик для кнопки оценки траекторий
document.addEventListener('DOMContentLoaded', function() {
    const startRatingBtn = document.getElementById('startRatingBtn');
    if (startRatingBtn) {
        startRatingBtn.addEventListener('click', function() {
            // Получаем имя файла из результатов
            const resultsContainer = document.getElementById('resultsContainer');
            if (resultsContainer) {
                // Извлекаем имя файла из результатов (упрощенная версия)
                // В реальном приложении нужно передавать это через переменную
                const videoFilename = getCurrentVideoFilename();
                if (videoFilename) {
                    // Переходим к первой траектории для оценки
                    window.location.href = `/trajectory-rating/${encodeURIComponent(videoFilename)}/0`;
                } else {
                    alert('Не удалось определить имя видео. Попробуйте загрузить видео заново.');
                }
            }
        });
    }
});

function getCurrentVideoFilename() {
    // Получаем имя файла из глобальной переменной
    return window.currentVideoFilename || 'test_video.mp4';
}
