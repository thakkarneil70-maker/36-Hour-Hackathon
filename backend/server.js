const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// test route
app.get("/", (req, res) => {
    res.send("AI Server Running 🚀");
});

// AI route with retry logic for rate limiting
app.post("/api/ai", async (req, res) => {
    const { curve, angle, question, module, state } = req.body;

    const prompt = `
You are a smart math tutor inside an interactive simulation.

Current state:
- Curve: ${curve}
- Angle: ${angle}
- Module: ${module || 'unknown'}
- State: ${JSON.stringify(state || {})}

${question ? "User question: " + question : ""}

Explain what is happening in a simple, visual, intuitive way.
Keep it short and helpful.
`;

    const maxRetries = 3;
    const baseDelay = 2000; // 2 seconds

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const response = await fetch(
                "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" +
                (process.env.GEMINI_API_KEY || process.env.API_KEY),
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        contents: [
                            {
                                role: "user",
                                parts: [{ text: prompt }]
                            }
                        ]
                    })
                }
            );

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

            if (!response.ok) {
                return res.json({ reply: "I'm having trouble connecting right now—please try again in a moment." });
            }

            const data = await response.json();
            console.log("RAW AI:", data);

            let reply = "No response from AI";

            if (data.candidates && data.candidates.length > 0) {
                const parts = data.candidates[0]?.content?.parts;
                if (parts && parts.length > 0) {
                    reply = parts.map(p => p.text).join("");
                }
            } else if (data.error) {
                reply = "API Error: " + data.error.message;
            }

            return res.json({ reply });

        } catch (err) {
            console.error("ERROR:", err);
            if (attempt === maxRetries) {
                return res.json({ reply: "Error from AI" });
            }
            await new Promise(resolve => setTimeout(resolve, baseDelay));
        }
    }
});

// start server
app.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});