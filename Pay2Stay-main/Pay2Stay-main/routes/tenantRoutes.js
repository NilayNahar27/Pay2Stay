const express = require('express');
const Tenant = require('../models/Tenant'); 
const Property = require('../models/Property');
const Owner = require('../models/Owner');
const Payment = require('../models/Payment');

const router = express.Router();

router.get('/dashboard', async (req, res) => {
    try {
        // Fetch tenant details
        const tenant = await Tenant.findOne({ tenantId: req.session.tenantId });
        if (!tenant) return res.redirect('/login');

        // Find property using tenant email
        const property = await Property.findOne({ tenantEmail: tenant.email });

        const payments = await Payment.find({ tenantEmail: tenant.email }).sort({ date: -1 });

        let owner = null;
        if (property) {
            // Fetch owner details using ownerId from the property
            owner = await Owner.findOne({ ownerId: property.ownerId });
        }

        res.render('pages/tenant-dashboard', { tenant, property, payments, owner, currentPage:'dashboard'});
    } catch (error) {
        console.error(error);
        res.status(500).send("Server error");
    }
});

router.post('/update-profile', async (req, res) => {
    try {
        const { name, contact } = req.body;
        const tenantId = req.session.tenantId; 

        if (!tenantId) {
            return res.status(401).send("Unauthorized: Tenant not logged in.");
        }

        // Find and update the tenant
        const updatedTenant = await Tenant.findOneAndUpdate(
            { tenantId: tenantId },
            { name, contact },
            { new: true }
        );

        if (!updatedTenant) {
            return res.status(404).send("Tenant not found.");
        }

        console.log("Profile Updated:", updatedTenant);
        res.redirect('/tenant/dashboard'); 
    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).send("Server Error: Unable to update profile.");
    }
});
module.exports=router;