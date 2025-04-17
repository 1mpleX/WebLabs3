const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');

const RefreshToken = sequelize.define('RefreshToken', {
  token: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  }
}, {
  tableName: 'refresh_tokens',
  timestamps: true
});

// Устанавливаем связь с User
RefreshToken.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

User.hasMany(RefreshToken, {
  foreignKey: 'userId',
  as: 'refreshTokens'
});

// Static method to clean up expired tokens
RefreshToken.cleanupExpiredTokens = async () => {
  try {
    await RefreshToken.destroy({
      where: {
        expiresAt: {
          [sequelize.Op.lt]: new Date()
        }
      }
    });
  } catch (error) {
    console.error('Error cleaning up expired tokens:', error);
  }
};

// Run cleanup every hour
setInterval(() => {
  RefreshToken.cleanupExpiredTokens();
}, 60 * 60 * 1000);

module.exports = RefreshToken;
