const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

// Middleware function to protect routes
module.exports = function (req, res, next) {
    if (req.user.role !== 'admin') {
        // 403 Forbidden - User authenticated, but lacks necessary privileges
        return res.status(403).json({ msg: 'Access denied. Administrator privileges required.' });
    }

    next();
};