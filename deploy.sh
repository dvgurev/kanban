#!/bin/bash
# Kanban App - Полный скрипт установки и запуска
# Для Debian VPS

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "=========================================="
echo "  Kanban App - Установка и запуск"
echo "=========================================="

# ============================================
# 1. Установка Node.js
# ============================================
echo "[1/5] Установка Node.js..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi
echo "Node.js: $(node -v)"

# ============================================
# 2. Установка и настройка PostgreSQL
# ============================================
echo "[2/5] Настройка PostgreSQL..."

if ! command -v psql &> /dev/null; then
    apt-get update
    apt-get install -y postgresql postgresql-contrib
fi

systemctl start postgresql
systemctl enable postgresql

# Настройка пароля и БД
su - postgres -c "psql -c \"ALTER USER postgres WITH PASSWORD '4199';\"" 2>/dev/null || true
su - postgres -c "psql -c \"CREATE DATABASE kanban_db;\"" 2>/dev/null || true
su - postgres -c "psql -c \"GRANT ALL PRIVILEGES ON DATABASE kanban_db TO postgres;\"" 2>/dev/null || true

# Настройка аутентификации (md5)
PG_HBA=$(find /etc/postgresql -name pg_hba.conf 2>/dev/null | head -1)
if [ -n "$PG_HBA" ]; then
    sed -i 's/local\s*all\s*all\s*peer/local all all md5/' "$PG_HBA"
    sed -i 's/host\s*all\s*all\s*127.0.0.1\/32\s*ident/host all all 127.0.0.1\/32 md5/' "$PG_HBA"
    systemctl restart postgresql
fi

echo "PostgreSQL настроен"

# ============================================
# 3. Установка зависимостей сервера
# ============================================
echo "[3/5] Установка сервера..."
cd "$SCRIPT_DIR/server"
npm install --production

# ============================================
# 4. Сборка клиента
# ============================================
echo "[4/5] Сборка клиента..."
cd "$SCRIPT_DIR/client"
npm install
npm run build

# ============================================
# 5. Запуск сервера
# ============================================
echo "[5/5] Запуск сервера..."

cd "$SCRIPT_DIR/server"

# Проверка работы
node -e "
const { Client } = require('pg');
const client = new Client({
    host: 'localhost',
    user: 'postgres',
    password: '4199',
    database: 'kanban_db'
});
client.connect()
    .then(() => { console.log('БД подключена!'); client.end(); })
    .catch(e => { console.error('Ошибка БД:', e.message); process.exit(1); });
"

# Запуск
echo ""
echo "=========================================="
echo "  Запуск сервера..."
echo "=========================================="
PORT=5000 node index.js &

sleep 2

echo ""
echo "=========================================="
echo "  ГОТОВО!"
echo "=========================================="
echo "Откройте в браузере: http://IP_VASHEGO_SERVER:5000"
