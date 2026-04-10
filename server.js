require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const HAS_API_KEY = !!(OPENROUTER_API_KEY);

// Smart mock response generator for when API is rate limited
function generateMockResponse(question, module) {
  const q = question.toLowerCase();
  
  // Chemistry responses
  if (q.includes('balance') || q.includes('equation') || module === 'chemistry') {
    return "A balanced equation has equal atoms on both sides. For example: 2H₂ + O₂ → 2H₂O. The coefficients ensure mass is conserved—2 hydrogen molecules react with 1 oxygen to form 2 water molecules.";
  }
  
  // Math responses
  if (q.includes('parabola') || q.includes('focus') || q.includes('directrix')) {
    return "A parabola is the set of points equidistant from a focus point and a directrix line. The standard form is y = ax², where the vertex is at the origin. Changing 'a' stretches or compresses the curve.";
  }
  if (q.includes('integral') || q.includes('area') || q.includes('volume')) {
    return "Integration finds the area under curves by summing infinite thin rectangles. For rotation, the disk method multiplies π by the squared function—like stacking circular pancakes to form a solid.";
  }
  if (q.includes('derivative') || q.includes('slope') || q.includes('rate')) {
    return "The derivative represents the instantaneous rate of change—like speed on a speedometer. Geometrically, it's the slope of the tangent line touching the curve at exactly one point.";
  }
  if (q.includes('limit') || q.includes('approach')) {
    return "Limits describe what happens as a variable approaches a value. For example, as x→0, sin(x)/x→1. They're the foundation of calculus, defining continuity and derivatives.";
  }
  
  // Physics responses
  if (q.includes('wave') || q.includes('frequency') || q.includes('amplitude')) {
    return "Waves transfer energy through oscillations. Key properties: wavelength (distance between peaks), frequency (peaks per second), and amplitude (maximum displacement). All are related by v = fλ.";
  }
  if (q.includes('momentum') || q.includes('collision')) {
    return "Momentum (p = mv) is conserved in collisions. In elastic collisions, both momentum and kinetic energy are conserved. In inelastic collisions, some energy transforms to heat/sound while momentum stays constant.";
  }
  if (q.includes('energy') || q.includes('kinetic') || q.includes('potential')) {
    return "Kinetic energy is energy of motion (½mv²). Potential energy is stored energy due to position—like gravitational (mgh) or elastic. Together they form mechanical energy, conserved in isolated systems.";
  }
  if (q.includes('force') || q.includes('newton')) {
    return "Newton's Second Law: F = ma. Force equals mass times acceleration. A net force causes acceleration in the direction of the force, proportional to force and inversely proportional to mass.";
  }
  
  // Default educational response
  return `Great question about "${question}"! In the ${module || 'science'} module, this concept connects to the simulation you're running. Try adjusting the parameters to see how changes affect the outcome—that's the best way to build intuition!`;
}

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
      // Try OpenRouter first (free tier, better limits)
      const openRouterUrl = 'https://openrouter.ai/api/v1/chat/completions';
      const response = await fetch(openRouterUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY || GEMINI_API_KEY}`,
          'HTTP-Referer': 'http://localhost:3000'
        },
        body: JSON.stringify({
          model: 'google/gemini-flash-1.5-8b',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 150
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
        // Fallback: provide intelligent mock response based on question
        const mockReply = generateMockResponse(question, module);
        console.log('API rate limited, using mock response');
        return res.json({ reply: mockReply });
      }

      // If OpenRouter fails with other errors
      if (!response.ok) {
        const errorText = await response.text();
        console.log(`OpenRouter error ${response.status}:`, errorText);
        // Fallback to mock response on any API error
        const mockReply = generateMockResponse(question, module);
        console.log('API failed, using mock response');
        return res.json({ reply: mockReply });
      }

      const data = await response.json();
      // OpenRouter format: data.choices[0].message.content
      const reply = data.choices?.[0]?.message?.content?.trim() || data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      // If empty response, use mock fallback
      if (!reply) {
        console.log('Empty API response, using mock');
        const mockReply = generateMockResponse(question, module);
        return res.json({ reply: mockReply });
      }

      // Success - return real AI response
      return res.json({ reply });

    } catch (error) {
      console.log(`AI Error (attempt ${attempt}/${maxRetries}):`, error.message);
      if (attempt === maxRetries) {
        // Final fallback to mock response
        const mockReply = generateMockResponse(question, module);
        console.log('All retries failed, using mock response');
        return res.json({ reply: mockReply });
      }
      await new Promise(resolve => setTimeout(resolve, baseDelay));
    }
  }
});

// Health check
app.get('/api/health', (req, res) => {
  const hasKey = HAS_API_KEY;
  res.json({ status: 'ok', hasApiKey: hasKey });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ AI Tutor server running on port ${PORT}`);
  if (OPENROUTER_API_KEY) {
    console.log('🤖 OpenRouter API configured');
  } else if (GEMINI_API_KEY) {
    console.log('🤖 Gemini API configured');
  } else {
    console.log('⚠️ No API key found');
  }
});
