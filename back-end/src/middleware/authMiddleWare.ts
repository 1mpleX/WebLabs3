import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models';

declare global {
  namespace Express {
    interface User {
      id: number;
      email: string;
      name: string;
    }
  }
}

const validateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return res.status(401).json({ message: 'API key is missing' });
  }

  if (apiKey !== process.env.API_KEY) {
    return res.status(403).json({ message: 'Invalid API key' });
  }

  next();
};

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  console.log('=== Auth Middleware ===');
  console.log('Auth Header:', authHeader);
  console.log('Token:', token);

  if (!token) {
    res.status(401).json({ message: 'Токен не предоставлен' });
    return;
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your_jwt_secret'
    ) as jwt.JwtPayload;
    
    console.log('Decoded token:', decoded);
    
    const user = await User.findByPk(decoded.id);
    console.log('Found user:', user ? user.toJSON() : null);
    
    if (!user) {
      res.status(403).json({ message: 'Пользователь не найден' });
      return;
    }

    req.user = user as any;
    console.log('User set in request:', req.user);
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(403).json({ message: 'Недействительный токен' });
  }
};

module.exports = {
  validateApiKey,
  authenticateToken,
};
