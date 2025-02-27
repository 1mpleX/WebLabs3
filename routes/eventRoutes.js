const Router = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = new Router();
const { Event } = require('../models');



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
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Номер страницы
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Количество записей на странице
 *     responses:
 *       200:
 *         description: Список мероприятий
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 events:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Event'
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


// Создаем папку uploads, если ее нет
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Настройка хранения файлов
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

// Ограничения для файлов
const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png'];
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error('Разрешены только файлы .jpg и .png'), false);
        }
        cb(null, true);
    }
});

// Загрузка изображения для мероприятия
router.post('/:id/image', upload.single('image'), async (req, res) => {
    try {
        const event = await Event.findByPk(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Мероприятие не найдено' });
        }

        event.image_url = `/uploads/${req.file.filename}`;
        await event.save();

        res.json({ message: 'Изображение загружено', imageUrl: event.image_url });
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при загрузке изображения', error: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const { title, description, date, createdBy } = req.body;
        
        // Проверка обязательных полей
        if (!title || !date || !createdBy) {
            return res.status(400).json({ message: "Не все обязательные поля заполнены" });
        }

        const event = await Event.create({
            title,
            description,
            date,
            createdBy
        });

        res.status(201).json(event);
    } catch (error) {
        res.status(400).json({ message: "Ошибка при создании мероприятия", error: error.message });
    }
});

// Обновление мероприятия
router.put('/:id', async (req, res) => {
    try {
        const { title, description, date } = req.body;
        
        const event = await Event.findByPk(req.params.id);
        if (!event) {
            return res.status(404).json({ message: "Мероприятие не найдено" });
        }

        // Обновляем только переданные поля
        if (title) event.title = title;
        if (description) event.description = description;
        if (date) event.date = date;

        await event.save();
        res.json(event);
    } catch (error) {
        res.status(400).json({ message: "Ошибка при обновлении мероприятия", error: error.message });
    }
});

// Удаление мероприятия (защищено API-ключом)
router.delete('/:id', async (req, res) => {
    try {
        const event = await Event.findByPk(req.params.id);
        if (!event) {
            return res.status(404).json({ message: "Мероприятие не найдено" });
        }

        await event.destroy();
        res.json({ message: "Мероприятие успешно удалено" });
    } catch (error) {
        res.status(500).json({ message: "Ошибка при удалении мероприятия", error: error.message });
    }
});

// Получение одного мероприятия по ID (с изображением)
router.get('/:id', async (req, res) => {
    try {
        const event = await Event.findByPk(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Мероприятие не найдено' });
        }
        res.json(event);
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при получении мероприятия', error: error.message });
    }
});

router.get('/', async (req, res) => {
    try {
        const events = await Event.findAll({
            order: [['date', 'ASC']] // Сортировка по дате
        });

        res.json(events);
    } catch (error) {
        res.status(500).json({ message: "Ошибка при получении мероприятий", error: error.message });
    }
});

module.exports = router;
