const Order = require('../models/Order');
const CountryAddress = require('../models/CountryAddress');
const Flight = require('../models/Flight'); 
const User = require('../models/User');

exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('country', 'countryName countryCode price')
            .populate('flight', 'flightNumber departureTime')
            .sort({ createdAt: -1 });

        res.json(orders);
    } catch (err) {
        console.error('Error fetching orders:', err.message);
        res.status(500).send('Server Error fetching orders.');
    }
};

exports.createOrder = async (req, res) => {
    const { trackingId, weight, cabinetId, countryId, flightId } = req.body;
    try {
        if (!trackingId || !weight || !cabinetId || !countryId || !flightId) {
            return res.status(400).send('Missing required order fields.');
        }

        const existingOrder = await Order.findOne({ trackingId });
        if (existingOrder) {
            return res.status(409).send('Tracking ID already exists. Orders must be unique.'); 
        }
        
        const existingUser = await User.findOne({ cabinetId });
        if (!existingUser) {
            return res.status(400).send(`Invalid Cabinet ID: No user found with ID '${cabinetId}'.`); 
        }

        const country = await CountryAddress.findById(countryId);
        if (!country) {
            return res.status(404).send('Origin country not found for tariff calculation.');
        }

        const tariffPrice = country.price;      
        const calculatedPrice = weight * tariffPrice;

        const newOrder = new Order({
            trackingId,
            weight,
            cabinetId,
            flight: flightId,
            country: countryId, 
            price: calculatedPrice, 
            status: 'Accepted' // Default status
        });

        await newOrder.save();
 
        const createdOrder = await Order.findById(newOrder._id)
            .populate('country', 'countryName countryCode price')
            .populate('flight', 'flightNumber departureTime');

        res.status(201).json(createdOrder);
        
    } catch (err) {
        console.error('Order creation failed:', err.message);
        if (err.code === 11000) {
            return res.status(400).send('Tracking ID already exists.');
        }
        res.status(500).send('Server Error during order creation.');
    }
};

// PATCH update order status
exports.updateOrderStatus = async (req, res) => {
    const { status } = req.body;
    const orderId = req.params.id;

    try {
        // Simple check against the enum values defined in the schema
        const validStatuses = ['Accepted', 'OnTheWay', 'Arrived', 'Delivered'];
        if (!validStatuses.includes(status)) {
            return res.status(400).send('Invalid status value provided.');
        }

        const order = await Order.findByIdAndUpdate(
            orderId,
            { 
                status: status,
                lastStatusUpdate: Date.now() // Update timestamp
            },
            { new: true } // Return the updated document
        )
        .populate('country', 'countryName countryCode price')
        .populate('flight', 'flightNumber departureTime');

        if (!order) {
            return res.status(404).send('Order not found.');
        }

        res.json(order);

    } catch (err) {
        console.error('Status update failed:', err.message);
        res.status(500).send('Server Error during status update.');
    }
};

// GET orders for a specific user cabinet
exports.getOrdersByCabinetId = async (req, res) => {
    const cabinetId = req.params.cabinetId; 

    try {
        // 2. Query Orders collection, filtering by cabinetId
        const orders = await Order.find({ cabinetId: cabinetId })
            .populate('country', 'countryName countryCode tariffPrice')
            .populate('flight', 'flightNumber departureTime')
            .sort({ createdAt: -1 }); // Show newest orders first

        if (orders.length === 0) {
            return res.status(404).json({ message: "No orders found for this Cabinet ID." });
        }

        res.json(orders);
    } catch (err) {
        console.error(`Error fetching orders for cabinet ${cabinetId}:`, err.message);
        res.status(500).send('Server Error fetching user orders.');
    }
};

// PATCH update order declaration status
exports.updateDeclarationStatus = async (req, res) => {
    const orderId = req.params.id;
    // We only expect { isDeclared: true } for this endpoint
    
    try {
        const order = await Order.findByIdAndUpdate(
            orderId,
            { 
                isDeclared: true,
                lastStatusUpdate: Date.now() // Optional: record the time of declaration
            },
            { new: true } // Return the updated document
        )
        // Ensure the response is populated to update the frontend list item
        .populate('country', 'countryName countryCode price')
        .populate('flight', 'flightNumber departureTime');

        if (!order) {
            return res.status(404).send('Order not found.');
        }

        res.json(order);

    } catch (err) {
        console.error('Declaration status update failed:', err.message);
        res.status(500).send('Server Error during declaration update.');
    }
};

// DELETE an order by ID
exports.deleteOrder = async (req, res) => {
    try {
        const orderId = req.params.id;

        const order = await Order.findByIdAndDelete(orderId);

        if (!order) {
            // If Mongoose returns null, the ID was valid but the order wasn't found
            return res.status(404).send('Order not found.');
        }

        // 200 OK with a confirmation message (or the deleted object)
        res.json({ message: 'Order successfully deleted.', _id: orderId });

    } catch (err) {
        console.error('Order deletion failed:', err.message);
        // Handle potential invalid ID format error (CastError)
        if (err.kind === 'ObjectId') {
             return res.status(400).send('Invalid Order ID format.');
        }
        res.status(500).send('Server Error during order deletion.');
    }
};