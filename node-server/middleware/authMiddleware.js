const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

module.exports = function (req, res, next) {
    // 1. Get token from the standard Authorization header
    // The header will look like: Authorization: Bearer <token>
    const authHeader = req.header('Authorization');

    // 2. Check if Authorization header exists
    if (!authHeader) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    // 3. Extract the token by checking for the 'Bearer ' prefix
    const token = authHeader.replace('Bearer ', '');
    
    // Fallback/Safety check: if token extraction failed or header format is wrong
    if (!token || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ msg: 'Authorization header is malformed (expected: Bearer <token>)' });
    }
    
    try {
        // 4. Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET); 

        // 5. Attach user data to the request object
        req.user = decoded.user; 

        // 6. Move to the next middleware or route handler
        next(); 

    } catch (err) {
        // If verification fails (e.g., expired or invalid signature)
        res.status(401).json({ msg: 'Token is not valid' });
    }
};