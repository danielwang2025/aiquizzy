
// Vercel Serverless Function for hint generation
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle OPTIONS requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Ensure request method is POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { question } = req.body;
    
    // Get API key from Vercel environment variables
    const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
    
    if (!DEEPSEEK_API_KEY) {
      return res.status(500).json({ error: 'API key not configured in environment variables' });
    }

    // For simple questions, return a generic hint to avoid unnecessary API calls
    if (question.bloomLevel === "remember") {
      if (question.type === "multiple_choice") {
        return res.status(200).json({ hint: "Try eliminating options that are clearly incorrect first. Look for keywords in the question that match with specific options." });
      } else {
        const answer = String(question.correctAnswer);
        return res.status(200).json({ hint: `The answer is a term related to ${question.question.split(" ").slice(-3).join(" ")}. It starts with "${answer.charAt(0)}".` });
      }
    }
    
    // For more complex questions, use DeepSeek API
    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: "You are a helpful tutor that provides hints for quiz questions without giving away the answer. Provide a concise hint (max 100 characters) that guides the student in the right direction."
          },
          {
            role: "user",
            content: `Generate a hint for this question: "${question.question}". ${question.type === "multiple_choice" ? "Options: " + JSON.stringify(question.options) : ""}`
          }
        ],
        temperature: 0.4,
        max_tokens: 100
      })
    });

    if (!response.ok) {
      return res.status(500).json({ error: "Failed to generate hint" });
    }

    const data = await response.json();
    const hint = data.choices[0].message.content.trim();
    
    return res.status(200).json({ hint });
  } catch (error) {
    console.error("Error generating hint:", error);
    
    // Provide fallback hints if API call fails
    if (req.body.question.type === "multiple_choice") {
      return res.status(200).json({ hint: "Consider the context of the question and try to eliminate options that don't fit." });
    } else {
      return res.status(200).json({ hint: "Think about the key concepts related to this question and try to recall relevant terminology." });
    }
  }
}
