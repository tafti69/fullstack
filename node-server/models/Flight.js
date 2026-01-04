const mongoose = require('mongoose');

const FlightSchema = new mongoose.Schema({
    flightNumber: { type: String, required: true, unique: true },
    departureTime: { type: Date, required: true },
});

module.exports = mongoose.model('Flight', FlightSchema);