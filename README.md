# Kanban Доска - Техническая документация

## Обзор архитектуры

Приложение построено по классической схеме **клиент-сервер**:

```
┌─────────────────┐      HTTP API       ┌─────────────────┐
│   Браузер      │ ◄─────────────────► │   Node.js       │
│   (React)      │    /api/board       │   (Express)     │
└─────────────────┘                     └────────┬────────┘
                                                 │
                                                 ▼
                                        ┌─────────────────┐
                                        │   PostgreSQL    │
                                        │   (База данных) │
                                        └─────────────────┘
```

## База данных

Используется **PostgreSQL** с ORM **Sequelize**.

### Таблица columns (Колонки)
| Поле | Тип | Описание |
|------|-----|----------|
| id | UUID | Уникальный ID |
| title | STRING | Название колонки |
| order | INTEGER | Позиция в списке |
| createdAt | DATETIME | Дата создания |
| updatedAt | DATETIME | Дата обновления |

### Таблица tasks (Задачи)
| Поле | Тип | Описание |
|------|-----|----------|
| id | UUID | Уникальный ID |
| content | TEXT | Текст задачи |
| order | INTEGER | Позиция в колонке |
| columnId | UUID | Ссылка на колонку |
| createdAt | DATETIME | Дата создания |
| updatedAt | DATETIME | Дата обновления |

### Связь между таблицами
```
Column (1) ──────► (N) Task
  hasMany           belongsTo
```

## Сервер (Express)

### API Endpoints

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/board` | Получить все колонки с задачами |
| POST | `/api/columns` | Создать колонку |
| POST | `/api/tasks` | Создать задачу |
| PATCH | `/api/tasks/:id/move` | Переместить задачу |
| POST | `/api/tasks/bulk-update` | Массовое обновление |
| POST | `/api/columns/:id/reorder` | Пересортировать задачи |

### Логика перемещения задач

В `boardController.js` реализована логика изменения порядка:

**1. Перемещение внутри одной колонки:**
- Если `order > oldOrder` (вниз): уменьшаем order у всех задач между старой и новой позицией
- Если `order < oldOrder` (вверх): увеличиваем order у всех задач между новой и старой позицией

**2. Перемещение между колонками:**
- Уменьшаем order в исходной колонке (все задачи после перемещённой сдвигаются вверх)
- Увеличиваем order в целевой колонке (все задачи от позиции вставки сдвигаются вниз)
- Обновляем columnId у перемещённой задачи

Всё оборачивается в **транзакцию** - если что-то пойдёт не так, изменения откатываются.

## Клиент (React)

### Компоненты

**App.jsx** - Главный компонент
- Показывает загрузку при старте
- Рендерит Board

**Board.jsx** - Доска с колонками
- Загружает данные с сервера при mount (`useEffect`)
- Хранит состояние колонок в `useState`
- Обрабатывает Drag-and-Drop
- Оптимистично обновляет UI (сначала показывает изменения, потом отправляет на сервер)

**Column.jsx** - Колонка
- Рендерит заголовок и счётчик задач
- Рендерит список задач
- Обрабатывает drop на уровне колонки

**Task.jsx** - Задача
- Показывает текст
- Делается draggable (перетаскиваемой)

**AddColumn.jsx / AddTask.jsx** - Формы добавления

### Drag and Drop реализация

Используется нативный HTML5 Drag and Drop API:

1. **DragStart** - при начале перетаскивания сохраняем ID задачи, индекс и ID колонки
2. **DragOver** - вызываем `e.preventDefault()` чтобы разрешить drop
3. **Drop** - определяем целевую колонку и позицию, обновляем UI и отправляем запрос

**Особенность:** Индекс сохраняется ДО изменения массива. Иначе после splice индексы сдвигаются и отправляется неправильный ID.

### API клиента (services/api.js)

```javascript
class ApiService {
  getBoard()      // GET /api/board
  createColumn()  // POST /api/columns
  createTask()    // POST /api/tasks
  updateTaskOrder() // PATCH /api/tasks/:id/move
  bulkUpdateTasks() // POST /api/tasks/bulk-update
  reorderColumnTasks() // POST /api/columns/:id/reorder
}
```

## Как работает перетаскивание (пошагово)

### 1. Начало перетаскивания
```
Пользователь хватает Task A (индекс 0)
  → handleDragStart
  → Сохраняем: { taskId: "uuid-A", sourceColumnId: 1, sourceIndex: 0 }
```

### 2. Перетаскивание над другой задачей
```
Пользователь наводит на Task B (индекс 2)
  → handleTaskDragOver
  → Определяем позицию: above (над) или below (под)
  → Показываем визуальный индикатор
```

### 3. Drop (в ту же колонку)
```
Целевой индекс = 3
  → handleSameColumnReorder
  → splice(0, 1)   // Удаляем A
  → splice(3, 0, A) // Вставляем на позицию 3
  → Обновляем все order: [0, 1, 2, 3...]
  → Отправляем PATCH /api/tasks/uuid-A/move
      { columnId: 1, order: 3, oldColumnId: 1, oldOrder: 0 }
```

### 4. Drop (в другую колонку)
```
Было: Column 1, индекс 0
Стало: Column 2, индекс 2
  → handleCrossColumnMove
  → Удаляем из Column 1, обновляем order там
  → Вставляем в Column 2 на позицию 2, обновляем order там
  → Отправляем PATCH /api/tasks/uuid-A/move
      { columnId: 2, order: 2, oldColumnId: 1, oldOrder: 0 }
```

## Конфигурация

### server/.env
```
PORT=5000           # Порт Express
DB_NAME=kanban_db   # Имя БД
DB_USER=postgres    # Пользователь БД
DB_PASS=4199       # Пароль
DB_HOST=localhost  # Хост БД
```

### Vite proxy (client/vite.config.js)
```
/api -> http://localhost:5000
```
Нужен для разработки - чтобы запросы с localhost:3000 проксировались на сервер.

## Деплой на продакшн

В продакшене сервер:
1. Раздаёт статику из `client/dist` (собранный React)
2. Проксирует `/api` на роуты Express
3. Все остальные запросы отдают `index.html` (SPA роутинг)

Команда сборки: `npm run build` в папке client создаёт оптимизированные файлы в `client/dist`.
