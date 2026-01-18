const Flight = require('../models/Flight'); // Ensure the path to your Flight model is correct


exports.createFlight = async (req, res) => {
    try {
        const newFlight = new Flight(req.body);
        const flight = await newFlight.save();
        res.status(201).json(flight);
    } catch (err) {
        console.error(err.message);
        if (err.name === 'ValidationError' || (err.code === 11000 && err.errmsg.includes('flightNumber'))) {
            return res.status(400).json({ message: 'Invalid flight data or flight number already exists.' });
        }
        res.status(500).send('Server Error creating flight.');
    }
};


exports.getAllFlights = async (req, res) => {
    try {
        const flights = await Flight.find().sort({ departureTime: 1 });
        res.json(flights);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error fetching flights.');
    }
};

exports.deleteFlight = async (req, res) => {
    try {
        const flightId = req.params.id;
        const flight = await Flight.findByIdAndDelete(flightId);

        if (!flight) {
            return res.status(404).json({ msg: 'Flight not found.' });
        }

        res.json({ msg: 'Flight removed successfully.' });

    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Flight not found.' });
        }
        res.status(500).send('Server Error deleting flight.');
    }
};