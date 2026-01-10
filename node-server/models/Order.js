

const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({

    trackingId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    weight: {
        type: Number,
        required: true,
        min: 0.01 
    },
    cabinetId: {
        type: String,
        required: true,
        ref: 'User', 
        index: true
    },
    country: { // Reference to the Country Address/Tariff (Origin/Destination)
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CountryAddress',
        required: true
    },
    flight: { // Reference to the assigned Flight
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Flight',
        required: false
    },

    // Financials and Status
    price: { // Dynamically calculated price
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: ['Accepted', 'OnTheWay', 'Arrived', 'Delivered'],
        default: 'Accepted',
        required: true
    },
    isDeclared: { 
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },

    lastStatusUpdate: {
        type: Date,
        default: Date.now
    },
    
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);