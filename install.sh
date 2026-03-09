#!/bin/bash

# Kanban App Deployment Script for Debian VPS
# ===========================================

set -e

echo "=========================================="
echo "  Kanban App - Installation Script"
echo "=========================================="

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Проверка Node.js
echo -e "\n${YELLOW}[1/7]${NC} Проверка Node.js..."
if ! command -v node &> /dev/null; then
    echo "Node.js не установлен. Устанавливаю..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
else
    echo -e "${GREEN}Node.js уже установлен: $(node -v)${NC}"
fi

# Проверка PostgreSQL
echo -e "\n${YELLOW}[2/7]${NC} Проверка PostgreSQL..."
if ! command -v psql &> /dev/null; then
    echo "PostgreSQL не установлен. Устанавливаю..."
    apt-get update
    apt-get install -y postgresql postgresql-contrib
    
    # Запуск PostgreSQL
    systemctl start postgresql
    systemctl enable postgresql
    
    echo -e "${GREEN}PostgreSQL установлен и запущен${NC}"
else
    echo -e "${GREEN}PostgreSQL уже установлен${NC}"
    systemctl start postgresql || true
fi

# Настройка базы данных
echo -e "\n${YELLOW}[3/7]${NC} Настройка базы данных..."

# Читаем данные из .env или используем значения по умолчанию
source server/.env 2>/dev/null || true

DB_NAME=${DB_NAME:-kanban_db}
DB_USER=${DB_USER:-postgres}
DB_PASS=${DB_PASS:-postgres}
DB_HOST=${DB_HOST:-localhost}

# Создаем пользователя и базу данных
su - postgres -c "psql -c \"SELECT 1 FROM pg_database WHERE datname = '$DB_NAME';\"" | grep -q 1 || \
    su - postgres -c "psql -c \"CREATE USER $DB_USER WITH PASSWORD '$DB_PASS' SUPERUSER;\""
su - postgres -c "psql -c \"SELECT 1 FROM pg_database WHERE datname = '$DB_NAME';\"" | grep -q 1 || \
    su - postgres -c "psql -c \"CREATE DATABASE $DB_NAME OWNER $DB_USER;\""

echo -e "${GREEN}База данных $DB_NAME готова${NC}"

# Установка зависимостей сервера
echo -e "\n${YELLOW}[4/7]${NC} Установка зависимостей сервера..."
cd server
npm install --production
cd ..

# Установка зависимостей клиента и сборка
echo -e "\n${YELLOW}[5/7]${NC} Установка зависимостей и сборка клиента..."
cd client
npm install
npm run build
cd ..

# Обновление server/index.js для продакшна
echo -e "\n${YELLOW}[6/7]${NC} Настройка сервера для прода..."

cat > server/index.js << 'EOF'
import express from 'express';
import cors from 'cors';
import sequelize from './config/db.js';
import boardRoutes from './routes/boardRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());

// Подключаем API маршруты
app.use('/api', boardRoutes);

// Раздача статических файлов для продакшна
app.use(express.static(path.join(__dirname, '../client/dist')));

// Все остальные запросы отдаем index.html (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    // Проверка БД и синхронизация
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`\n🚀 Server is running on http://0.0.0.0:${PORT}`);
      console.log(`📁 Database: ${process.env.DB_NAME}\n`);
    });
  } catch (error) {
    console.error('❌ Database connection error:', error);
  }
}

start();
EOF

echo -e "${GREEN}Сервер настроен для продакшна${NC}"

# Запуск приложения
echo -e "\n${YELLOW}[7/7]${NC} Запуск приложения..."
echo ""

# Если есть PM2, используем его
if command -v pm2 &> /dev/null; then
    echo "Запускаю через PM2..."
    pm2 delete kanban 2>/dev/null || true
    pm2 start server/index.js --name kanban
    pm2 save
    echo -e "${GREEN}Приложение запущено через PM2${NC}"
    echo "Управление: pm2 logs kanban, pm2 restart kanban"
else
    echo "Запускаю в фоновом режиме..."
    nohup node server/index.js > server.log 2>&1 &
    echo $! > server.pid
    echo -e "${GREEN}Приложение запущено (PID: $(cat server.pid))${NC}"
fi

echo ""
echo "=========================================="
echo -e "${GREEN}  Установка завершена!${NC}"
echo "=========================================="
echo ""
echo "Приложение доступно по адресу:"
echo "  http://ВАШ_IP:5000"
echo ""
echo "Логи сервера: server.log"
echo "Остановить: kill \$(cat server.pid)"
