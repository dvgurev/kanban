import Column from './Column.js';
import Task from './Task.js';
import sequelize from '../config/db.js';

// Связь: одна колонка имеет много задач
Column.hasMany(Task, { 
  as: 'tasks', 
  foreignKey: 'columnId', 
  onDelete: 'CASCADE' 
});

// Связь: задача принадлежит одной колонке
Task.belongsTo(Column, { 
  foreignKey: 'columnId' 
});

export { Column, Task, sequelize };