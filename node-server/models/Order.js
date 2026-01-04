const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    // We are omitting the 'user' reference since we forgot about auth
    
    orderDate: {
        type: Date,
        default: Date.now
    },
    items: [
        {
            name: String, // E.g., "Shop Item X", "Flight Y"
            quantity: Number,
            price: Number
        }
    ],
    totalAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'Pending'
    },
    // Optional reference to a flight if it's a flight booking order
    flightBooking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Flight',
        required: false
    }
});

module.exports = mongoose.model('Order', OrderSchema);