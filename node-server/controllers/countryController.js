const CountryAddress = require('../models/CountryAddress'); // Ensure this path is correct

exports.createCountry = async (req, res) => {
    try {
        const newCountry = new CountryAddress(req.body);
        const country = await newCountry.save();
        res.status(201).json(country);
    } catch (err) {
        console.error(err.message);
        // Check for Mongoose validation errors (e.g., required fields missing)
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: err.message });
        }
        res.status(500).send('Server Error creating country.');
    }
};

exports.getAllCountries = async (req, res) => {
    try {
        const countries = await CountryAddress.find();
        res.json(countries);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error fetching countries.');
    }
};

exports.deleteCountry = async (req, res) => {
    try {
        const countryId = req.params.id;
        const country = await CountryAddress.findByIdAndDelete(countryId);

        if (!country) {
            return res.status(404).json({ msg: 'Country not found.' });
        }

        res.json({ msg: 'Country address removed successfully.' });

    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Country not found.' });
        }
        res.status(500).send('Server Error deleting country.');
    }
};