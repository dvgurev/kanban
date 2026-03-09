# 📋 Fullstack Kanban Board (PERN)

Современное веб-приложение для управления задачами, вдохновленное Strive и Trello. 
Позволяет создавать колонки, добавлять задачи и перемещать их между этапами с помощью Drag-and-Drop.

## 🏗 Архитектура приложения

Приложение построено на **PERN** стеке:
* **P**ostgreSQL — реляционная база данных для надежного хранения задач.
* **E**xpress.js — гибкий бэкенд-фреймворк.
* **R**eact — интерактивный интерфейс с использованием современных хуков.
* **N**ode.js — среда выполнения сервера на базе ES-модулей.



---

## 🛠 Технический функционал

### Backend (Node.js & Sequelize)
- **ORM Integration**: Использование Sequelize для управления схемами и связями.
- **Relational Mapping**: Связь `One-to-Many` (одна колонка — много задач).
- **RESTful API**: Четкие эндпоинты для CRUD операций.
- **Auto-Sync**: Автоматическая синхронизация моделей с PostgreSQL при запуске.

### Frontend (React & Tailwind)
- **Drag-and-Drop**: Интерактивное перемещение карточек (библиотека dnd-kit или react-beautiful-dnd).
- **Optimistic UI**: Мгновенное обновление интерфейса до подтверждения сервером.
- **Responsive Design**: Адаптивная верстка с помощью Tailwind CSS.

---

## 📁 Структура проекта

```text
pern-kanban/
├── server/               # Backend часть
│   ├── config/           # Конфигурация БД (Sequelize)
│   ├── controllers/      # Обработка запросов
│   ├── models/           # Модели Column и Task
│   ├── routes/           # Роутинг API
│   └── index.js          # Точка входа
├── client/               # Frontend часть (React)
│   ├── src/
│   │   ├── components/   # UI компоненты (Board, Column, Card)
│   │   ├── api/          # Логика сетевых запросов (Axios)
│   │   └── App.js        # Главный компонент
└── docker-compose.yml    # Инфраструктура (PostgreSQL + pgAdmin)