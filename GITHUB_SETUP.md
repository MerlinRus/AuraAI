# 🚀 Загрузка проекта Aura на GitHub

## 📋 Пошаговая инструкция

### 1. Установка Git
Если Git не установлен на вашем компьютере:

**Windows:**
- Скачайте Git с официального сайта: https://git-scm.com/download/win
- Установите с настройками по умолчанию
- Перезапустите командную строку

**macOS:**
```bash
brew install git
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get install git
```

### 2. Настройка Git (первый раз)
```bash
git config --global user.name "Ваше Имя"
git config --global user.email "ваш.email@example.com"
```

### 3. Создание репозитория на GitHub
1. Зайдите на https://github.com
2. Нажмите "New repository" (зеленая кнопка)
3. Введите название: `aura-ai-analytics`
4. Добавьте описание: `AI-аналитик физических пространств для бизнеса`
5. Выберите "Public" или "Private"
6. **НЕ** ставьте галочки на "Add a README file", "Add .gitignore", "Choose a license"
7. Нажмите "Create repository"

### 4. Инициализация локального репозитория
```bash
# В папке проекта D:\Luma
git init
git add .
git commit -m "Initial commit: Aura AI Analytics project"
```

### 5. Подключение к удаленному репозиторию
```bash
git remote add origin https://github.com/ВАШ_USERNAME/aura-ai-analytics.git
```

### 6. Первая загрузка
```bash
git branch -M main
git push -u origin main
```

## 🔧 Команды для ежедневной работы

### Добавить изменения:
```bash
git add .
git commit -m "Описание изменений"
git push
```

### Посмотреть статус:
```bash
git status
```

### Посмотреть историю:
```bash
git log --oneline
```

## 📁 Что будет загружено на GitHub

✅ **Основные файлы:**
- `simple_server.py` - главный сервер
- `requirements.txt` - зависимости
- `README.md` - документация
- `backend/` - все модули Python

✅ **Веб-интерфейс:**
- `templates/` - HTML шаблоны
- `static/` - CSS, JavaScript, изображения

❌ **НЕ будет загружено (в .gitignore):**
- `uploads/` - загруженные видео
- `*.db` - базы данных
- `*.pt` - модели YOLO (кроме yolov8n.pt)
- `__pycache__/` - кэш Python
- `.venv/` - виртуальное окружение

## 🌟 Рекомендации

### Для презентации проекта:
1. **Сделайте репозиторий публичным** - это покажет ваши навыки
2. **Добавьте красивую картинку** в README.md
3. **Используйте эмодзи** в описаниях (как в текущем README)
4. **Добавьте теги** (tags) для версий

### Для хакатона:
1. **Создайте ветку** для финальной версии: `git checkout -b hackathon-final`
2. **Сделайте коммит** с сообщением: `git commit -m "🎉 Hackathon Final Version - Aura AI Analytics"`
3. **Загрузите ветку**: `git push origin hackathon-final`

## 🆘 Если что-то пошло не так

### Ошибка "fatal: remote origin already exists":
```bash
git remote remove origin
git remote add origin https://github.com/ВАШ_USERNAME/aura-ai-analytics.git
```

### Ошибка "rejected non-fast-forward":
```bash
git pull origin main --allow-unrelated-histories
```

### Сброс последнего коммита:
```bash
git reset --soft HEAD~1
```

## 🎯 Финальные шаги

После успешной загрузки:

1. **Проверьте репозиторий** на GitHub
2. **Добавьте описание** в "About" секцию
3. **Создайте Issues** для будущих улучшений
4. **Добавьте в профиль** как "Pinned repository"

## 🚀 Готово!

Теперь ваш проект **Aura** доступен на GitHub и может быть:
- Показан на хакатоне
- Добавлен в портфолио
- Использован для демонстрации навыков
- Развит дальше с помощью сообщества

**Удачи с проектом! 🎉✨**
