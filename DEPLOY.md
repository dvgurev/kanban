# Деплой Kanban приложения на VPS

## Быстрый старт

Загрузите проект на VPS и выполните:

```bash
chmod +x install.sh
./install.sh
```

## Что делает скрипт

1. **Проверка Node.js** - устанавливает Node.js 20.x если нет
2. **Проверка PostgreSQL** - устанавливает и запускает PostgreSQL
3. **Настройка БД** - создает пользователя и базу данных `kanban_db`
4. **Установка сервера** - npm install для сервера
5. **Сборка клиента** - npm install + npm run build для React
6. **Настройка Express** - добавляет раздачу статики и SPA fallback
7. **Запуск** - запускает приложение

## Конфигурация

Отредактируenv` перед запуском:

```envйте `server/.
PORT=5000
DB_NAME=kanban_db
DB_USER=postgres
DB_PASS=ваш_пароль
DB_HOST=localhost
```

## После установки

- Приложение: `http://IP_VPS:5000`
- Логи: `server.log`
- Остановка: `kill $(cat server.pid)`

## С PM2 (рекомендуется)

```bash
# Установить PM2
npm install -g pm2

# Запустить
pm2 start server/index.js --name kanban

# Автозапуск после перезагрузки
pm2 startup
pm2 save
```

## Команды PM2

```bash
pm2 logs kanban        # смотреть логи
pm2 restart kanban    # перезапустить
pm2 stop kanban       # остановить
pm2 list              # список процессов
```
