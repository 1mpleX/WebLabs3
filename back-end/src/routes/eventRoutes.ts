import { Request, Response, NextFunction } from 'express';
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Event, User } from '../models';

// Расширяем тип Request для работы с файлами
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Event:
 *       type: object
 *       required:
 *         - title
 *         - date
 *         - createdBy
 *       properties:
 *         id:
 *           type: integer
 *           description: ID мероприятия
 *         title:
 *           type: string
 *           description: Название мероприятия
 *         description:
 *           type: string
 *           description: Описание мероприятия
 *         date:
 *           type: string
 *           format: date-time
 *           description: Дата проведения
 *         createdBy:
 *           type: integer
 *           description: ID создателя
 */

/**
 * @swagger
 * /api/events:
 *   get:
 *     summary: Получить список всех мероприятий
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список мероприятий
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Event'
 *       401:
 *         description: Не авторизован
 *       500:
 *         description: Ошибка сервера
 *   post:
 *     summary: Создать новое мероприятие
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Event'
 *     responses:
 *       201:
 *         description: Мероприятие создано
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       401:
 *         description: Не авторизован
 *       400:
 *         description: Некорректные данные
 * 
 * /api/events/{id}:
 *   get:
 *     summary: Получить мероприятие по ID
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID мероприятия
 *     responses:
 *       200:
 *         description: Мероприятие найдено
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       404:
 *         description: Мероприятие не найдено
 * 
 *   put:
 *     summary: Обновить мероприятие
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID мероприятия
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Event'
 *     responses:
 *       200:
 *         description: Мероприятие обновлено
 *       404:
 *         description: Мероприятие не найдено
 * 
 *   delete:
 *     summary: Удалить мероприятие
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID мероприятия
 *     responses:
 *       200:
 *         description: Мероприятие удалено
 *       404:
 *         description: Мероприятие не найдено
 * 
 * /api/events/{id}/image:
 *   post:
 *     summary: Загрузить изображение для мероприятия
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID мероприятия
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Изображение загружено
 *       400:
 *         description: Ошибка при загрузке файла
 *       404:
 *         description: Мероприятие не найдено
 */

// Настройка multer для загрузки файлов
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Только изображения формата jpeg, jpg и png!'));
  },
});

// Обработчики маршрутов
const uploadImage = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    const event = await Event.findOne({
      where: {
        id: req.params.id,
        createdBy: req.user.id
      }
    });

    if (!event) {
      res.status(404).json({ message: 'Мероприятие не найдено или у вас нет прав доступа' });
      return;
    }

    if (req.file) {
      const imageUrl = `/uploads/${req.file.filename}`;
      await event.update({ image_url: imageUrl });
      res.json({ message: 'Изображение загружено', image_url: imageUrl });
      return;
    }
    res.status(400).json({ message: 'Файл не был загружен' });
  } catch (error) {
    next(error);
  }
};

const createEvent = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    console.log('=== Начало создания мероприятия ===');
    console.log('Весь объект req.user:', req.user);
    console.log('User ID из токена:', req.user.id);
    console.log('Тело запроса:', req.body);

    // Проверка обязательных полей
    const { title, date } = req.body;
    if (!title || !date) {
      console.error('Отсутствуют обязательные поля:', { title: !title, date: !date });
      res.status(400).json({
        message: 'Название и дата мероприятия обязательны',
        missingFields: {
          title: !title,
          date: !date
        }
      });
      return;
    }

    // Создание мероприятия
    const eventData = {
      ...req.body,
      createdBy: req.user.id
    };

    console.log('Данные для создания мероприятия:', eventData);
    console.log('ID создателя (createdBy):', eventData.createdBy);
    console.log('Тип поля date:', typeof eventData.date);
    console.log('Значение date:', eventData.date);

    const event = await Event.create(eventData);
    console.log('Мероприятие успешно создано:', event.toJSON());
    console.log('ID создателя в созданном мероприятии:', event.get('createdBy'));

    res.status(201).json(event);
  } catch (error) {
    console.error('=== Ошибка при создании мероприятия ===');
    console.error('Детали ошибки:', error);
    if (error instanceof Error) {
      console.error('Stack trace:', error.stack);
      res.status(500).json({
        message: 'Ошибка при создании мероприятия',
        error: error.message,
        stack: error.stack
      });
    } else {
      res.status(500).json({
        message: 'Неизвестная ошибка при создании мероприятия'
      });
    }
  }
};

const updateEvent = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    const event = await Event.findOne({
      where: {
        id: req.params.id,
        createdBy: req.user.id
      }
    });
    
    if (!event) {
      res.status(404).json({ message: 'Мероприятие не найдено или у вас нет прав доступа' });
      return;
    }
    
    await event.update(req.body);
    res.json(event);
  } catch (error) {
    next(error);
  }
};

const deleteEvent = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    const event = await Event.findOne({
      where: {
        id: req.params.id,
        createdBy: req.user.id
      }
    });
    
    if (!event) {
      res.status(404).json({ message: 'Мероприятие не найдено или у вас нет прав доступа' });
      return;
    }
    
    await event.destroy();
    res.json({ message: 'Мероприятие удалено' });
  } catch (error) {
    next(error);
  }
};

const getEvent = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    const event = await Event.findOne({
      where: {
        id: req.params.id,
        createdBy: req.user.id
      }
    });
    
    if (!event) {
      res.status(404).json({ message: 'Мероприятие не найдено или у вас нет прав доступа' });
      return;
    }
    res.json(event);
  } catch (error) {
    next(error);
  }
};

const getAllEvents = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    console.log('=== Получение списка мероприятий ===');
    console.log('ID пользователя:', req.user.id);

    const events = await Event.findAll({
      where: {
        createdBy: req.user.id
      },
      include: [{
        model: User,
        attributes: ['id', 'firstName', 'lastName', 'email']
      }],
      order: [['date', 'ASC']]
    });

    console.log('Найдено мероприятий:', events.length);
    console.log('Мероприятия:', events.map(event => ({
      id: event.id,
      title: event.title,
      createdBy: event.createdBy
    })));

    res.json(events);
  } catch (error) {
    console.error('Ошибка при получении мероприятий:', error);
    next(error);
  }
};

// Регистрация маршрутов
router.post('/:id/image', upload.single('image'), uploadImage);
router.post('/', createEvent);
router.put('/:id', updateEvent);
router.delete('/:id', deleteEvent);
router.get('/:id', getEvent);
router.get('/', getAllEvents);

export default router;
