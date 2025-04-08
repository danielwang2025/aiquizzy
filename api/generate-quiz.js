
// Vercel Serverless Function for quiz generation
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
    const { learningObjectives, options } = req.body;
    
    // 从 Vercel 环境变量中获取 API 密钥
    const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
    
    if (!DEEPSEEK_API_KEY) {
      console.error("Missing DeepSeek API key in environment variables");
      return res.status(500).json({ error: 'DeepSeek API key not configured in Vercel environment variables' });
    }

    // 内容审核 (简化版本，在服务器端进行)
    if (containsPromptInjection(learningObjectives)) {
      return res.status(400).json({ error: "检测到潜在的提示注入" });
    }
    
    // Debug info
    console.log("Received request for quiz generation with objectives:", learningObjectives);
    console.log("API Key configured:", DEEPSEEK_API_KEY ? "Yes (hidden for security)" : "No");
    
    // 设置布鲁姆分类级别描述
    const bloomLevelDescriptions = {
      remember: "基础记忆级别 - 考验学生对事实、术语、概念的记忆和识别能力。问题类型：定义术语、列出要点、识别正确陈述等。",
      understand: "理解级别 - 考验学生对所学内容的理解并能用自己的话解释的能力。问题类型：解释概念、总结内容、分类、比较差异等。",
      apply: "应用级别 - 考验学生在新情境中应用所学知识解决问题的能力。问题类型：应用公式、使用概念解决实际问题、展示使用方法等。",
      analyze: "分析级别 - 考验学生将信息分解为各组成部分并理解其关系的能力。问题类型：分析原因和结果、找出模式、辨别主要观点和支持证据等。",
      evaluate: "评估级别 - 考验学生基于标准和证据做出判断的能力。问题类型：评判方法有效性、辩护观点、批判性分析论点、作出决策并证明等。",
      create: "创造级别 - 考验学生将各元素组合成新整体的能力。问题类型：设计解决方案、提出假设、创建模型、开发计划等。"
    };
    
    // 设置默认选项
    const {
      count = 5,
      bloomLevel = 'understand',
      questionTypes = ['multiple_choice', 'fill_in']
    } = options || {};
    
    // 计算选择题和填空题的数量
    let multipleChoiceCount = count;
    let fillInCount = 0;
    
    if (questionTypes.includes('multiple_choice') && questionTypes.includes('fill_in')) {
      multipleChoiceCount = Math.ceil(count * 0.6); // 60% multiple choice
      fillInCount = count - multipleChoiceCount;
    } else if (questionTypes.includes('fill_in')) {
      multipleChoiceCount = 0;
      fillInCount = count;
    }
    
    const bloomLevelDescription = bloomLevelDescriptions[bloomLevel];
    
    // 自定义系统提示
    const systemPrompt = `你是一个练习题生成器。请根据提供的学习目标创建 ${count} 个练习题（${multipleChoiceCount} 个选择题和 ${fillInCount} 个填空题）。

问题应符合布鲁姆分类法中的"${bloomLevel}"认知层级：
${bloomLevelDescription}

使用JSON格式返回响应，结构如下：{"questions": [{"id": "q1", "type": "multiple_choice", "question": "问题文本", "options": ["选项 A", "选项 B", "选项 C", "选项 D"], "correctAnswer": 0, "explanation": "解释", "bloomLevel": "${bloomLevel}"}, {"id": "q2", "type": "fill_in", "question": "带有空格的问题 ________。", "correctAnswer": "答案", "explanation": "解释", "bloomLevel": "${bloomLevel}"}]}`;

    console.log("Attempting to call DeepSeek API...");
    
    // 调用 DeepSeek API
    try {
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
              content: systemPrompt
            },
            {
              role: "user",
              content: `根据这些学习目标创建测试：${learningObjectives}`
            }
          ],
          temperature: 0.7,
          max_tokens: 2000
        })
      });

      console.log("DeepSeek API response status:", response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("DeepSeek API error response:", errorData);
        
        // Provide more specific error messages
        if (response.status === 401) {
          return res.status(500).json({ error: `DeepSeek API 认证失败：API 密钥无效或过期` });
        } else if (response.status === 429) {
          return res.status(500).json({ error: `DeepSeek API 请求过多：已达到限额` });
        } else {
          return res.status(500).json({ error: `DeepSeek API 错误: ${errorData.error?.message || response.statusText || "Unknown error"}` });
        }
      }

      const data = await response.json();
      console.log("DeepSeek API successful response received");
      
      // 解析内容
      try {
        const content = data.choices[0].message.content;
        // 有时 API 返回带有 ```json 块的 markdown，因此我们需要提取 JSON
        const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```([\s\S]*?)```/);
        const jsonString = jsonMatch ? jsonMatch[1] : content;
        
        let parsedContent;
        try {
          parsedContent = JSON.parse(jsonString.trim());
        } catch (jsonError) {
          console.error("JSON parse error:", jsonError);
          console.log("Raw content that failed to parse:", jsonString);
          return res.status(500).json({ error: "Failed to parse DeepSeek API response as JSON" });
        }
        
        if (!parsedContent.questions || !Array.isArray(parsedContent.questions)) {
          console.error("Invalid response format:", parsedContent);
          return res.status(500).json({ error: "Invalid response format from DeepSeek API" });
        }
        
        // 验证并转换问题（如果需要）
        const questions = parsedContent.questions.map((q, index) => {
          // 确保每个问题都有有效的 ID
          const id = q.id || `q${index + 1}`;
          
          // 对于 multiple_choice 问题，确保 correctAnswer 是一个数字
          let correctAnswer = q.correctAnswer;
          if (q.type === "multiple_choice" && typeof correctAnswer === "string") {
            // 如果 correctAnswer 是像 "A"、"B" 这样的字符串，转换为索引
            const optionIndex = q.options.findIndex((opt) => 
              opt.trim().toLowerCase() === correctAnswer.trim().toLowerCase()
            );
            
            if (optionIndex >= 0) {
              correctAnswer = optionIndex;
            } else {
              const letterToIndex = {"a": 0, "b": 1, "c": 2, "d": 3, "e": 4};
              const letter = correctAnswer.trim().toLowerCase();
              if (letter in letterToIndex) {
                correctAnswer = letterToIndex[letter];
              }
            }
          }
          
          // 根据学习目标添加主题信息
          const topics = learningObjectives.split(',').map(t => t.trim());
          const topic = topics.length > 0 ? topics[0] : undefined;
          
          return {
            ...q,
            id,
            correctAnswer,
            bloomLevel: q.bloomLevel || bloomLevel,
            topic
          };
        });
        
        console.log(`Successfully generated ${questions.length} questions`);
        return res.status(200).json({ questions });
      } catch (parseError) {
        console.error("Error parsing DeepSeek response:", parseError);
        return res.status(500).json({ error: "解析 DeepSeek API 响应中的问题失败" });
      }
    } catch (apiError) {
      console.error("API call error:", apiError);
      return res.status(500).json({ error: `无法连接到 DeepSeek API: ${apiError.message}` });
    }
  } catch (error) {
    console.error("Error generating quiz:", error);
    return res.status(500).json({ error: "Failed to generate quiz" });
  }
}

// 简单检查是否包含提示注入
function containsPromptInjection(text) {
  const lowerInput = text.toLowerCase();
  
  // 常见的提示注入模式
  const injectionPatterns = [
    "ignore previous instructions",
    "ignore all instructions",
    "disregard",
    "forget everything",
    "new instructions",
    "override",
    "system prompt",
    "admin mode",
    "developer mode",
    "bypass",
    "jailbreak"
  ];
  
  return injectionPatterns.some(pattern => lowerInput.includes(pattern));
}
