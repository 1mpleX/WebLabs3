const sequelize = require('../config/db');
const User = require('./User');
const Event = require('./Event');
const RefreshToken = require('./RefreshToken');

// User associations
User.hasMany(Event, {
  foreignKey: 'createdBy'
});

User.hasMany(RefreshToken, {
  foreignKey: 'userId',
  onDelete: 'CASCADE'
});

RefreshToken.belongsTo(User, {
  foreignKey: 'userId'
});

module.exports = {
  sequelize,
  User,
  Event,
  RefreshToken
}; 