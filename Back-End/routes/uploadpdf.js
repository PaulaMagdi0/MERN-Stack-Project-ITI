const express = require("express");
const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");
const { uploadPDF } = require("../config/multerConfig");

const router = express.Router();

// Upload and process PDF
router.post("/upload-pdf", uploadPDF.single("file"), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "No file uploaded" });

        // Extract text and metadata
        const data = await pdfParse(req.file.buffer);

        res.json({
            message: "File uploaded successfully",
            fileName: req.file.originalname,
            totalPages: data.numpages,
            content: data.text.substring(0, 500), // Show only first 500 characters
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
