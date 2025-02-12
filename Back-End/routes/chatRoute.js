const axios = require('axios');
require('dotenv').config();

const HUGGING_FACE_API_KEY = process.env.HUGGING_FACE_API_KEY;

if (!HUGGING_FACE_API_KEY) {
    console.error('❌ Missing Hugging Face API Key. Check your .env file.');
    process.exit(1);
}

const chatbot = async (req, res) => {
    const { prompt } = req.body; // Ensure client sends 'prompt' instead of 'message'

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }

    console.log('📩 Received prompt:', prompt);

    try {
        const response = await axios.post(
            'https://api-inference.huggingface.co/models/gpt2',
            { inputs: prompt },
            {
                headers: {
                    Authorization: `Bearer ${HUGGING_FACE_API_KEY}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        const reply = response.data[0]?.generated_text || 'No response from Hugging Face.';
        res.json({ reply });

    } catch (error) {
        console.error('❌ Hugging Face API Error:', error.response?.data || error.message);
        res.status(500).json({ error: error.response?.data || 'Something went wrong' });
    }
};

// Ensure the chatbot function is correctly exported
module.exports = chatbot;
