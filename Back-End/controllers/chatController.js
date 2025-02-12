const axios = require("axios");
require("dotenv").config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
    console.error("❌ Missing OpenAI API Key. Check your .env file.");
    process.exit(1);
}

const chatbot = async (req, res) => {
    const { prompt } = req.body; // Ensure client sends 'prompt' instead of 'message'

    if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
    }

    console.log("📩 Received prompt:", prompt);

    try {
        const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: "You are a book recommendation assistant." },
                    { role: "user", content: prompt }
                ],
                max_tokens: 150,
            },
            {
                headers: {
                    "Authorization": `Bearer ${OPENAI_API_KEY}`,
                    "Content-Type": "application/json",
                },
            }
        );

        const reply = response.data.choices[0]?.message?.content || "No response from OpenAI.";
        res.json({ reply });

    } catch (error) {
        console.error("❌ OpenAI API Error:", error.response?.data || error.message);
        res.status(500).json({ error: error.response?.data || "Something went wrong" });
    }
};

// ✅ Ensure the chatbot function is correctly exported
module.exports = chatbot;
