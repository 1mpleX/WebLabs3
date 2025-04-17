import express from 'express';
import { Event } from '../models';

const router = express.Router();

// Публичный маршрут для получения всех событий
router.get('/events', async (req, res) => {
  try {
    const events = await Event.findAll();
    res.json(events);
  } catch (error: unknown) {
    console.error('Ошибка при получении публичных мероприятий:', error);
    res
      .status(500)
      .json({ message: 'Ошибка при получении публичных мероприятий' });
  }
});

export default router;
