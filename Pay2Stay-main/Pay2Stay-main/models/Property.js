const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
    ownerId: { type: String, required: true },
    image: { type: String, required: true }, // Store image filename
    propertyType: { type: String, enum: ['1BHK', '2BHK', '3BHK', 'Bungalow'], required: true },
    rent: { type: Number, required: true },
    lightBill: { type: Number, required: true },
    deposit: { type: Number, required: true },
    address: { type: String, required: true },
    tenantName: { type: String, default: "" },
    tenantEmail: { type: String, default: "" },
    tenantContact: { type: String, default: "" },
    dateOfOccupancy: { type: Date, required: true },
    paymentDate: { type: Number, required: true, min: 1, max: 31 }, 
    agreementPdf: { type: String, required: true }, 
    reminderEnabled: { type: Boolean, default: false } 
}, { timestamps: true }); 

module.exports = mongoose.model('Property', propertySchema);