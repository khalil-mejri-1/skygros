const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for memory storage (required for Vercel persistence via Base64)
const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|webp|gif/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error("Error: File upload only supports images!"));
    }
});

// Upload route
router.post('/', upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Please upload a file" });
        }

        // Define the uploads directory
        const uploadsDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }

        // Generate a unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(req.file.originalname) || '.jpg';
        const filename = uniqueSuffix + ext;
        const fullPath = path.join(uploadsDir, filename);

        // Save the file buffer to disk
        fs.writeFileSync(fullPath, req.file.buffer);

        // Return the relative file path for the frontend
        const relativePath = `/api/uploads/${filename}`;

        res.status(200).json({
            message: "File uploaded successfully",
            filePath: relativePath // Now returns a short URL like /api/uploads/12345.jpg
        });
    } catch (err) {
        console.error("Upload error:", err);
        res.status(500).json({ message: "Server Error", error: err.message });
    }
});

module.exports = router;
