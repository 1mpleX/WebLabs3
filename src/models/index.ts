import { Sequelize } from 'sequelize';
import { sequelize } from '../config/db';
import { User } from './User';
import { Event } from './Event';
import { RefreshToken } from './RefreshToken';

// User associations
User.hasMany(Event, {
  foreignKey: 'createdBy',
});

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
