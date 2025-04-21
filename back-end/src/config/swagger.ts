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
        apiKey: {
          type: 'apiKey',
          name: 'x-api-key',
          in: 'header',
        },
      },
      schemas: {
        User: {
          type: 'object',
          required: ['name', 'email', 'password'],
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
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Дата создания',
            },
          },
        },
        Event: {
          type: 'object',
          required: ['title', 'date', 'createdBy'],
          properties: {
            id: {
              type: 'integer',
              description: 'ID мероприятия',
            },
            title: {
              type: 'string',
              description: 'Название мероприятия',
            },
            description: {
              type: 'string',
              description: 'Описание мероприятия',
            },
            date: {
              type: 'string',
              format: 'date-time',
              description: 'Дата проведения',
            },
            createdBy: {
              type: 'integer',
              description: 'ID создателя',
            },
            image_url: {
              type: 'string',
              description: 'URL изображения мероприятия',
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
            error: {
              type: 'string',
              description: 'Детали ошибки',
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
    tags: [
      {
        name: 'Auth',
        description: 'Операции аутентификации',
      },
      {
        name: 'Events',
        description: 'Операции с мероприятиями',
      },
      {
        name: 'Users',
        description: 'Операции с пользователями',
      },
      {
        name: 'Public',
        description: 'Публичные операции',
      },
    ],
  },
  apis: ['./src/routes/*.ts'],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
