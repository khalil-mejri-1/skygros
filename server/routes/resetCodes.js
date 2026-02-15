const router = require('express').Router();
const ResetCodeRequest = require('../models/ResetCodeRequest');
const ResetCodeOption = require('../models/ResetCodeOption');
const Product = require('../models/Product');
const User = require('../models/User'); // If needed for auth middleware
// You might want to import your verifyToken middleware if you have one.
// const { verifyToken, verifyTokenAndAdmin } = require('./verifyToken'); 

// Create a new reset code request
router.post('/', async (req, res) => {
    try {
        const { userId, type, code, productId, password } = req.body;

        // Fetch product details to store snapshot
        let productTitle = "";
        let productImage = "";

        if (productId) {
            const product = await Product.findById(productId);
            if (product) {
                productTitle = product.title;
                productImage = product.image;
            }
        }

        const newRequest = new ResetCodeRequest({
            userId,
            type,
            code,
            product: productId,
            productTitle,
            productImage,
            password
        });

        const savedRequest = await newRequest.save();
        res.status(201).json(savedRequest);
    } catch (err) {
        res.status(500).json(err);
    }
});

// Get all requests (Admin)
router.get('/', async (req, res) => {
    try {
        const requests = await ResetCodeRequest.find().sort({ createdAt: -1 }).populate('userId', 'username email');
        res.status(200).json(requests);
    } catch (err) {
        res.status(500).json(err);
    }
});

// Update request status (Admin)
router.put('/:id', async (req, res) => {
    try {
        const updatedRequest = await ResetCodeRequest.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );
        res.status(200).json(updatedRequest);
    } catch (err) {
        res.status(500).json(err);
    }
});

// --- Options Management ---

// Get all options
router.get('/options', async (req, res) => {
    try {
        const options = await ResetCodeOption.find();
        res.status(200).json(options);
    } catch (err) {
        res.status(500).json(err);
    }
});

// Add an option (Admin)
router.post('/options', async (req, res) => {
    try {
        const newOption = new ResetCodeOption(req.body);
        const savedOption = await newOption.save();
        res.status(201).json(savedOption);
    } catch (err) {
        res.status(500).json(err);
    }
});

// Delete an option (Admin)
router.delete('/options/:id', async (req, res) => {
    try {
        await ResetCodeOption.findByIdAndDelete(req.params.id);
        res.status(200).json("Option deleted");
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;
