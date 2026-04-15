const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cors());

// Simple logging middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://feriddaghbouji_db_user:OyLOqJgd87aDaVZw@cluster0.wkxzy5g.mongodb.net/skygros?retryWrites=true&w=majority')
    .then(() => console.log('DB Connection Successfull!'))
    .catch((err) => {
        console.error(err);
    });

// Import Routes
const authRoute = require('./routes/auth');
const productRoute = require('./routes/products');
const userRoute = require('./routes/users');
const orderRoute = require('./routes/orders');
const categoryRoute = require('./routes/categories');
const settingsRoute = require('./routes/settings');
const demoRoute = require('./routes/demos');
const resetCodeRoute = require('./routes/resetCodes');
const neoRoute = require('./routes/neo');
const strong8kRoute = require('./routes/strong8k');
const activationRoute = require('./routes/activation');
const tivipanelRoute = require('./routes/tivipanel');
const promaxRoute = require('./routes/promax');
const mangoRoute = require('./routes/mango');
const uploadRoute = require('./routes/upload');
const rechargeRequestRoute = require('./routes/rechargeRequests');
const goldenIptvRoute = require('./routes/goldenIptv');
const u8kRoute = require('./routes/u8k');
const path = require('path');

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/auth', (req, res, next) => {
    console.log(`Auth request: ${req.method} ${req.url}`);
    next();
}, authRoute);
app.use('/api/products', productRoute);
app.use('/api/users', userRoute);
app.use('/api/orders', orderRoute);
app.use('/api/categories', categoryRoute);
app.use('/api/settings', settingsRoute);
app.use('/api/demos', demoRoute);
app.use('/api/reset-codes', resetCodeRoute);
app.use('/api/neo', neoRoute);
app.use('/api/strong8k', strong8kRoute);
app.use('/api/activation', activationRoute);
app.use('/api/tivipanel', tivipanelRoute);
app.use('/api/promax', promaxRoute);
app.use('/api/mango', mangoRoute);
app.use('/api/upload', uploadRoute);
app.use('/api/recharge-requests', rechargeRequestRoute);
app.use('/api/v1/orders', goldenIptvRoute);
app.use('/api/u8k', u8kRoute);

app.get('/', (req, res) => {
    res.send('update-12 4/6/2026');
});
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Backend server is running on port ${PORT}`);
});

module.exports = app;

