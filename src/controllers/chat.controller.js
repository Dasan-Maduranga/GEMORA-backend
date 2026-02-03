/**
 * Chat controller
 * Handles AI-powered chat requests using Google Gemini API
 */

const { GoogleGenerativeAI } = require("@google/generative-ai");

// Process user message and return AI-generated response
exports.askBot = async (req, res) => {
  try {
    const { message } = req.body;

    // Validate input message
    if (!message || message.trim() === "") {
      return res.status(400).json({ message: "Chat failed", error: "Message cannot be empty" });
    }

    // Verify API key is configured
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ message: "Chat failed", error: "API key not configured" });
    }

    // Initialize Gemini client per request to pick up fresh env changes
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // Initialize Gemini model
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // System prompt constraining AI to Gemora business domain
    const prompt = `
      You are a dedicated expert assistant for 'Gemora', a specialist store for Rare Gems and Gemological Instruments (tools like loupes, microscopes, tweezers, and refractometers).
      
      User Question: "${message}"

      Rules:
      1. ONLY answer questions related to Gems, Precious Stones, Jewelry, and Gemological Tools.
      2. STRICTLY REFUSE questions about musical instruments (like guitars, pianos, drums). If asked, say: "I apologize, but Gemora only specializes in gems and gemological tools, not musical instruments."
      3. Refuse general questions (weather, sports, etc.).
      4. Keep answers short, professional, and elegant.
      5. If uncertain, suggest contacting Gemora directly.
    `;

    // Generate AI response
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Return success response
    res.json({ success: true, reply: text });
  } catch (error) {
    // Log error and return error response
    const errorMessage = error?.message || "Unknown error";
    console.error("Chat Error:", errorMessage);

    // Handle leaked/invalid API key (403)
    if (errorMessage.includes("403") || errorMessage.toLowerCase().includes("leaked")) {
      return res.status(503).json({
        message: "Chat unavailable",
        error: "Gemini API key is invalid or revoked. Please rotate the key.",
        success: false
      });
    }

    res.status(500).json({
      message: "Chat failed",
      error: errorMessage,
      success: false
    });
  }
};