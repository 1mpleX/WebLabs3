const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const passport = require('passport');
const sequelize = require("./config/db");
const { User, Event } = require('./models');
const eventRouter = require('./routes/eventRoutes');
const userRouter = require('./routes/userRoutes');
const publicRouter = require('./routes/public');
const customLogger = require("./middleware/loggingMiddleware.js");
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./config/swagger');
const authRouter = require('./routes/auth');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5005;

app.use(cors());
app.use(express.json());

// Инициализация Passport.js
require('./config/passport');
app.use(passport.initialize());

// Добавляем morgan с кастомным форматом
app.use(morgan('[:method] :url - :status - :response-time ms'));

// Добавляем наш кастомный logger
app.use(customLogger);

// Swagger документация
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Публичные маршруты (без аутентификации)
app.use('/api/public', publicRouter);

// Защищенные маршруты (требуют аутентификации)
app.use('/api/auth', authRouter);
app.use('/api/events', passport.authenticate('jwt', { session: false }), eventRouter);
app.use('/api/users', passport.authenticate('jwt', { session: false }), userRouter);

app.get('/', (req, res) => {
  res.json({
    message: 'API is working'
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
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });
      console.log('Тестовый пользователь создан:', testUser.email);
    } catch (userError) {
      console.error('Ошибка при создании тестового пользователя:', userError);
    }
    
    app.listen(PORT, () => {
      console.log(`Сервер запущен на порту ${PORT}`);
    });
  } catch (error) {
    console.error('Ошибка подключения к базе данных:', error);
  }
};

start();