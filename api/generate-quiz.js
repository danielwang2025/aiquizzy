
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
    const { learningObjectives, options = {} } = req.body;
    
    if (!learningObjectives || learningObjectives.trim() === "") {
      return res.status(400).json({ error: "Learning objectives cannot be empty" });
    }
    
    // 从 Vercel 环境变量中获取 API 密钥
    const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || req.headers['x-deepseek-key'];
    
    if (!DEEPSEEK_API_KEY) {
      return res.status(500).json({ error: 'DeepSeek API key not configured. Please add it in API settings.' });
    }

    // 简单检查是否包含提示注入
    if (containsPromptInjection(learningObjectives)) {
      return res.status(400).json({ error: "Potential prompt injection detected" });
    }
    
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
    const count = options.count || 5;
    const bloomLevel = options.bloomLevel || 'understand';
    const questionTypes = options.questionTypes || ['multiple_choice', 'fill_in'];
    
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

    // 设置请求超时
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60秒超时，延长超时时间
    
    try {
      console.log("Sending request to DeepSeek API...");
      // 调用 DeepSeek API，加入信号控制
      const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
        method: "POST",
        signal: controller.signal,
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
      
      clearTimeout(timeoutId);
      console.log("DeepSeek API response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("DeepSeek API error response:", errorData);
        
        // Provide more specific error messages
        if (response.status === 401) {
          return res.status(401).json({ error: `DeepSeek API authentication failed: Invalid or expired API key` });
        } else if (response.status === 429) {
          return res.status(429).json({ error: `DeepSeek API rate limit exceeded` });
        } else {
          return res.status(500).json({ error: errorData.error?.message || response.statusText || "Unknown error with DeepSeek API" });
        }
      }

      const data = await response.json();
      console.log("Received response from DeepSeek API");
      
      // 解析内容
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
      
      // 验证并转换问题
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
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        return res.status(504).json({ error: "Request timeout - DeepSeek API took too long to respond" });
      }
      
      console.error("Error fetching from DeepSeek API:", fetchError);
      return res.status(500).json({ error: fetchError.message || "Failed to connect to DeepSeek API" });
    }
  } catch (error) {
    console.error("Error generating quiz:", error);
    return res.status(500).json({ error: error.message || "Failed to generate quiz" });
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
