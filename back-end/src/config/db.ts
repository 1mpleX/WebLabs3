import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'events_app',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '123',
  {
    host: process.env.DB_HOST || '127.0.0.1',
    dialect: 'postgres',
    port: Number(process.env.DB_PORT) || 5432,
    logging: false,
  }
);

export { sequelize };

const authenticate = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

authenticate();
