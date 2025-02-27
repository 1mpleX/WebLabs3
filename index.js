const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const sequelize = require("./config/db");
const { User, Event } = require('./models');
const eventRouter = require('./routes/eventRoutes');
const userRouter = require('./routes/userRoutes');
const customLogger = require("./middleware/loggingMiddleware.js");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5005;

app.use(cors());
app.use(express.json());

// Добавляем morgan с кастомным форматом
app.use(morgan('[:method] :url - :status - :response-time ms'));

// Добавляем наш кастомный logger
app.use(customLogger);

// Подключаем маршруты
app.use('/api/events', eventRouter);
app.use('/api/users', userRouter);

app.get('/', (req, res) => {
  res.json({
    message: 'API is working'
  });
});

const start = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    
    // Sync all models with database
    await sequelize.sync({ alter: true });
    console.log('Database synchronized');
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

start();