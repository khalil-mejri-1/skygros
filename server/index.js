const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://feriddaghbouji_db_user:ow6ytVLbpYNxGBtC@cluster0.wkxzy5g.mongodb.net/')
    // mongodb+srv://feriddaghbouji_db_user:ow6ytVLbpYNxGBtC@cluster0.wkxzy5g.mongodb.net/
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
const path = require('path');

app.use('/api/auth', authRoute);
app.use('/api/products', productRoute);
app.use('/api/users', userRoute);
app.use('/api/orders', orderRoute);
app.use('/api/categories', categoryRoute);
app.use('/api/settings', settingsRoute);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Backend server is running on port ${PORT}`);
});

module.exports = app;

