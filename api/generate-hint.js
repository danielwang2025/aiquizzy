
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

    // For any question, generate a simpler hint that doesn't reveal too much
    let hint = "";
    
    // For multiple choice questions, provide a strategy hint instead of content hint
    if (question.type === "multiple_choice") {
      const hintOptions = [
        "Look for keywords in the question that may point to a specific option.",
        "Try to eliminate obviously incorrect options first.",
        "Consider what you know about this topic and use process of elimination.",
        "Think about related concepts that might help you determine the answer.",
        "Review what you've learned about this topic recently.",
        "Focus on the specific terminology used in the question.",
        "Try to recall examples related to this concept."
      ];
      hint = hintOptions[Math.floor(Math.random() * hintOptions.length)];
      return res.status(200).json({ hint });
    } else {
      // For fill-in-the-blank, provide very general hints
      const answer = String(question.correctAnswer);
      const firstLetter = answer.charAt(0);
      
      const hintOptions = [
        `This term starts with the letter "${firstLetter}".`,
        "Consider the key terminology related to this topic.",
        "Think about the main concepts discussed in this section.",
        "Remember the definitions you've studied about this topic."
      ];
      hint = hintOptions[Math.floor(Math.random() * hintOptions.length)];
      return res.status(200).json({ hint });
    }
  } catch (error) {
    console.error("Error generating hint:", error);
    
    // Provide fallback hints if any error occurs
    if (req.body.question.type === "multiple_choice") {
      return res.status(200).json({ 
        hint: "Consider all options carefully and eliminate those that don't fit." 
      });
    } else {
      return res.status(200).json({ 
        hint: "Think about the key terminology related to this question." 
      });
    }
  }
}
