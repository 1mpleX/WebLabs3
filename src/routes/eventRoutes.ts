import { Request, Response, NextFunction } from 'express';
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Event } from '../models';

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
 *     summary: Получение списка всех событий
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список событий
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Event'
 *       401:
 *         description: Не авторизован
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   post:
 *     summary: Создать новое мероприятие
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Event'
 *     responses:
 *       201:
 *         description: Мероприятие создано
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
    const event = await Event.findByPk(req.params.id);
    if (!event) {
      res.status(404).json({ message: 'Мероприятие не найдено' });
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
    const event = await Event.create(req.body);
    res.status(201).json(event);
  } catch (error) {
    next(error);
  }
};

const updateEvent = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) {
      res.status(404).json({ message: 'Мероприятие не найдено' });
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
    const event = await Event.findByPk(req.params.id);
    if (!event) {
      res.status(404).json({ message: 'Мероприятие не найдено' });
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
    const event = await Event.findByPk(req.params.id);
    if (!event) {
      res.status(404).json({ message: 'Мероприятие не найдено' });
      return;
    }
    res.json(event);
  } catch (error) {
    next(error);
  }
};

const getAllEvents = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    const events = await Event.findAll();
    res.json(events);
  } catch (error) {
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
