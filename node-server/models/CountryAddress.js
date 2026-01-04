const mongoose = require('mongoose');

const CountryAddressSchema = new mongoose.Schema({
    countryName: { type: String, required: true, unique: true },
    countryCode: { type: String, required: true },
    Address: { type: String, required: true },
    price: { type: Number, required: true },
    
});

module.exports = mongoose.model('CountryAddress', CountryAddressSchema);