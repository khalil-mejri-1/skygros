const router = require('express').Router();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');

// GET ALL PRODUCTS
router.get('/', async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json(products);
    } catch (err) {
        res.status(500).json(err);
    }
});

// CREATE PRODUCT
router.post('/', async (req, res) => {
    const newProduct = new Product(req.body);
    try {
        const savedProduct = await newProduct.save();
        res.status(200).json(savedProduct);
    } catch (err) {
        res.status(500).json(err);
    }
});

// UPDATE PRODUCT & FULFILL PENDING ORDERS
router.put('/:id', async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );

        if (!updatedProduct) return res.status(404).json("Product not found");

        // Fulfillment Logic: Check for pending orders for this product
        const pendingOrders = await Order.find({
            productId: updatedProduct._id,
            status: 'PENDING'
        }).sort({ createdAt: 1 }); // Priority: Oldest first

        const fulfillmentLogs = [];

        if (pendingOrders.length > 0) {
            let keysUpdated = false;

            for (let order of pendingOrders) {
                // Find first available key in the newly updated product
                const availableKeyIndex = updatedProduct.keys.findIndex(k => !k.isSold);

                if (availableKeyIndex !== -1) {
                    const selectedKey = updatedProduct.keys[availableKeyIndex];

                    // Update Product Key
                    selectedKey.isSold = true;
                    selectedKey.soldTo = order.userId;
                    selectedKey.soldAt = new Date();

                    // Update Order
                    order.licenseKey = selectedKey.key;
                    order.status = 'COMPLETED';
                    await order.save();

                    // Increment user purchase count
                    await User.findByIdAndUpdate(order.userId, { $inc: { purchaseCount: 1 } });

                    // Get user info for admin log
                    const recipient = await User.findById(order.userId);
                    fulfillmentLogs.push({
                        username: recipient ? recipient.username : "Utilisateur inconnu",
                        licenseKey: selectedKey.key
                    });

                    keysUpdated = true;
                } else {
                    // No more keys available to fulfill remaining orders
                    break;
                }
            }

            if (keysUpdated) {
                await updatedProduct.save();
            }
        }

        res.status(200).json({
            product: updatedProduct,
            fulfillmentLogs: fulfillmentLogs
        });
    } catch (err) {
        console.error("Fulfillment error:", err);
        res.status(500).json(err);
    }
});

// DELETE PRODUCT
router.delete('/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.status(200).json("Product has been deleted...");
    } catch (err) {
        res.status(500).json(err);
    }
});

