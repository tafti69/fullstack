const Shop = require('../models/Shops'); // Ensure this path is correct

exports.createShop = async (req, res) => {
    try {
        const newShop = new Shop(req.body);
        const shop = await newShop.save();
        res.status(201).json(shop);
    } catch (err) {
        console.error(err.message);
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: err.message });
        }
        res.status(500).send('Server Error creating shop.');
    }
};

exports.getAllShops = async (req, res) => {
    try {
        // Use the same populate logic you provided
        const shops = await Shop.find()
            .populate('country', ['countryName', 'countryCode', 'Address']);
            
        res.json(shops);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error fetching shops.');
    }
};

exports.deleteShop = async (req, res) => {
    try {
        const shopId = req.params.id;

        // Use findByIdAndDelete for a simpler operation
        const shop = await Shop.findByIdAndDelete(shopId);

        if (!shop) {
            return res.status(404).json({ msg: 'Shop not found.' });
        }

        res.json({ msg: 'Shop removed successfully.' });

    } catch (err) {
        console.error(err.message);
        // This usually catches invalid ID format (CastError)
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Shop not found.' });
        }
        res.status(500).send('Server Error deleting shop.');
    }
};