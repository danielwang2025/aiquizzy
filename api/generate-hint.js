
// Vercel Serverless Function for hint generation
export default async function handler(req, res) {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // 处理 OPTIONS 请求
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 确保请求方法为 POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { question } = req.body;
    
    // 从 Vercel 环境变量中获取 API 密钥
    const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
    
    if (!DEEPSEEK_API_KEY) {
      return res.status(500).json({ error: 'API key not configured in environment variables' });
    }

    // 对于简单问题，返回一个通用提示以避免不必要的 API 调用
    if (question.bloomLevel === "remember") {
      if (question.type === "multiple_choice") {
        return res.status(200).json({ hint: "Try eliminating options that are clearly incorrect first. Look for keywords in the question that match with specific options." });
      } else {
        const answer = String(question.correctAnswer);
        return res.status(200).json({ hint: `The answer is a term related to ${question.question.split(" ").slice(-3).join(" ")}. It starts with "${answer.charAt(0)}".` });
      }
    }
    
    // 对于更复杂的问题，使用 AI API
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
    
    // 如果 API 调用失败，则返回备用提示
    if (req.body.question.type === "multiple_choice") {
      return res.status(200).json({ hint: "Consider the context of the question and try to eliminate options that don't fit." });
    } else {
      return res.status(200).json({ hint: "Think about the key concepts related to this question and try to recall relevant terminology." });
    }
  }
}
