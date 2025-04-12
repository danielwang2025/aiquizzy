
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
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    
    // 如果有 OpenAI API 密钥，使用他们的内容审核 API
    if (OPENAI_API_KEY) {
      try {
        const response = await fetch('https://api.openai.com/v1/moderations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            input: content
          })
        });

        const data = await response.json();
        
        if (!data.results || !data.results[0]) {
          throw new Error('Invalid response from OpenAI Moderation API');
        }

        const result = data.results[0];
        
        // 映射 OpenAI 类别到我们的简化类别
        const categories = {
          sexual: result.categories.sexual || result.categories["sexual/minors"] || false,
          hate: result.categories.hate || result.categories["hate/threatening"] || false,
          harassment: result.categories.harassment || result.categories["harassment/threatening"] || false,
          selfHarm: result.categories["self-harm"] || result.categories["self-harm/intent"] || 
                    result.categories["self-harm/instructions"] || false,
          violence: result.categories.violence || result.categories["violence/graphic"] || false,
          illicit: result.categories.illicit || result.categories["illicit/violent"] || false
        };

        // 映射分数
        const categoryScores = {
          sexual: Math.max(result.category_scores.sexual || 0, result.category_scores["sexual/minors"] || 0),
          hate: Math.max(result.category_scores.hate || 0, result.category_scores["hate/threatening"] || 0),
          harassment: Math.max(result.category_scores.harassment || 0, result.category_scores["harassment/threatening"] || 0),
          selfHarm: Math.max(
            result.category_scores["self-harm"] || 0, 
            result.category_scores["self-harm/intent"] || 0,
            result.category_scores["self-harm/instructions"] || 0
          ),
          violence: Math.max(result.category_scores.violence || 0, result.category_scores["violence/graphic"] || 0),
          illicit: Math.max(result.category_scores.illicit || 0, result.category_scores["illicit/violent"] || 0)
        };

        return res.status(200).json({
          flagged: result.flagged,
          categories,
          categoryScores
        });
      } catch (error) {
        console.error("Error using OpenAI moderation:", error);
        // 如果 OpenAI API 出错，回退到本地内容审核
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

// 基本的本地内容审核（当 OpenAI API 不可用时的回退）
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
