const express = require("express");
const router = express.Router();
const checkPdfAccess = require("../middlewares/accessControl"); // Import middleware

router.get("/read/:pdfId", checkPdfAccess, async (req, res) => {
    try {
        const pdfId = req.params.pdfId;

        // Fetch the PDF file path from the database
        const pdf = await PDFModel.findById(pdfId);
        if (!pdf) return res.status(404).json({ message: "PDF not found" });

        // Stream the PDF file
        const filePath = pdf.filePath;
        const stream = fs.createReadStream(filePath);

        res.setHeader("Content-Type", "application/pdf");

        if (req.limitPages) {
            // Restrict to first 5 pages if the user is on the default plan
            const pdfParser = new PDFParser();
            pdfParser.loadPDF(filePath);

            pdfParser.on("pdfParser_dataReady", (pdfData) => {
                const extractedText = pdfData.formImage.Pages.slice(0, req.limitPages);
                res.send(extractedText);
            });
        } else {
            stream.pipe(res); // Full access for premium users
        }
    } catch (error) {
        res.status(500).json({ message: "Error loading PDF" });
    }
});

module.exports = router;
