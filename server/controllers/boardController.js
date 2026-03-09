import { Column, Task } from '../models/index.js';
import { sequelize } from '../models/index.js';
import { Op } from 'sequelize'; // Добавляем импорт Op

// Получить всю доску
export const getBoard = async (req, res) => {
  try {
    const board = await Column.findAll({
      include: [{ 
        model: Task, 
        as: 'tasks' 
      }],
      order: [
        ['order', 'ASC'],
        [{ model: Task, as: 'tasks' }, 'order', 'ASC']
      ]
    });
    res.json(board);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Создать колонку
export const createColumn = async (req, res) => {
  try {
    const { title, order } = req.body;
    const newColumn = await Column.create({ title, order });
    res.status(201).json(newColumn);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Создать задачу
export const createTask = async (req, res) => {
  try {
    const { content, columnId, order } = req.body;
    const newTask = await Task.create({ content, columnId, order });
    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Обновить позицию задачи (Drag-and-Drop) - улучшенная версия
export const updateTaskOrder = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { columnId, order, oldColumnId, oldOrder } = req.body;

    console.log('Updating task:', { id, columnId, order, oldColumnId, oldOrder });

    // Проверяем наличие всех необходимых полей
    if (oldColumnId === undefined || oldOrder === undefined) {
      // Если старые данные не переданы, просто обновляем задачу
      await Task.update({ columnId, order }, { 
        where: { id }, 
        transaction 
      });
      await transaction.commit();
      return res.sendStatus(200);
    }

    // Находим задачу
    const task = await Task.findByPk(id, { transaction });
    if (!task) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Task not found' });
    }

    // Если задача перемещается в другую колонку
    if (columnId !== oldColumnId) {
      console.log('Moving task between columns');
      
      // Обновляем порядок задач в исходной колонке (сдвигаем все задачи после удаленной)
      await Task.update(
        { order: sequelize.literal('"order" - 1') },
        {
          where: {
            columnId: oldColumnId,
            order: { [Op.gt]: oldOrder } // Используем Op.gt
          },
          transaction
        }
      );

      // Обновляем порядок задач в целевой колонке (сдвигаем все задачи начиная с позиции вставки)
      await Task.update(
        { order: sequelize.literal('"order" + 1') },
        {
          where: {
            columnId: columnId,
            order: { [Op.gte]: order } // Используем Op.gte
          },
          transaction
        }
      );

      // Обновляем задачу
      await task.update({ columnId, order }, { transaction });
    } 
    // Если задача перемещается внутри той же колонки
    else if (order !== oldOrder) {
      console.log('Moving task within same column');
      
      if (order > oldOrder) {
        // Перемещение вниз (после oldOrder)
        await Task.update(
          { order: sequelize.literal('"order" - 1') },
          {
            where: {
              columnId: columnId,
              order: {
                [Op.between]: [oldOrder + 1, order] // Используем Op.between
              }
            },
            transaction
          }
        );
      } else {
        // Перемещение вверх (перед oldOrder)
        await Task.update(
          { order: sequelize.literal('"order" + 1') },
          {
            where: {
              columnId: columnId,
              order: {
                [Op.between]: [order, oldOrder - 1] // Используем Op.between
              }
            },
            transaction
          }
        );
      }

      // Обновляем задачу
      await task.update({ order }, { transaction });
    }

    await transaction.commit();
    res.sendStatus(200);
  } catch (error) {
    await transaction.rollback();
    console.error('Error updating task order:', error);
    res.status(500).json({ error: error.message });
  }
};

// Новый метод: массовое обновление порядка задач
export const bulkUpdateTaskOrder = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { tasks } = req.body; // Массив задач с новыми order и columnId

    for (const task of tasks) {
      await Task.update(
        { order: task.order, columnId: task.columnId },
        { where: { id: task.id }, transaction }
      );
    }

    await transaction.commit();
    res.sendStatus(200);
  } catch (error) {
    await transaction.rollback();
    console.error('Error bulk updating tasks:', error);
    res.status(500).json({ error: error.message });
  }
};

// Новый метод: обновление порядка всех задач в колонке
export const reorderColumnTasks = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { columnId } = req.params;
    const { taskOrders } = req.body; // Массив [{ id, order }]

    for (const item of taskOrders) {
      await Task.update(
        { order: item.order },
        { where: { id: item.id, columnId }, transaction }
      );
    }

    await transaction.commit();
    res.sendStatus(200);
  } catch (error) {
    await transaction.rollback();
    console.error('Error reordering column tasks:', error);
    res.status(500).json({ error: error.message });
  }
};