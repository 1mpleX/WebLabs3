import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db';
import { User } from './User';

interface RefreshTokenAttributes {
  id?: number;
  token: string;
  userId: number;
  expiresAt: Date;
}

interface RefreshTokenInstance
  extends Model<RefreshTokenAttributes>,
    RefreshTokenAttributes {}

export const RefreshToken = sequelize.define<RefreshTokenInstance>(
  'RefreshToken',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: 'refresh_tokens',
    timestamps: true,
  },
);

// Устанавливаем связь с User
RefreshToken.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

User.hasMany(RefreshToken, {
  foreignKey: 'userId',
  as: 'refreshTokens',
});

// Static method to clean up expired tokens
(RefreshToken as any).cleanupExpiredTokens = async () => {
  try {
    await RefreshToken.destroy({
      where: {
        expiresAt: {
          [(sequelize as any).Op.lt]: new Date(),
        },
      },
    });
  } catch (error) {
    console.error('Error cleaning up expired tokens:', error);
  }
};

// Run cleanup every hour
setInterval(
  () => {
    (RefreshToken as any).cleanupExpiredTokens();
  },
  60 * 60 * 1000,
);

export default RefreshToken;
