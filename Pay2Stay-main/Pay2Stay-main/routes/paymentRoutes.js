const express = require("express");
const Razorpay = require("razorpay");
require("dotenv").config();

const router = express.Router();

// Initialize Razorpay instance
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Razorpay Order
router.post("/create-order", async (req, res) => {
    try {
        console.log("Request body", req.body);
        const { amount, currency } = req.body; 

        const options = {
            amount: amount * 100, 
            currency: currency || "INR",
            receipt: `receipt_${Date.now()}`
        };

        const order = await razorpay.orders.create(options);
        res.json(order);
    } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({ error: "Failed to create order" });
    }
});

router.get("/payment-success", (req, res) => {
    res.render("pages/payment-success");
});

module.exports = router;
