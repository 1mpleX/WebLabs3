import { Request, Response, NextFunction } from 'express';
import express from 'express';
import { User } from '../models';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - email
 *       properties:
 *         id:
 *           type: integer
 *           description: ID пользователя
 *         name:
 *           type: string
 *           description: Имя пользователя
 *         email:
 *           type: string
 *           format: email
 *           description: Email пользователя
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Получить список всех пользователей
 *     responses:
 *       200:
 *         description: Список пользователей
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *   post:
 *     summary: Создать нового пользователя
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: Пользователь создан
 */

// Обработчики маршрутов
const createUser = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      res.status(400).json({ message: 'Имя и email обязательны' });
    }

    const user = await User.create({
      name,
      email,
    });

    res.status(201).json(user);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({
        message: 'Ошибка при создании пользователя',
        error: error.message,
      });
    } else {
      res.status(400).json({
        message: 'Неизвестная ошибка при создании пользователя',
      });
    }
  }
};

const getAllUsers = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        message: 'Ошибка при получении списка пользователей',
        error: error.message,
      });
    } else {
      res.status(500).json({
        message: 'Неизвестная ошибка при получении списка пользователей',
      });
    }
  }
};

// Регистрация маршрутов
router.post('/', createUser);
router.get('/', getAllUsers);

export default router;
