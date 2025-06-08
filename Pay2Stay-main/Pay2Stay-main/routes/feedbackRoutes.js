const express = require("express");
const router = express.Router();
const Feedback = require("../models/Feedback");

// POST: Submit Feedback
router.post("/submit", async (req, res) => {
    try {
        const { reviewerId, revieweeId, propertyId, rating, comment } = req.body;

        const feedback = new Feedback({
            reviewerId,
            revieweeId,
            propertyId,
            rating,
            comment
        });

        await feedback.save();
        res.status(201).json({ message: "Feedback submitted successfully", feedback });
    } catch (error) {
        console.error("Error submitting feedback:", error);
        res.status(500).json({ error: "Failed to submit feedback" });
    }
});

// GET: Fetch feedback for a specific user
router.get("/:userId", async (req, res) => {
    try {
        const feedbacks = await Feedback.find({ revieweeId: req.params.userId }).populate("reviewerId", "name");
        res.json(feedbacks);
    } catch (error) {
        console.error("Error fetching feedback:", error);
        res.status(500).json({ error: "Failed to fetch feedback" });
    }
});

// POST: Owner/Tenant responds to feedback
router.post("/respond/:feedbackId", async (req, res) => {
    try {
        const { response } = req.body;
        const feedback = await Feedback.findById(req.params.feedbackId);
        
        if (!feedback) return res.status(404).json({ error: "Feedback not found" });

        feedback.response = response;
        await feedback.save();

        res.json({ message: "Response added successfully", feedback });
    } catch (error) {
        console.error("Error responding to feedback:", error);
        res.status(500).json({ error: "Failed to respond to feedback" });
    }
});

module.exports = router;
