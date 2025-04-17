const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User, RefreshToken } = require('../models');
const { authenticateToken } = require('../middleware/authMiddleWare');

const router = express.Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Регистрация нового пользователя
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 description: Имя пользователя
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email пользователя
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Пароль пользователя
 *     responses:
 *       201:
 *         description: Пользователь успешно зарегистрирован
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User registered
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Некорректные данные
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Пользователь с таким email уже существует
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Проверяем наличие всех необходимых полей
    if (!name || !email || !password) {
      return res.status(400).json({ 
        message: 'Все поля (name, email, password) обязательны для заполнения' 
      });
    }

    // Проверяем существующего пользователя
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ 
        message: 'Пользователь с таким email уже существует' 
      });
    }

    // Создаем нового пользователя
    const user = await User.create({ 
      name, 
      email, 
      password 
    });

    // Возвращаем ответ без пароля
    const userWithoutPassword = {
      id: user.id,
      name: user.name,
      email: user.email
    };

    res.status(201).json({ 
      message: 'Пользователь успешно зарегистрирован', 
      user: userWithoutPassword 
    });
  } catch (error) {
    console.error('Ошибка при регистрации:', error);
    res.status(500).json({ 
      message: 'Ошибка при регистрации пользователя',
      error: error.message 
    });
  }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Вход в систему
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Успешная авторизация
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: Неверные учетные данные
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ message: 'Email и пароль обязательны' });
  }

  const user = await User.findOne({ where: { email } });

  if (!user) {
    return res.status(401).json({ message: 'Неверный email или пароль' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: 'Неверный email или пароль' });
  }

  const accessToken = jwt.sign(
    { 
      id: user.id,
      email: user.email
    }, 
    process.env.JWT_SECRET, 
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { id: user.id }, 
    process.env.JWT_REFRESH_SECRET, 
    { expiresIn: '7d' }
  );

  // Удаляем старые refresh токены пользователя
  await RefreshToken.destroy({ where: { userId: user.id } });

  // Создаем новый refresh токен
  await RefreshToken.create({
    token: refreshToken,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    userId: user.id
  });

  res.json({ 
    message: 'Авторизация успешна',
    accessToken, 
    refreshToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email
    }
  });
});

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Обновление access token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Новый access token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *       401:
 *         description: Недействительный refresh token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    return res.status(400).json({ message: 'Refresh token обязателен' });
  }

  try {
    // Проверяем наличие токена в базе данных
    const storedToken = await RefreshToken.findOne({ 
      where: { token: refreshToken },
      include: [{
        model: User,
        attributes: ['id', 'email', 'name']
      }]
    });

    if (!storedToken) {
      return res.status(403).json({ message: 'Недействительный refresh token' });
    }

    // Проверяем срок действия токена
    if (new Date() > storedToken.expiresAt) {
      await storedToken.destroy();
      return res.status(403).json({ message: 'Срок действия refresh token истек' });
    }

    // Проверяем валидность токена
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    if (!storedToken.User || storedToken.User.id !== payload.id) {
      return res.status(403).json({ message: 'Пользователь не найден' });
    }

    // Генерируем новый access token
    const newAccessToken = jwt.sign(
      { 
        id: storedToken.User.id,
        email: storedToken.User.email
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: '15m' }
    );

    res.json({ 
      message: 'Токен успешно обновлен',
      accessToken: newAccessToken 
    });
  } catch (err) {
    console.error('Ошибка при обновлении токена:', err);
    res.status(403).json({ message: 'Ошибка при обновлении токена' });
  }
});

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Выход из системы
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Успешный выход
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Logged out successfully
 *       401:
 *         description: Не авторизован
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

router.post('/logout', authenticateToken, async (req, res) => {
  try {
    await RefreshToken.destroy({ where: { userId: req.user.id } });
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error during logout' });
  }
});

module.exports = router;
  
