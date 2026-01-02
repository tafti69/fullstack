const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

// Middleware function to protect routes
module.exports = function (req, res, next) {
    // 1. Get token from header
    // The convention is to send the token in a header called 'x-auth-token'
    const token = req.header('x-auth-token');

    // 2. Check if token exists
    if (!token) {
        // 401 Unauthorized - The request requires user authentication
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    try {
        // 3. Verify token
        // This function verifies the signature using the secret and decodes the payload
        const decoded = jwt.verify(token, process.env.JWT_SECRET); 

        // 4. Attach user data to the request object
        // The 'decoded' payload contains the user ID we embedded during login
        req.user = decoded.user; 

        // 5. Move to the next middleware or route handler
        next(); 

    } catch (err) {
        // If verification fails (e.g., token expired, invalid secret, or tampered)
        res.status(401).json({ msg: 'Token is not valid' });
    }
};