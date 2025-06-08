const express = require('express');
const mongoose = require('mongoose');
const User = require("../models/Tenant"); 
const Owner = require('../models/Owner');
const Property = require('../models/Property');
const Feedback = require('../models/Feedback');
const { upload, uploadImage, uploadPdf, uploadToCloudinary, cloudinary } = require('./multer');

const router = express.Router();
router.use('/uploads', express.static('uploads'));

router.get('/dashboard', async (req, res) => {
    try {
        if (!req.session.ownerId) {
            return res.redirect('/login'); 
        }

        const owner = await Owner.findOne({ ownerId: req.session.ownerId });
        if (!owner) {
            return res.redirect('/login'); 
        }

        // Fetch properties owned by the owner
        const properties = await Property.find({ ownerId: owner.ownerId });

        const feedbacks = await Feedback.find({ revieweeId: owner.ownerId.toString() })
        .populate({ path: "reviewerId", model: User, select: "name" }) 
        .populate("propertyId", "propertyType address"); // ✅ Correct format



        res.render('pages/owner-dashboard', { owner, properties, feedbacks }); 

    } catch (err) {
        console.error("❌ Error loading dashboard:", err);
        res.status(500).send("Error loading dashboard");
    }
});

router.post('/update-profile', async (req, res) => {
    const { name, contact, address, numApartments } = req.body;

    try {
        await Owner.findOneAndUpdate(
            { ownerId: req.session.ownerId }, 
            {
                name,
                contact,
                address,
                numApartments: parseInt(numApartments, 10) || 0 
            },
            { new: true } 
        );

        res.redirect('/owner/dashboard');
    } catch (err) {
        console.error(err);
        res.status(500).send("Error updating profile");
    }
});

router.get('/add-property', (req, res) => {
    res.render('pages/add-property');
});

const fs = require('fs'); 

router.post("/add-property", upload.fields([
    { name: "propertyImage", maxCount: 1 },
    { name: "agreementPdf", maxCount: 1 }
]), async (req, res) => {
    try {
        if (!req.session.ownerId) return res.redirect("/login");

        let propertyImageUrl = null, agreementPdfUrl = null;

        // Upload Property Image to Cloudinary
        if (req.files["propertyImage"]) {
            const result = await uploadToCloudinary(req.files["propertyImage"][0], "pay2stay/properties/images", "image");
            propertyImageUrl = result.secure_url;
            fs.unlinkSync(req.files["propertyImage"][0].path); 
        }

        // Upload Agreement PDF to Cloudinary
        if (req.files["agreementPdf"]) {
            const result = await uploadToCloudinary(req.files["agreementPdf"][0], "pay2stay/properties/agreements", "raw");
            agreementPdfUrl = result.secure_url;
            fs.unlinkSync(req.files["agreementPdf"][0].path); 
        }

        // Save property details in DB
        const newProperty = new Property({
            ownerId: req.session.ownerId,
            propertyType: req.body.propertyType,
            rent: parseFloat(req.body.rent),
            lightBill: parseFloat(req.body.lightBill),
            deposit: parseFloat(req.body.deposit),
            address: req.body.address,
            tenantName: req.body.tenantName,
            tenantEmail: req.body.tenantEmail,
            tenantContact: req.body.contact,
            dateOfOccupancy: new Date(req.body.dateOfOccupancy),
            paymentDate: parseInt(req.body.paymentDate, 10),
            image: propertyImageUrl,
            agreementPdf: agreementPdfUrl,
            reminderEnabled: req.body.reminderEnabled === "on"
        });

        await newProperty.save();
        res.redirect("/owner/dashboard");

    } catch (err) {
        console.error("❌ Error adding property:", err);
        res.status(500).send("Error adding property");
    }
});

router.post("/delete-property/:id", async (req, res) => {
    try {
        const propertyId = req.params.id;
        await Property.findByIdAndDelete(propertyId);
        req.flash('success', 'Property deleted successfully!');
        res.redirect("/owner/dashboard"); 
    } catch (error) {
        req.flash('error', 'Error deleting property.');
        res.status(500).send("Internal Server Error");
    }
});

router.get("/update-property/:id", async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);
        if (!property) {
            return res.status(404).send("Property not found");
        }
        res.render("pages/update-property", { property });
    } catch (error) {
        console.error("Error fetching property:", error);
        res.status(500).send("Internal Server Error");
    }
});

router.post("/update-property/:id", upload.fields([
    { name: "propertyImage", maxCount: 1 },
    { name: "agreementPdf", maxCount: 1 }
]), async (req, res) => {
    try {
        const { id } = req.params;
        const property = await Property.findById(id);
        if (!property) return res.status(404).send("Property not found");

        // Upload new image if provided
        if (req.files["propertyImage"]) {
            const result = await uploadToCloudinary(req.files["propertyImage"][0], "pay2stay/properties/images", "image");
            property.image = result.secure_url;
            fs.unlinkSync(req.files["propertyImage"][0].path); 
        }

        // Upload new agreement PDF if provided
        if (req.files["agreementPdf"]) {
            const result = await uploadToCloudinary(req.files["agreementPdf"][0], "pay2stay/properties/agreements", "raw");
            property.agreementPdf = result.secure_url;
            fs.unlinkSync(req.files["agreementPdf"][0].path); 
        }

        // Update other property fields
        Object.assign(property, req.body);
        await property.save();

        res.redirect("/owner/dashboard");
    } catch (err) {
        console.error("❌ Error updating property:", err);
        res.status(500).send("Error updating property");
    }
});

module.exports=router;