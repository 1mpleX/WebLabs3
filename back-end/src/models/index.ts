import { Sequelize } from 'sequelize';
import { sequelize } from '../config/db';
import { User } from './User';
import { Event } from './Event';
import { RefreshToken } from './RefreshToken';

// User-Event associations
User.hasMany(Event, {
  foreignKey: {
    name: 'createdBy',
    allowNull: false
  },
  onDelete: 'CASCADE'
});

Event.belongsTo(User, {
  foreignKey: {
    name: 'createdBy',
    allowNull: false
  }
});

// User-RefreshToken associations
User.hasMany(RefreshToken, {
  foreignKey: 'userId',
  onDelete: 'CASCADE',
});

RefreshToken.belongsTo(User, {
  foreignKey: 'userId',
});

export {
  sequelize,
  User,
  Event,
  RefreshToken
};
