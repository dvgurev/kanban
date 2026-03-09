#!/bin/bash

# Скрипт для локальной разработки (dev режим)
# Запускает сервер и клиент отдельно

echo "Запуск в режиме разработки..."
echo "Сервер: http://localhost:5000"
echo "Клиент: http://localhost:3000"
echo ""

# Запуск сервера в фоне
echo "Запуск сервера..."
cd server
npm run dev &
SERVER_PID=$!

# Запуск клиента
echo "Запуск клиента..."
cd ../client
npm run dev &
CLIENT_PID=$!

echo ""
echo "Сервер PID: $SERVER_PID"
echo "Клиент PID: $CLIENT_PID"
echo ""
echo "Для остановки: kill $SERVER_PID $CLIENT_PID"

# Сохраняем PID
echo "$SERVER_PID $CLIENT_PID" > .pids

# Ожидание
wait
