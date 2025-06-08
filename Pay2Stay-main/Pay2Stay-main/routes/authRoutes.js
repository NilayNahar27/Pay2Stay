const express = require('express');
const Owner = require('../models/Owner');
const Tenant = require('../models/Tenant');
const bcrypt = require('bcrypt');

const router = express.Router();

router.post('/signup', async (req, res) => {
    const { role, name, email, password } = req.body;

    // Check if email is already registered
    const ownerExists = await Owner.findOne({ email });
    const tenantExists = await Tenant.findOne({ email });

    // Hash password before storing
    const hashedPassword = await bcrypt.hash(password, 10);

    if (role === 'owner') {
        if (ownerExists) {
            return res.send('Email is already registered. Please use a different email.');
        }
        const ownerId = 'OWNER' + Date.now();
        const newOwner = new Owner({ name, email, password: hashedPassword, ownerId });
        await newOwner.save();
        req.session.ownerId = ownerId;
        return res.redirect('/owner/dashboard');
    } 
    
    if (role === 'tenant') {
        if (tenantExists) {
            return res.send('Email is already registered. Please use a different email.');
        }
        const tenantId = 'TENANT' + Date.now();
        const newTenant = new Tenant({ name, email, password: hashedPassword, tenantId });
        await newTenant.save();
        console.log("Saved Tenant:", newTenant);
        req.session.tenantId = tenantId;
        return res.redirect('/tenant/dashboard');
    } 

    return res.send('Invalid role selected.');
});

// Login Route
router.post('/login', async (req, res) => {
    const { role, email, password } = req.body;

    if (role === 'owner') {
        const owner = await Owner.findOne({ email });
        if (!owner) {
            console.log("Owner Not Found.");
            return res.render('pages/login', { errorMessage: 'Invalid Owner Credentials.' });
        }

        const passwordMatch = await bcrypt.compare(password, owner.password);

        if (passwordMatch) {
            req.session.ownerId = owner.ownerId;
            console.log("Owner Login Successful.");
            return res.redirect('/owner/dashboard');
        }

        console.log("Owner Login Failed: Incorrect Password.");
        return res.render('pages/login', { errorMessage: 'Invalid Owner Credentials.' });
    }

    if (role === 'tenant') {
        const tenant = await Tenant.findOne({ email });
        if (!tenant) {
            console.log("Tenant Not Found.");
            return res.render('pages/login', { errorMessage: 'Invalid Tenant Credentials.' });
        }

        const passwordMatch = await bcrypt.compare(password, tenant.password);

        if (passwordMatch) {
            req.session.tenantId = tenant.tenantId;
            console.log("Tenant Login Successful.");
            return res.redirect('/tenant/dashboard');
        }

        console.log("Tenant Login Failed: Incorrect Password.");
        return res.render('pages/login', { errorMessage: 'Invalid Tenant Credentials.' });
    }

    return res.render('pages/login', { errorMessage: 'Please select a valid role.' });
});

// Logout Route
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
            return res.redirect('/owner/dashboard');
        }
        res.clearCookie('connect.sid'); 
        res.redirect('/'); 
    });
});

module.exports = router;
