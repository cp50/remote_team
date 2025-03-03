const express = require('express');
const axios = require('axios');
const router = express.Router();
require('dotenv').config();

router.post('/chat', async (req, res) => {
    console.log("🔹 Incoming Request Body:", req.body);

    const userMessage = req.body.message; // ✅ Extract message from request

    if (!userMessage || typeof userMessage !== 'string') {
        console.error("❌ Missing or invalid 'message' in request body");
        return res.status(400).json({ error: 'Message is required and must be a string' });
    }

    // ✅ Update API URL and Model
    const apiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GOOGLE_API_KEY}`;

    const requestBody = {
        contents: [{ parts: [{ text: userMessage }] }]
    };

    try {
        console.log("🔹 Sending request to AI API:", JSON.stringify(requestBody, null, 2));

        const response = await axios.post(apiUrl, requestBody, {
            headers: { 'Content-Type': 'application/json' }
        });

        console.log("🔹 AI Response Data:", JSON.stringify(response.data, null, 2));

        const aiReply = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "AI response not available";

        res.json({ reply: aiReply });

    } catch (error) {
        console.error('❌ AI API Error:', error.response?.data || error.message);
        res.status(500).json({ error: 'AI service is unavailable' });
    }
});

module.exports = router;
