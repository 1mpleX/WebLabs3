const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Event = require('./Event');
const bcrypt = require('bcryptjs');

const UserModel = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },  
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'Users',
  timestamps: true
});

// Установка связи один-ко-многим между User и Event
UserModel.hasMany(Event, {
  foreignKey: 'createdBy',
  as: 'events'
});

Event.belongsTo(UserModel, {
  foreignKey: 'createdBy',
  as: 'creator'
});

module.exports = UserModel;

UserModel.beforeCreate(async (user, options) => {
  if (user.password) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
});
