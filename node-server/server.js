const express = require('express');
const connectDB = require('./config/db');
const dotenv = require('dotenv');
const cors = require('cors');

const authController = require('./controllers/authController'); 
const orderController = require('./controllers/orderController');
const auth = require('./middleware/authMiddleware');
const CountryAddress = require('./models/CountryAddress');
const Shop = require('./models/Shops');
const Flight = require('./models/Flight');
const Order = require('./models/Order');

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

app.post('/api/admin', authController.registerAdmin); 

app.post('/api/register', authController.registerUser); 

app.post('/api/login', authController.loginUser);

app.post('/api/countries', async (req, res) => {
    try {
        const newCountry = new CountryAddress(req.body);
        const country = await newCountry.save();
        res.status(201).json(country);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error creating country.');
    }
});

app.get('/api/countries', async (req, res) => {
    try {
        const countries = await CountryAddress.find();
        res.json(countries);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error fetching countries.');
    }
});

app.delete('/api/countries/:id', async (req, res) => {
    try {
        const countryId = req.params.id;
        
        // 1. Check if the country exists
        let country = await CountryAddress.findById(countryId);
        if (!country) {
            return res.status(404).json({ msg: 'Country not found.' });
        }
        
        // 2. Remove the country
        await CountryAddress.findByIdAndDelete(countryId);

        // Success response (200 OK, or 204 No Content is also common for delete)
        res.json({ msg: 'Country address removed successfully.' });

    } catch (err) {
        console.error(err.message);
        // This usually catches invalid ID format (CastError)
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Country not found.' });
        }
        res.status(500).send('Server Error deleting country.');
    }
});



app.post('/api/shops', async (req, res) => {
    // Requires: name, location, country (ID)
    try {
        const newShop = new Shop(req.body);
        const shop = await newShop.save();
        res.status(201).json(shop);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error creating shop.');
    }
});

app.get('/api/shops', async (req, res) => {
    try {
        // Updated populate to match new CountryAddress fields
        const shops = await Shop.find().populate('country', ['countryName', 'countryCode', 'Address']);
        res.json(shops);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error fetching shops.');
    }
});


app.delete('/api/shops/:id', async (req, res) => {
    try {
        const shopId = req.params.id;

        // 1. Check if the shop exists
        let shop = await Shop.findById(shopId);
        if (!shop) {
            return res.status(404).json({ msg: 'Shop not found.' });
        }

        // 2. Remove the shop
        await Shop.findByIdAndDelete(shopId);

        res.json({ msg: 'Shop removed successfully.' });

    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Shop not found.' });
        }
        res.status(500).send('Server Error deleting shop.');
    }
});

app.post('/api/flights', async (req, res) => {
    // Requires: flightNumber, origin, destination, departureTime, price
    try {
        const newFlight = new Flight(req.body);
        const flight = await newFlight.save();
        res.status(201).json(flight);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error creating flight. (Check unique flightNumber)');
    }
});

app.get('/api/flights', async (req, res) => {
    try {
        const flights = await Flight.find().sort({ departureTime: 1 });
        res.json(flights);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error fetching flights.');
    }
});


app.delete('/api/flights/:id', async (req, res) => {
    try {
        const flightId = req.params.id;

        // 1. Check if the flight exists
        let flight = await Flight.findById(flightId);
        if (!flight) {
            return res.status(404).json({ msg: 'Flight not found.' });
        }

        // 2. Remove the flight
        await Flight.findByIdAndDelete(flightId);

        res.json({ msg: 'Flight removed successfully.' });

    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Flight not found.' });
        }
        res.status(500).send('Server Error deleting flight.');
    }
});

const ORDER_STATUSES = [
    'Accepted', 
    'OnTheWay', 
    'Arrived', 
    'Delivered',
];

app.get('/api/orders/statuses', (req, res) => {
    res.json(ORDER_STATUSES); 
});

app.get('/api/orders', orderController.getAllOrders); 

app.post('/api/orders', orderController.createOrder); 

app.patch('/api/orders/:id/status', orderController.updateOrderStatus);

app.delete('/api/orders/:id', orderController.deleteOrder);

app.get('/api/orders/user/:cabinetId', orderController.getOrdersByCabinetId);

app.patch('/api/orders/:id/declare', orderController.updateDeclarationStatus);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Open: http://localhost:${PORT}`);
});