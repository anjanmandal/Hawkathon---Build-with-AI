// server/routes/expressionRoutes.js
const express = require('express');
const router = express.Router();
const { ensureAuth } = require('../middlewares/authMiddleware');
const multer = require('multer');
const path = require('path');
const Expression = require('../models/Expression');

// Configure Multer to store files in ./uploads folder
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads'); // path to your "uploads" folder
  },
  filename: function (req, file, cb) {
    // e.g. "1669744635634-myImage.jpg"
    const uniqueSuffix = Date.now() + '-' + file.originalname;
    cb(null, uniqueSuffix);
  },
});
const upload = multer({ storage });

// POST /api/expression/upload
// Expects: form-data with "image" and "label"
router.post('/upload', ensureAuth, upload.single('image'), async (req, res) => {
  try {
    // Multer places file info in req.file
    // We also read "label" from req.body
    const { label } = req.body;
    if (!label || !req.file) {
      return res.status(400).json({ message: 'Missing label or image file.' });
    }

    // Build the local file path or a URL to this image
    // If you serve your uploads statically, you can do something like:
    //    const imageUrl = `/uploads/${req.file.filename}`;
    // or an absolute URL (e.g. yourdomain.com/uploads/filename)
    const imageUrl = `/uploads/${req.file.filename}`;

    // Create the Expression doc
    const expression = await Expression.create({
      label,
      imageUrl,
    });

    return res.json({
      message: 'Expression uploaded successfully',
      expression,
    });
  } catch (error) {
    console.error('Error uploading expression:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
