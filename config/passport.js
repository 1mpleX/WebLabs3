const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const passport = require('passport');
const User = require('../models/User.js');
const dotenv = require('dotenv');

dotenv.config();

const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET
};

passport.use(
    new JwtStrategy(options, async (payload, done) => {
        try {
            const user = await User.findByPk(payload.id);
            if (user) {
                return done(null, user);
            }
            return done(null, false, { message: 'Пользователь не найден' });
        } catch (error) {
            return done(error, { message: 'Ошибка при проверке токена' });
        }
    })
);

module.exports = passport;