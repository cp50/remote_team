const express = require('express');
const multer = require('multer');
const path = require('path');
const File = require('../models/File');
const { isAuthenticated } = require('../authMiddleware');


const router = express.Router();

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Save files in the 'uploads' folder
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname)); // Unique filename
    },
});

const upload = multer({ storage: storage });

// File upload route
router.post('/upload', isAuthenticated, upload.single('file'), async (req, res) => {
    try {
        const newFile = new File({
            filename: req.file.filename,
            filePath: req.file.path,
            uploadedBy: req.session.user.id,
        });
        await newFile.save();
        res.send('File uploaded successfully!');
    } catch (err) {
        res.status(500).send('Error uploading file: ' + err.message);
    }
});

// List uploaded files
router.get('/', isAuthenticated, async (req, res) => {
    try {
        const files = await File.find({ uploadedBy: req.session.user.id });
        res.render('files', { files });
    } catch (err) {
        res.status(500).send('Error retrieving files: ' + err.message);
    }
});

module.exports = router;
