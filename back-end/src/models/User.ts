import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db';
import bcrypt from 'bcrypt';
import { Event } from './Event';
import jwt from 'jsonwebtoken';

export const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'first_name'
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'last_name'
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    gender: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    birthDate: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'birth_date'
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    }
  },
  {
    tableName: 'users',
    timestamps: true,
    hooks: {
      beforeCreate: async (user) => {
        const salt = await bcrypt.genSalt(10);
        (user as any).password = await bcrypt.hash((user as any).password, salt);
      },
    },
  },
);

// Установка связи один-ко-многим между User и Event
User.hasMany(Event, {
  foreignKey: 'createdBy',
  as: 'events',
});

Event.belongsTo(User, {
  foreignKey: 'createdBy',
  as: 'creator',
});

export default User;

(User.prototype as any).comparePassword = async function(password: string): Promise<boolean> {
  return await bcrypt.compare(password, (this as any).password);
};

(User.prototype as any).generateToken = function (): string {
  return jwt.sign(
    { id: (this as any).id, email: (this as any).email },
    process.env.JWT_SECRET || 'your_jwt_secret',
    { expiresIn: '15m' },
  );
};
