const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Events API',
      version: '1.0.0',
      description: 'API для управления мероприятиями и пользователями',
    },
    servers: [
      {
        url: 'http://localhost:5005',
        description: 'Development server',
      },
    ],
  },
  apis: ['./routes/*.js'], // путь к файлам с маршрутами
};

const specs = swaggerJsdoc(options);
module.exports = specs;