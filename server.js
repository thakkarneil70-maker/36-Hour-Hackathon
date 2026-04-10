require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

// Gemini API Configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.API_KEY;

// Clean prompt - no restrictions, any question allowed
function generatePrompt(question, state) {
  return `You are a helpful AI tutor.
Explain clearly in 2-3 lines.
Be intuitive and easy to understand.

Question: ${question}
State: ${JSON.stringify(state)}`;
}

// Main AI endpoint with retry logic for rate limiting
app.post('/api/ai', async (req, res) => {
  const { module, state, question } = req.body;

  console.log('AI request:', { question: question?.substring(0, 50), module });

  // Validate input
  if (!question || question.trim() === '') {
    return res.json({ reply: "Please ask a question and I'll help you understand it." });
  }

  const maxRetries = 3;
  const baseDelay = 2000; // 2 seconds

  // Try Gemini API with retry logic
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const prompt = generatePrompt(question, state);
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

      const response = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: { maxOutputTokens: 150, temperature: 0.7 }
        })
      });

      // Handle rate limiting with retry
      if (response.status === 429) {
        if (attempt < maxRetries) {
          const delay = baseDelay * attempt;
          console.log(`Rate limit hit, retrying in ${delay}ms (attempt ${attempt}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        return res.json({ reply: "⏳ Rate limit hit—please wait a moment and try again." });
      }

      // If Gemini fails with other errors, return error message - NO FAKE AI
      if (!response.ok) {
        console.log(`Gemini error ${response.status}`);
        return res.json({ reply: "I'm having trouble connecting right now—please try again in a moment." });
      }

      const data = await response.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      // If empty response, return error - NO FAKE AI
      if (!reply) {
        console.log('Empty Gemini response');
        return res.json({ reply: "I'm having trouble connecting right now—please try again in a moment." });
      }

      // Success - return real AI response
      return res.json({ reply });

    } catch (error) {
      console.log(`AI Error (attempt ${attempt}/${maxRetries}):`, error.message);
      if (attempt === maxRetries) {
        return res.json({ reply: "I'm having trouble connecting right now—please try again in a moment." });
      }
      await new Promise(resolve => setTimeout(resolve, baseDelay));
    }
  }
});

// Health check
app.get('/api/health', (req, res) => {
  const hasKey = !!GEMINI_API_KEY && GEMINI_API_KEY.length > 20;
  res.json({ status: 'ok', hasApiKey: hasKey });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ AI Tutor server running on port ${PORT}`);
  console.log(GEMINI_API_KEY ? '🤖 Gemini API configured' : '⚠️ No API key found');
});
