const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
    reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },  // Tenant or Owner giving feedback
    revieweeId: { type: String, required: true }, // Tenant or Owner receiving feedback
    propertyId: { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: false }, // Optional
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    response: { type: String }, // Optional response from the recipient
    dateSubmitted: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Feedback", feedbackSchema);
