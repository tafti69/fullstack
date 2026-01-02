const express = require('express');
const connectDB = require('./config/db');
const dotenv = require('dotenv');
const cors = require('cors');

const authController = require('./controllers/authController'); // <-- Import the controller
const auth = require('./middleware/authMiddleware');

// Load environment variables from .env file
dotenv.config(); 

connectDB();

const app = express();
const PORT = process.env.PORT || 3000; 

const corsOptions = {
    // Only allow requests from your Angular frontend's address
    origin: 'http://localhost:4200',
    // Allow the necessary headers, especially 'x-auth-token'
    allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'], 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Allow cookies, authorization headers, etc.
};

app.use(cors(corsOptions));
// Middleware to parse JSON bodies
app.use(express.json()); 

// Basic Test Route
app.get('/', (req, res) => {
    res.send('Welcome to the Authentication Backend!');
});

// === REGISTRATION ROUTE ===
// We use the imported function here!
app.post('/api/register', authController.registerUser); 

app.post('/api/login', authController.loginUser);

// === PROTECTED ROUTE ===
// To protect this route, we insert the 'auth' middleware function 
// as the second argument to the app.get() method.
app.get('/api/profile', auth, (req, res) => {
    // The request only reaches here IF the token was valid.
    
    // The middleware attached the user ID to req.user
    // In a real app, you would use req.user.id to fetch the user's full data from the database.
    
    console.log(`Access granted for User ID: ${req.user.id}`);
    
    res.json({
        msg: 'Welcome to your protected profile!',
        userId: req.user.id,
        // The token is valid and you are logged in!
    });
});



// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Open: http://localhost:${PORT}`);
});