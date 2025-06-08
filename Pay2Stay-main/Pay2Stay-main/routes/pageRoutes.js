const express = require('express');
const router = express.Router();
const fs = require('fs');
const axios = require('axios');
const path = require('path');

// Home Route
router.get('/', (req, res) => {
    res.render('pages/home', { currentPage: 'home' });
});

// Features Route
router.get('/features', (req, res) => {
    res.render('pages/features', { currentPage: 'features' });
});

// Contact Route
router.get('/contact', (req, res) => {
    res.render('pages/contact', { currentPage: 'contact' });
});
// Signup Route
router.get('/signup', (req, res) => {
    res.render('pages/signup');
});

// Login Route
router.get('/login', (req, res) => {
    res.render('pages/login');
});

const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true }); 
}
router.get('/convert-to-pdf/:filename', async (req, res) => {
    try {
        const { filename } = req.params;
        const cloudinaryUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/pay2stay/properties/agreements/${filename}`;

        const tempPdfPath = path.join(tempDir, filename + '.pdf');

        // Download the original PDF from Cloudinary
        const response = await axios({
            url: cloudinaryUrl,
            method: 'GET',
            responseType: 'arraybuffer', 
        });

        fs.writeFileSync(tempPdfPath, response.data);

        // Serve the file for download
        res.download(tempPdfPath, filename + '.pdf', (err) => {
            if (err) console.error('Error sending file:', err);
            fs.unlinkSync(tempPdfPath); 
        });

    } catch (error) {
        console.error('Error fetching file from Cloudinary:', error);
        res.status(500).send('Error downloading the PDF');
    }
});

module.exports=router;