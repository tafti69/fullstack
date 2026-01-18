const mongoose = require('mongoose');
const User = require('../models/User');
const Order = require('../models/Order');


exports.fulfillBalance = async (req, res) => {
    const { amount } = req.body;
    const userId = req.user.id;

    if (!amount || typeof amount !== 'number' || amount <= 0) {
        return res.status(400).json({ message: 'Invalid amount for deposit.' });
    }

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        user.balance += amount; 
        await user.save();

        res.status(200).json({ 
            _id: user._id, 
            balance: user.balance, 
            cabinetId: user.cabinetId 
        });
    } catch (error) {
        console.error('Fulfill Balance Error:', error);
        res.status(500).json({ message: 'Server error during balance deposit.' });
    }
};


exports.payOrder = async (req, res) => {
    const { orderId } = req.body;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
        return res.status(400).json({ message: 'Invalid Order ID.' });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const user = await User.findById(userId).session(session);
        const order = await Order.findById(orderId).session(session);

        if (!user || !order) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ message: 'User or Order not found.' });
        }

        // Cabinet security check
        if (order.cabinetId !== user.cabinetId) {
            await session.abortTransaction();
            session.endSession();
            return res.status(403).json({ message: 'Unauthorized: Order does not belong to your cabinet.' });
        }

        if (order.isPaid) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ message: 'Order has already been paid.' });
        }

        if (user.balance < order.price) {
            await session.abortTransaction();
            session.endSession();
            return res.status(402).json({ message: 'Insufficient balance.' });
        }
        
        user.balance -= order.price;
        order.isPaid = true;

        await user.save({ session });
        await order.save({ session });
        
        await session.commitTransaction();
        session.endSession();

        res.status(200).json({
            user: user.toObject({ getters: true }),
            order: order.toObject({ getters: true })
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error('Payment Transaction Error:', error);
        res.status(500).json({ message: 'Transaction failed due to server error.' });
    }
};