// PURCHASE PRODUCT (ATOMIC)
// PURCHASE PRODUCT (ATOMIC + NEO 4K INTEGRATION)
router.post('/purchase', async (req, res) => {
    const { userId, productId } = req.body;
    try {
        const user = await User.findById(userId);
        const product = await Product.findById(productId);

        if (!user || !product) {
            return res.status(404).json({ message: "Utilisateur ou Produit non trouvé" });
        }

        if (user.balance < product.price) {
            return res.status(400).json({ message: "Solde insuffisant" });
        }

        let licenseKey = "PENDING";
        let subscriptionData = null;
        let orderStatus = "PENDING";

        // --- HANDLE M3U / NEO 4K ---
        if (product.type === 'm3u') {
            try {
                // Generate a temporary Order ID for reference
                const orderRef = new mongoose.Types.ObjectId();
                const { createSubscription } = require('../utils/neoApi');

                // Get options from request body (sent from frontend)
                const options = req.body.subscriptionDetails || {};

                // Use values from frontend or fallback to product defaults
                const subOptions = {
                    duration: options.packId || product.duration || 12, // packId in frontend was actually duration
                    packId: options.region || product.pack, // region in frontend was actually packId (Sort Bouquets)
                    country: options.country || 'TN'
                };

                // Call API
                const subInfo = await createSubscription(subOptions, orderRef.toString());

                subscriptionData = subInfo;
                orderStatus = "COMPLETED";
                // URL contains the m3u link with username/password
                licenseKey = subInfo.url;
            } catch (apiError) {
                console.error("NEO 4K API Failed:", apiError);
                // Depending on requirement, we might want to FAIL the order or keep it PENDING
                licenseKey = "ERROR_API";
                orderStatus = "PENDING";
            }
        }
        // --- HANDLE NORMAL PRODUCTS (KEYS) ---
        else {
            const now = new Date();
            const updatedProduct = await Product.findOneAndUpdate(
                { _id: productId, "keys.isSold": false },
                {
                    $set: {
                        "keys.$.isSold": true,
                        "keys.$.soldTo": userId,
                        "keys.$.soldAt": now
                    }
                },
                { new: true }
            );

            if (updatedProduct) {
                const claimedKey = updatedProduct.keys.find(k => k.soldTo && k.soldTo.toString() === userId && new Date(k.soldAt).getTime() === now.getTime());
                if (claimedKey) {
                    licenseKey = claimedKey.key;
                    orderStatus = "COMPLETED";
                }
            }
        }

        // --- DEDUCT BALANCE ---
        // Only deduct if successful or pending (reserved)
        // If API completely failed and we decide to fail the order, we shouldn't deduct.
        // But here we set status to PENDING on API error, implying manual fix, so we deduct.
        user.balance -= product.price;
        if (orderStatus === "COMPLETED") {
            user.purchaseCount += 1;
        }
        await user.save();

        // --- SAVE ORDER ---
        const newOrder = new Order({
            userId: user._id,
            productId: product._id,
            productTitle: product.title,
            productImage: product.image,
            price: product.price,
            licenseKey: licenseKey,
            status: orderStatus,
            subscription: subscriptionData
        });

        await newOrder.save();

        res.status(200).json({
            message: orderStatus === "COMPLETED" ? "Achat réussi" : "Commande reçue (En attente)",
            newBalance: user.balance,
            purchaseCount: user.purchaseCount,
            licenseKey: licenseKey,
            isPending: orderStatus === "PENDING",
            subscription: subscriptionData
        });

    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
});

// PURCHASE MULTIPLE PRODUCTS (CART)
router.post('/purchase-cart', async (req, res) => {
    const { userId, productIds } = req.body;
    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

        const products = await Product.find({ _id: { $in: productIds } });

        let totalCost = 0;
        for (let pid of productIds) {
            const product = products.find(p => p._id.toString() === pid.toString());
            if (product) totalCost += product.price;
        }

        if (user.balance < totalCost) {
            return res.status(400).json({ message: "Solde insuffisant" });
        }

        user.balance -= totalCost;
        await user.save();

        const keysToReturn = [];
        let hasPendingItems = false;

        // Fetch products into a map for easy access
        const uniqueIds = [...new Set(productIds)];
        const productsFetched = await Product.find({ _id: { $in: uniqueIds } });
        const productMap = {};
        productsFetched.forEach(p => productMap[p._id.toString()] = p);

        for (let pid of productIds) {
            const p = productMap[pid];
            if (!p) continue;

            const availableKey = p.keys.find(k => !k.isSold);

            if (availableKey) {
                availableKey.isSold = true;
                availableKey.soldTo = userId;
                availableKey.soldAt = new Date();
                await p.save();

                keysToReturn.push({
                    productId: p._id,
                    productTitle: p.title,
                    productImage: p.image,
                    licenseKey: availableKey.key,
                    status: "COMPLETED"
                });
            } else {
                hasPendingItems = true;
                keysToReturn.push({
                    productId: p._id,
                    productTitle: p.title,
                    productImage: p.image,
                    licenseKey: "PENDING",
                    status: "PENDING"
                });
            }
        }

        const completedCount = keysToReturn.filter(k => k.status === "COMPLETED").length;
        if (completedCount > 0) {
            user.purchaseCount += completedCount;
            await user.save();
        }

        res.status(200).json({
            message: "Achat réussi",
            newBalance: user.balance,
            purchaseCount: user.purchaseCount,
            purchasedItems: keysToReturn,
            hasPendingItems: hasPendingItems
        });

        // SAVE TO ORDERS COLLECTION
        for (let item of keysToReturn) {
            const newOrder = new Order({
                userId: user._id,
                productId: item.productId,
                productTitle: item.productTitle,
                productImage: item.productImage,
                price: productMap[item.productId.toString()].price,
                licenseKey: item.licenseKey,
                status: item.licenseKey === "PENDING" ? "PENDING" : "COMPLETED"
            });
            await newOrder.save();
        }

    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;
