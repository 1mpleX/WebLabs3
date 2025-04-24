import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import passport from 'passport';
import './config/passport';
import { sequelize } from './config/db';
import { User } from './models';
import eventRouter from './routes/eventRoutes';
import userRouter from './routes/userRoutes';
import publicRouter from './routes/public';
import customLogger from './middleware/loggingMiddleware';
import swaggerUi from 'swagger-ui-express';
import swaggerSpecs from './config/swagger';
import authRouter from './routes/auth';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5005;

app.use(cors());
app.use(express.json());

// Инициализация Passport.js
app.use(passport.initialize());

// Добавляем morgan с кастомным форматом
app.use(morgan('[:method] :url - :status - :response-time ms'));

// Swagger документация
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Публичные маршруты (без аутентификации)
app.use('/api/public', publicRouter);

// Защищенные маршруты (требуют аутентификации)
app.use('/api/auth', authRouter);
app.use(
  '/api/events',
  passport.authenticate('jwt', { session: false }),
  eventRouter,
);
app.use(
  '/api/users',
  passport.authenticate('jwt', { session: false }),
  userRouter,
);

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/', (req, res) => {
  res.json({
    message: 'API is working',
  });
});

const start = async () => {
  try {
    await sequelize.authenticate();
    console.log('Подключение к базе данных успешно установлено.');

    // Пересоздаем таблицы
    await sequelize.sync({ force: true });
    console.log('База данных синхронизирована (таблицы пересозданы)');

    // Создаем тестового пользователя
    try {
      const testUser = await User.create({
        firstName: 'Test',
        lastName: 'Userrr',
        email: 'test@example.com',
        password: 'password123',
        gender: 'female',
        birthDate: new Date('1990-01-01')
      });
      console.log('Тестовый пользователь создан:', (testUser as any).email);
    } catch (userError) {
      console.error('Ошибка при создании тестового пользователя:', userError);
    }

    // Запуск сервера
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Ошибка подключения к базе данных:', error);
  }
};

start();
