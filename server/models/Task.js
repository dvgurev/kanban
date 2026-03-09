import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Task = sequelize.define('task', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  columnId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'columns',
      key: 'id'
    }
  }
}, { 
  timestamps: true,
  indexes: [
    {
      fields: ['columnId', 'order']
    }
  ]
});

export default Task;