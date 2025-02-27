const sequelize = require('../config/db');
const User = require('./User');
const Event = require('./Event');

// Установка связи один-ко-многим между User и Event
User.hasMany(Event, {
  foreignKey: 'createdBy'
});

Event.belongsTo(User, {
  foreignKey: 'createdBy'
});

module.exports = {
  sequelize,
  User,
  Event
}; 