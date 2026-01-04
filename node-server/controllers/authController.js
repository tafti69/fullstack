const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken'); 
const dotenv = require('dotenv');


dotenv.config();

const User = require('../models/User');


// ... existing imports ...

exports.registerAdmin = async (req, res) => {
    try {
        const { 
            email, 
            password
        } = req.body;

        const placeholder = 'Admin Default';
        const placeholderPhone = '000-000-0000'; 

        let user = await User.findOne({ email });

        if (user) {
            return res.status(400).send('User already exists with this email.');
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({
            email,
            password: hashedPassword, 
            firstName: placeholder,
            lastName: placeholder,
            phoneNumber: placeholderPhone, 
            address: placeholder,
            role: 'admin'   
        });

        await user.save();
        res.status(201).send({ message: 'Admin registered successfully!' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error during registration.');
    }
};

exports.registerUser = async (req, res) => {
    try {
        const { 
            email, 
            password, 
            firstName, 
            lastName, 
            phoneNumber, 
            address 
        } = req.body;

        let user = await User.findOne({ email });

        if (user) {
            return res.status(400).send('User already exists with this email.');
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({
            email,
            password: hashedPassword, 
            firstName,
            lastName,
            phoneNumber,
            address
        });

        await user.save();

        // 4. Send success response
        console.log(`New user registered: ${email}`);
        res.status(201).send({ message: 'User registered successfully!' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error during registration.');
    }
};


exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        let user = await User.findOne({ email });  
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
                id: user.id,
                role: user.role
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
                res.json({ 
                    token,
                    role: user.role,
                    name: email
                });
            }
        );

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error during login.');
    }
};