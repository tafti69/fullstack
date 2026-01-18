const express = require('express');
const connectDB = require('./config/db');
const dotenv = require('dotenv');
const cors = require('cors');

const authMiddleware = require('./middleware/authMiddleware');
const adminMiddleware = require('./middleware/adminMiddleware');
const authController = require('./controllers/authController'); 
const orderController = require('./controllers/orderController');
const countryController = require('./controllers/countryController');
const shopController = require('./controllers/shopController');
const flightController = require('./controllers/flightController');
const paymentController = require('./controllers/paymentController');


dotenv.config(); 

connectDB();

const app = express();
const PORT = process.env.PORT || 3000; 

const corsOptions = {
    origin: 'http://localhost:4200',
    allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'], 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
};

const ORDER_STATUSES = [
    'Accepted', 
    'OnTheWay', 
    'Arrived', 
    'Delivered',
];

app.use(cors(corsOptions));

app.use(express.json()); 

app.get('/', (req, res) => {
    res.send('Welcome to the Authentication Backend!');
});

app.post('/api/admin', authController.registerAdmin); 
app.post('/api/register', authController.registerUser); 
app.post('/api/login', authController.loginUser);
app.get("/api/users/me", authMiddleware, authController.getMe);
app.get("/api/users", authMiddleware, adminMiddleware, authController.getAllUsers)

app.get("/api/countries", countryController.getAllCountries);
app.post("/api/countries", countryController.createCountry);
app.delete("/api/countries/:id", countryController.deleteCountry);

app.get("/api/shops", shopController.getAllShops);
app.post("/api/shops", shopController.createShop);
app.delete("/api/shops/:id", shopController.deleteShop);

app.get("/api/flights", flightController.getAllFlights);
app.post("/api/flights", flightController.createFlight);
app.delete("/api/flights/:id", flightController.deleteFlight);

app.get('/api/orders', orderController.getAllOrders); 
app.post('/api/orders', orderController.createOrder); 
app.patch('/api/orders/:id/status', orderController.updateOrderStatus);
app.delete('/api/orders/:id', orderController.deleteOrder);
app.get('/api/orders/user/:cabinetId', orderController.getOrdersByCabinetId);
app.patch('/api/orders/:id/declare', orderController.updateDeclarationStatus);

app.post('/api/payments/fulfill', authMiddleware, paymentController.fulfillBalance);
app.post('/api/payments/pay', authMiddleware, paymentController.payOrder);

app.get('/api/orders/statuses', (req, res) => {
    res.json(ORDER_STATUSES); 
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Open: http://localhost:${PORT}`);
});