const cron = require('node-cron');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const Property = require('./models/Property'); 
require('dotenv').config(); 

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error("MongoDB connection error:", err));

// Configure Email Transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,  
        pass: process.env.EMAIL_PASS   
    }
});

// Function to Check and Send Reminders
async function sendReminders() {
    const today = new Date();
    const threeDaysLater = new Date();
    threeDaysLater.setDate(today.getDate() + 3);

    try {
        const properties = await Property.find({
            paymentDate: threeDaysLater.getDate(),
            reminderEnabled: true
        });

        for (let property of properties) {
            if (property.tenantEmail) {
                // Get current year and month for the payment date
                const paymentDate = new Date(today.getFullYear(), today.getMonth(), property.paymentDate);
                if (today.getDate() > property.paymentDate) {
                    paymentDate.setMonth(paymentDate.getMonth() + 1); 
                }
                
                const paymentMonth = paymentDate.toLocaleString('en-US', { month: 'long' }); 
                const paymentYear = paymentDate.getFullYear(); 

                const mailOptions = {
                    from: process.env.EMAIL_USER,
                    to: property.tenantEmail,
                    subject: 'Upcoming Rent Payment Reminder',
                    text: `Dear ${property.tenantName},\n\nThis is a reminder that your rent payment is due on the ${property.paymentDate}th of ${paymentMonth}, ${paymentYear}.\n\nBest regards,\nPay2Stay`
                };

                await transporter.sendMail(mailOptions);
                console.log(`Reminder sent to ${property.tenantEmail}`);
            }
        }
    } catch (error) {
        console.error("Error sending reminders:", error);
    }
}

// Schedule the Job to Run Every Day at 9 AM
cron.schedule('0 9 * * *', sendReminders);

console.log("Reminder service started, running every day at 9 AM");