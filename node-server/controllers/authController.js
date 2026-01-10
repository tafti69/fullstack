const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken'); 
const dotenv = require('dotenv');

dotenv.config();

const User = require('../models/User');


/**
 * Generates a random alphanumeric string for the Cabinet ID.
 * @param {number} length The desired length of the ID.
 * @returns {string} The generated ID.
 */
function generateCabinetId(length = 8) {
    // Define characters: 0-9 and A-Z (excluding confusing chars like I, O, l, 0)
    const characters = '123456789ABCDEFGHJKLMNPQRSTUVWXYZ'; 
    let id = '';
    const charactersLength = characters.length;
    
    // Use Math.random() for randomness
    for (let i = 0; i < length; i++) {
        id += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return id;
}

exports.registerAdmin = async (req, res) => {
    try {
        const { 
            email, 
            password
        } = req.body;

        const placeholder = 'Admin';
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

exports.registerUser = async (req, res, next) => {
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

        // --- NEW ID GENERATION AND UNIQUENESS CHECK ---
        let cabinetId;
        let existingUser;
        let attempts = 0;
        
        do {
            cabinetId = generateCabinetId(); 
            // Check if this ID already exists
            existingUser = await User.findOne({ cabinetId }); 
            attempts++;
        } while (existingUser && attempts < 5); 
        
        if (existingUser) {
            console.error("Failed to generate unique Cabinet ID.");
            return res.status(500).send('Registration failed due to ID generation error.');
        }
        // --------------------------------------------------

        // 3. Create new user instance, assigning the generated ID
        user = new User({
            email,
            password: hashedPassword, 
            firstName,
            lastName,
            phoneNumber,
            address,
            cabinetId: cabinetId // <-- Assign the unique ID here
        });

        await user.save();

        console.log(`New user registered: ${email}`);
        res.status(201).send({ 
            message: 'User registered successfully!', 
            user: {
                id: user._id,
                role: user.role,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                cabinetId: user.cabinetId // Send the ID back
            }
        });
        

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
                    email: email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    cabinetId: user.cabinetId
                });
            }
        );

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error during login.');
    }
};