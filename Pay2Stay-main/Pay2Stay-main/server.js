const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const app = express();
const cors = require("cors");
const flash = require("connect-flash");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use(session({
    secret: 'pay2stay_secret',
    resave: false,
    saveUninitialized: true
}));
app.use(flash());
app.use((req, res, next) => {
    res.locals.messages = req.flash();
    next();
});
app.set('view engine', 'ejs');

app.use(express.static("public"));
app.use('/uploads', express.static('uploads')); 

// MongoDB Connection
const connectDB = require('./config/db.js');
connectDB();

// Routes
const ownerRoutes = require('./routes/ownerRoutes');
const tenantRoutes = require('./routes/tenantRoutes');
const authRoutes = require('./routes/authRoutes.js');
const pageRoutes = require('./routes/pageRoutes.js');
const paymentRoutes = require("./routes/paymentRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");

app.use("/feedback", feedbackRoutes);
app.use('/owner', ownerRoutes);
app.use('/tenant', tenantRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/', authRoutes);
app.use('/', pageRoutes);

// Start Server
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
