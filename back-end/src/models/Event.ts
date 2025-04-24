import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db';

interface EventAttributes {
  id?: number;
  title: string;
  description?: string;
  date: Date;
  createdBy: number;
  image_url?: string;
}

interface EventInstance extends Model<EventAttributes>, EventAttributes {}

const Event = sequelize.define<EventInstance>('Event', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'createdBy',
    references: {
      model: 'users',
      key: 'id',
    },
  },
  image_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'events',
  timestamps: true,
  underscored: false
});

export { Event };
