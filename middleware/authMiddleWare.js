const passport = require('passport');
const { User, RefreshToken } = require('../models');

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

const authenticateToken = (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user) => {
        if (err) {
            return res.status(500).json({ message: 'Internal server error' });
        }
        
        if (!user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        req.user = user;
        next();
    })(req, res, next);
};

module.exports = {
    validateApiKey,
    authenticateToken
}; 