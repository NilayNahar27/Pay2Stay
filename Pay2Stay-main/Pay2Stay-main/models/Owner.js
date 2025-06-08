const mongoose = require('mongoose');

const ownerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    ownerId: { type: String, required: true, unique: true }, // Custom Owner ID
    contact: { type: String, default: "" },
    address: { type: String, default: "" },
    numApartments: { type: Number, default: 0 }
});

module.exports = mongoose.model('Owner', ownerSchema);
