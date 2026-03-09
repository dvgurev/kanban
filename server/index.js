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
