import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Column = sequelize.define('column', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, { timestamps: true });

export default Column;