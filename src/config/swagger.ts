import swaggerJsdoc from 'swagger-jsdoc';

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
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID пользователя',
            },
            name: {
              type: 'string',
              description: 'Имя пользователя',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email пользователя',
            },
            password: {
              type: 'string',
              format: 'password',
              description: 'Пароль пользователя',
            },
          },
        },
        Event: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID события',
            },
            title: {
              type: 'string',
              description: 'Название события',
            },
            description: {
              type: 'string',
              description: 'Описание события',
            },
            date: {
              type: 'string',
              format: 'date-time',
              description: 'Дата и время события',
            },
            createdBy: {
              type: 'integer',
              description: 'ID создателя события',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Сообщение об ошибке',
            },
          },
        },
        LoginResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Сообщение о успешной авторизации',
            },
            accessToken: {
              type: 'string',
              description: 'JWT токен доступа',
            },
            refreshToken: {
              type: 'string',
              description: 'Токен для обновления JWT',
            },
            user: {
              $ref: '#/components/schemas/User',
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./routes/*.js'], // путь к файлам с маршрутами
};

const swaggerSpecs = swaggerJsdoc(options);

export default swaggerSpecs;
