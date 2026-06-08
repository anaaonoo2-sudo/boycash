const {onRequest} = require("firebase-functions/v2/https");
const fetch = require("node-fetch");

exports.askAI = onRequest({cors: true}, async (req, res) => {
  const {prompt} = req.body;
  const API_KEY = "AIzaSyBpKia4xxM3BX-syBt1VTAXRFXQw82pJXk";

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          contents: [{role: "user", parts: [{text: prompt}]}]
        })
      }
    );
    const data = await response.json();
    res.json({result: data.candidates[0].content.parts[0].text});
  } catch (error) {
    res.status(500).json({error: "AI connection failed"});
  }
});
