const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
    tenantEmail: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: Date, required: true },
    status: { type: String, enum: ['Paid', 'Pending'], default: 'Paid' }
});

module.exports = mongoose.model('Payment', PaymentSchema);
