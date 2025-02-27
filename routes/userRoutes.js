const Router = require('express');
const router = new Router();
const { User } = require('../models');

// Создание пользователя
router.post('/', async (req, res) => {
    try {
        const { name, email } = req.body;
        
        if (!name || !email) {
            return res.status(400).json({ message: "Имя и email обязательны" });
        }

        const user = await User.create({
            name,
            email
        });

        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({ message: "Ошибка при создании пользователя", error: error.message });
    }
});

// Получение всех пользователей
router.get('/', async (req, res) => {
    try {
        const users = await User.findAll();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Ошибка при получении пользователей", error: error.message });
    }
});

module.exports = router; 