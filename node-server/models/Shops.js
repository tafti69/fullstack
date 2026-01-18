const mongoose = require('mongoose');

const ShopSchema = new mongoose.Schema({
    name: { type: String, required: true },
    country: { type: mongoose.Schema.Types.ObjectId, ref: 'CountryAddress' },
    websiteUrl: { 
        type: String,
        required: false, 
        trim: true,
    },
});

module.exports = mongoose.model('Shop', ShopSchema);