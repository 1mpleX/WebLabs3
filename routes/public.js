const express = require('express');
const router = express.Router();
const { Event } = require('../models');

// Публичный маршрут для получения всех событий
router.get('/events', async (req, res) => {
    try {
        const events = await Event.findAll();
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при получении событий' });
    }
});

module.exports = router; 