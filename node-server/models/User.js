const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({ 
    email: { 
        type: String,
        required: true,
        unique: true
    },
    password: { 
        type: String,
        required: true
    },
    firstName: { 
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    phoneNumber: { 
        type: String,
        required: true
    },
    address: { 
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'], // Only these two values are allowed
        default: 'user'
    },
    cabinetId: {
        type: String,
        unique: true, // Ensures database prevents duplicates
        uppercase: true,
        index: true,
    },
    date: {
        type: Date,
        default: Date.now
    }
});



module.exports = mongoose.model('User', UserSchema);