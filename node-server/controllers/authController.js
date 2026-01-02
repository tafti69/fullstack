const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken'); // <-- ADD THIS LINE
const dotenv = require('dotenv');

// Load environment variables (ensure this is done once, but harmless to repeat)
dotenv.config();

const User = require('../models/User');

// Export the registration logic as a function
exports.registerUser = async (req, res) => {
    try {
        const { username, password } = req.body;

        // 1. Check if user already exists (database check)
        let user = await User.findOne({ username });

        if (user) {
            return res.status(400).send('User already exists.');
        }

        // 2. Generate a Salt and Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt); 

        // 3. Save the new user (database save operation)
        user = new User({
            username,
            password: hashedPassword 
        })
        await user.save(); 

        // 4. Send success response
        console.log(`New user registered: ${username}`);
        res.status(201).send({ message: 'User registered successfully! sperma v jope' });

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error during registration.');
    }
};

// Export the login logic as a function
exports.loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;

        let user = await User.findOne({ username }); // <-- NEW

        // Check if user exists
        if (!user) {
            return res.status(400).send('Invalid Credentials');
        }

        // 2. Compare Passwords
        // bcrypt.compare() takes the plain-text password and the stored hash
        const isMatch = await bcrypt.compare(password, user.password); 

        if (!isMatch) {
            return res.status(400).send('Invalid Credentials blet');
        }

        // 3. Generate JWT (User is authenticated!)
        // The payload is the data we want to embed in the token (e.g., user ID)
        const payload = {
            user: {
                id: user.id
            }
        };

        // Sign the token: creates the final JWT string
        // The token expires in 1 hour (3600 seconds)
        jwt.sign(
            payload,
            process.env.JWT_SECRET, // Your secret key from the .env file
            { expiresIn: '1h' },
            (err, token) => {
                if (err) throw err;
                
                // 4. Send Token to the Client
                // The frontend will store this token and send it with every protected request
                res.json({ token });
            }
        );

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error during login.');
    }
};