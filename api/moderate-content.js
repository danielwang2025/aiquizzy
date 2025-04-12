
// Vercel Serverless Function for content moderation
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
    const { content } = req.body;
    
    // 从 Vercel 环境变量中获取 API 密钥
    const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || process.env.DEEPSEEK_API_KEY_MODERATION;
    
    // 如果有 DeepSeek API 密钥，使用其内容审核能力
    if (DEEPSEEK_API_KEY) {
      try {
        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
          },
          body: JSON.stringify({
            model: "deepseek-chat",
            messages: [
              {
                role: "system",
                content: `You are a content moderation system. Analyze the following content and determine if it contains inappropriate material in any of these categories:
                - sexual: Any sexually explicit or adult content
                - hate: Hateful, racist or discriminatory content
                - harassment: Content that harasses or bullies individuals or groups
                - selfHarm: Content promoting self-harm or suicide
                - violence: Violent or graphic content
                - illicit: Content promoting illegal activities

                Respond with a JSON object only, structured as follows:
                {
                  "flagged": boolean,
                  "categories": {
                    "sexual": boolean,
                    "hate": boolean,
                    "harassment": boolean,
                    "selfHarm": boolean,
                    "violence": boolean,
                    "illicit": boolean
                  },
                  "categoryScores": {
                    "sexual": number (0-1),
                    "hate": number (0-1),
                    "harassment": number (0-1),
                    "selfHarm": number (0-1),
                    "violence": number (0-1),
                    "illicit": number (0-1)
                  }
                }`
              },
              {
                role: "user",
                content: content
              }
            ],
            temperature: 0.1,
            max_tokens: 500,
            response_format: { type: "json_object" }
          })
        });

        if (!response.ok) {
          throw new Error(`DeepSeek API returned ${response.status}`);
        }

        const data = await response.json();
        let moderationResult;
        
        try {
          const contentResponse = data.choices[0].message.content;
          moderationResult = JSON.parse(contentResponse);
        } catch (error) {
          throw new Error('Invalid response from DeepSeek API');
        }

        return res.status(200).json(moderationResult);
      } catch (error) {
        console.error("Error using DeepSeek moderation:", error);
        // 如果 DeepSeek API 出错，回退到本地内容审核
        return res.status(200).json(localModerateContent(content));
      }
    } else {
      // 回退到简单的本地内容审核
      return res.status(200).json(localModerateContent(content));
    }
  } catch (error) {
    console.error("Error in content moderation:", error);
    // 如果出错，返回安全的回退响应
    return res.status(500).json({
      flagged: true,
      categories: {},
      categoryScores: {},
      error: "Internal server error"
    });
  }
}

// 基本的本地内容审核（当 DeepSeek API 不可用时的回退）
function localModerateContent(content) {
  // 基于单词的简单检测
  const sensitiveTerms = {
    sexual: ["porn", "xxx", "sex", "nude"],
    hate: ["hate", "racist", "nazi", "bigot"],
    harassment: ["harass", "bully", "stalk"],
    selfHarm: ["suicide", "kill myself", "self harm"],
    violence: ["kill", "murder", "bomb", "shoot", "terrorist"],
    illicit: ["drug", "cocaine", "heroin", "illegal"]
  };
  
  const categories = {
    sexual: false,
    hate: false,
    harassment: false,
    selfHarm: false,
    violence: false,
    illicit: false
  };
  
  const categoryScores = {
    sexual: 0,
    hate: 0,
    harassment: 0,
    selfHarm: 0,
    violence: 0,
    illicit: 0
  };
  
  // 转换为小写以进行不区分大小写的匹配
  const lowerContent = content.toLowerCase();
  
  // 检查每个类别
  for (const [category, terms] of Object.entries(sensitiveTerms)) {
    for (const term of terms) {
      if (lowerContent.includes(term)) {
        categories[category] = true;
        categoryScores[category] += 0.7;
      }
    }
  }
  
  // 确定内容是否被标记
  const flagged = Object.values(categories).some(v => v);
  
  return {
    flagged,
    categories,
    categoryScores
  };
}
