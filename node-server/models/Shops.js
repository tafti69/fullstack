const mongoose = require('mongoose');

const ShopSchema = new mongoose.Schema({
    name: { type: String, required: true },
    country: { type: mongoose.Schema.Types.ObjectId, ref: 'CountryAddress' }
});

module.exports = mongoose.model('Shop', ShopSchema);