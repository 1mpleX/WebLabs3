import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { authenticateToken } from '../middleware/authMiddleWare';
import { User, RefreshToken } from '../models';

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
 *               - firstName
 *               - lastName
 *               - email
 *               - password
 *               - gender
 *               - birthDate
 *             properties:
 *               firstName:
 *                 type: string
 *                 description: Имя пользователя
 *               lastName:
 *                 type: string
 *                 description: Фамилия пользователя
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email пользователя
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Пароль пользователя
 *               gender:
 *                 type: string
 *                 description: Пол пользователя
 *               birthDate:
 *                 type: string
 *                 format: date
 *                 description: Дата рождения пользователя
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

router.post('/register', async (req, res): Promise<any> => {
  try {
    const { firstName, lastName, email, password, gender, birthDate } = req.body;
    
    console.log('Registration attempt with data:', {
      firstName,
      lastName,
      email,
      gender,
      birthDate
    });

    // Проверяем наличие всех необходимых полей
    if (!firstName || !lastName || !email || !password || !gender || !birthDate) {
      console.log('Missing required fields:', {
        firstName: !firstName,
        lastName: !lastName,
        email: !email,
        password: !password,
        gender: !gender,
        birthDate: !birthDate
      });
      return res.status(400).json({
        message: 'Все поля обязательны для заполнения',
        missingFields: {
          firstName: !firstName,
          lastName: !lastName,
          email: !email,
          password: !password,
          gender: !gender,
          birthDate: !birthDate
        }
      });
    }

    // Проверяем существующего пользователя
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      console.log('User already exists with email:', email);
      return res.status(409).json({
        message: 'Пользователь с таким email уже существует',
        email
      });
    }

    // Создаем нового пользователя
    const user: any = await User.create({
      firstName,
      lastName,
      email,
      password,
      gender,
      birthDate,
    });

    // Создаем токены
    const accessToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.REFRESH_TOKEN_SECRET || 'your_refresh_token_secret',
      { expiresIn: '7d' }
    );

    // Сохраняем refresh token в базе
    await RefreshToken.create({
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 дней
    });

    // Возвращаем ответ без пароля
    const userWithoutPassword = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      gender: user.gender,
      birthDate: user.birthDate,
    };

    res.status(201).json({
      message: 'Пользователь успешно зарегистрирован',
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('Detailed registration error:', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      body: req.body
    });
    res.status(500).json({ 
      message: 'Ошибка при регистрации пользователя',
      details: error instanceof Error ? error.message : 'Unknown error'
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

router.post('/login', async (req, res): Promise<any> => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email и пароль обязательны' });
  }

  const user: any = await User.findOne({ where: { email } });

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
      email: user.email,
    },
    process.env.JWT_SECRET || 'your_jwt_secret',
    { expiresIn: '15m' },
  );

  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET || 'your_jwt_refresh_secret',
    { expiresIn: '7d' },
  );

  // Удаляем старые refresh токены пользователя
  await RefreshToken.destroy({ where: { userId: user.id } });

  // Создаем новый refresh токен
  await RefreshToken.create({
    token: refreshToken,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    userId: user.id,
  });

  res.json({
    message: 'Авторизация успешна',
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    },
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

router.post('/refresh', async (req, res): Promise<any> => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ message: 'Refresh token обязателен' });
  }

  try {
    // Проверяем наличие токена в базе данных
    const storedToken = await RefreshToken.findOne({
      where: { token: refreshToken },
      include: [
        {
          model: User,
          attributes: ['id', 'email', 'name'],
        },
      ],
    });

    if (!storedToken) {
      return res
        .status(403)
        .json({ message: 'Недействительный refresh token' });
    }

    // Проверяем срок действия токена
    if (new Date() > storedToken.expiresAt) {
      await storedToken.destroy();
      return res
        .status(403)
        .json({ message: 'Срок действия refresh token истек' });
    }

    // Проверяем валидность токена
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'your_jwt_refresh_secret');

    if ((storedToken as any).User || (storedToken as any).User.id !== (payload as any).id) {
      return res.status(403).json({ message: 'Пользователь не найден' });
    }

    // Генерируем новый access token
    const newAccessToken = jwt.sign(
      {
        id: (storedToken as any).User.id,
        email: (storedToken as any).User.email,
      },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '15m' },
    );

    res.json({
      message: 'Токен успешно обновлен',
      accessToken: newAccessToken,
    });
  } catch {
    console.error('Ошибка при обновлении токена');
    res.status(500).json({ message: 'Ошибка при обновлении токена' });
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

router.post('/logout', authenticateToken as any, async (req: any, res): Promise<any> => {
  try {
    await RefreshToken.destroy({ where: { userId: req.user.id } });
    res.json({ message: 'Logged out successfully' });
  } catch {
    res.status(500).json({ message: 'Error during logout' });
  }
});

export default router;
