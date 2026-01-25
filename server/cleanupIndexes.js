// Script to clean up all unnecessary indexes from categories collection
const mongoose = require('mongoose');
require('dotenv').config();

// Use the same MongoDB connection string as the server
const MONGODB_URI = process.env.MONGO_URI || 'mongodb+srv://feriddaghbouji_db_user:OyLOqJgd87aDaVZw@cluster0.wkxzy5g.mongodb.net/skygros?retryWrites=true&w=majority';

mongoose.connect(MONGODB_URI)
    .then(async () => {
        console.log('✅ Connected to MongoDB');

        const db = mongoose.connection.db;
        const collection = db.collection('categories');

        // Drop the categorySlug_1 index
        try {
            await collection.dropIndex('categorySlug_1');
            console.log('✅ Successfully dropped categorySlug_1 index');
        } catch (error) {
            if (error.code === 27) {
                console.log('⚠️  Index categorySlug_1 does not exist (already removed)');
            } else {
                console.error('❌ Error dropping categorySlug_1 index:', error.message);
            }
        }

        // List all current indexes
        const indexes = await collection.indexes();
        console.log('\n📋 Current indexes on categories collection:');
        console.log(JSON.stringify(indexes, null, 2));

        await mongoose.connection.close();
        console.log('\n✅ Database connection closed');
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ MongoDB connection error:', err);
        process.exit(1);
    });
