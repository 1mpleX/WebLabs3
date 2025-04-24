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

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Обновить данные пользователя
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID пользователя
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *               gender:
 *                 type: string
 *               birthDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Пользователь обновлен
 *       404:
 *         description: Пользователь не найден
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

const updateUser = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, gender, birthDate } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      res.status(404).json({ message: 'Пользователь не найден' });
      return;
    }

    // Обновляем только те поля, которые были переданы
    const updateData: any = {};
    if (firstName) updateData.first_name = firstName;
    if (lastName) updateData.last_name = lastName;
    if (email) updateData.email = email;
    if (gender) updateData.gender = gender;
    if (birthDate) updateData.birth_date = new Date(birthDate);

    await user.update(updateData);
    
    // Получаем обновленные данные пользователя
    const updatedUser = await User.findByPk(id, {
      attributes: { exclude: ['password'] } // Исключаем пароль из ответа
    });

    res.json(updatedUser);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({
        message: 'Ошибка при обновлении пользователя',
        error: error.message,
      });
    } else {
      res.status(400).json({
        message: 'Неизвестная ошибка при обновлении пользователя',
      });
    }
  }
};

// Регистрация маршрутов
router.post('/', createUser);
router.get('/', getAllUsers);
router.put('/:id', updateUser);

export default router;
