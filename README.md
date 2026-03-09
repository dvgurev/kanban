# Kanban App

Drag-and-drop задачи для управления проектами.

## Запуск на VPS (Debian)

```bash
# Загрузите проект на сервер
# Отредактируйте server/.env при необходимости

chmod +x deploy.sh
./deploy.sh
```

Скрипт автоматически:
1. Установит Node.js 20.x
2. Установит и настроит PostgreSQL
3. Создаст базу данных kanban_db
4. Установит зависимости сервера
5. Соберёт React-клиент
6. Запустит приложение

## Доступ

Приложение будет доступно по адресу: `http://IP_VASHEGO_SERVER:5000`

## Конфигурация БД

Настройки в `server/.env`:
```
PORT=5000
DB_NAME=kanban_db
DB_USER=postgres
DB_PASS=4199
DB_HOST=localhost
```

## Локальная разработка

```bash
# Сервер
cd server && npm run dev

# Клиент (в другом терминале)
cd client && npm run dev
```
