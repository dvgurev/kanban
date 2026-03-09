import { Task } from '../models/index.js';
import { sequelize } from '../models/index.js';

export class TaskService {
  // Переместить задачу в новую позицию
  static async moveTask(taskId, newColumnId, newOrder, oldColumnId, oldOrder) {
    const transaction = await sequelize.transaction();
    
    try {
      if (newColumnId !== oldColumnId) {
        // Перемещение между колонками
        await this.moveTaskBetweenColumns(
          taskId, newColumnId, newOrder, oldColumnId, oldOrder, transaction
        );
      } else if (newOrder !== oldOrder) {
        // Перемещение внутри колонки
        await this.reorderTaskInColumn(
          taskId, newColumnId, newOrder, oldOrder, transaction
        );
      }
      
      await transaction.commit();
      return true;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async moveTaskBetweenColumns(taskId, newColumnId, newOrder, oldColumnId, oldOrder, transaction) {
    // Сдвигаем задачи в исходной колонке
    await Task.update(
      { order: sequelize.literal('"order" - 1') },
      {
        where: {
          columnId: oldColumnId,
          order: { [sequelize.Op.gt]: oldOrder }
        },
        transaction
      }
    );

    // Сдвигаем задачи в целевой колонке
    await Task.update(
      { order: sequelize.literal('"order" + 1') },
      {
        where: {
          columnId: newColumnId,
          order: { [sequelize.Op.gte]: newOrder }
        },
        transaction
      }
    );

    // Обновляем саму задачу
    await Task.update(
      { columnId: newColumnId, order: newOrder },
      { where: { id: taskId }, transaction }
    );
  }

  static async reorderTaskInColumn(taskId, columnId, newOrder, oldOrder, transaction) {
    if (newOrder > oldOrder) {
      // Перемещение вниз
      await Task.update(
        { order: sequelize.literal('"order" - 1') },
        {
          where: {
            columnId: columnId,
            order: {
              [sequelize.Op.between]: [oldOrder + 1, newOrder]
            }
          },
          transaction
        }
      );
    } else {
      // Перемещение вверх
      await Task.update(
        { order: sequelize.literal('"order" + 1') },
        {
          where: {
            columnId: columnId,
            order: {
              [sequelize.Op.between]: [newOrder, oldOrder - 1]
            }
          },
          transaction
        }
      );
    }

    // Обновляем задачу
    await Task.update(
      { order: newOrder },
      { where: { id: taskId }, transaction }
    );
  }

  // Получить задачи колонки с правильным порядком
  static async getColumnTasks(columnId) {
    return await Task.findAll({
      where: { columnId },
      order: [['order', 'ASC']]
    });
  }
}

export default TaskService;