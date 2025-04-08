
import { QuizQuestion } from "@/types/quiz";
import { toast } from "sonner";

// 检测潜在的提示注入攻击
export const detectPromptInjection = (userInput: string): boolean => {
  const lowerInput = userInput.toLowerCase();
  
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
};

// API请求通用错误处理函数
const handleApiError = (error: any, errorMessage: string): never => {
  console.error(`${errorMessage}:`, error);
  toast.dismiss();
  
  const message = error.message || "未知错误";
  toast.error(`${errorMessage}: ${message}`);
  throw error;
};

// 检测API密钥配置状态
export const checkApiKeys = async (): Promise<{
  missingKeys: string[];
  optionalMissingKeys: string[];
}> => {
  try {
    // 首先检查localStorage
    const localKeys = {
      DEEPSEEK_API_KEY: localStorage.getItem("DEEPSEEK_API_KEY"),
      BREVO_API_KEY: localStorage.getItem("BREVO_API_KEY"),
      OPENAI_API_KEY: localStorage.getItem("OPENAI_API_KEY"),
    };
    
    // 如果本地存储有密钥，直接返回
    const missingKeys: string[] = [];
    const optionalMissingKeys: string[] = [];
    
    if (!localKeys.DEEPSEEK_API_KEY) missingKeys.push("DEEPSEEK_API_KEY");
    if (!localKeys.BREVO_API_KEY) missingKeys.push("BREVO_API_KEY");
    if (!localKeys.OPENAI_API_KEY) optionalMissingKeys.push("OPENAI_API_KEY");
    
    // 如果本地有所有必需的密钥，就不需要检查Vercel环境变量
    if (missingKeys.length === 0) {
      return { missingKeys, optionalMissingKeys };
    }
    
    // 尝试检查Vercel环境变量
    try {
      const response = await fetch("/api/check-api-keys", {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      });
      
      if (response.ok) {
        const data = await response.json();
        return {
          missingKeys: data.missingKeys || [],
          optionalMissingKeys: data.optionalMissingKeys || []
        };
      } else {
        // 如果API调用失败，使用本地检查结果
        return { missingKeys, optionalMissingKeys };
      }
    } catch (error) {
      // 如果无法访问API，使用本地检查结果
      console.warn("无法检查服务器API密钥配置，使用本地检查结果", error);
      return { missingKeys, optionalMissingKeys };
    }
  } catch (error) {
    return {
      missingKeys: ["DEEPSEEK_API_KEY", "BREVO_API_KEY"],
      optionalMissingKeys: ["OPENAI_API_KEY"]
    };
  }
};

// 从可用来源获取API密钥
const getApiKey = (keyName: string): string | null => {
  // 首先尝试从localStorage获取
  const localKey = localStorage.getItem(keyName);
  if (localKey) return localKey;
  
  // 如果本地没有，返回null（服务器端会检查环境变量）
  return null;
};

export async function generateQuestions(
  learningObjectives: string,
  options: {
    count?: number;
    difficulty?: 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create';
    bloomLevel?: 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create';
    questionTypes?: ('multiple_choice' | 'fill_in')[];
  } = {}
): Promise<QuizQuestion[]> {
  try {
    // 检查输入
    if (!learningObjectives || learningObjectives.trim() === "") {
      toast.error("请输入学习目标");
      throw new Error("学习目标不能为空");
    }
    
    // 在客户端进行简单检查
    if (detectPromptInjection(learningObjectives)) {
      toast.error("检测到潜在的提示注入。请重新表述您的请求。");
      throw new Error("Prompt injection attempt detected");
    }
    
    console.log("Generating quiz for learning objectives:", learningObjectives);
    console.log("Options:", options);
    
    toast.loading("AI 正在生成练习题...");

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
    
    // 获取DeepSeek API密钥
    const DEEPSEEK_API_KEY = getApiKey("DEEPSEEK_API_KEY");
    
    // 如果在本地没有找到密钥，检查API是否可用
    if (!DEEPSEEK_API_KEY) {
      // 检查API密钥配置
      const { missingKeys } = await checkApiKeys();
      if (missingKeys.includes("DEEPSEEK_API_KEY")) {
        toast.dismiss();
        toast.error("DeepSeek API 密钥未配置。请在API密钥设置中添加。");
        throw new Error("DeepSeek API key not configured");
      }
    }

    // 内容审核
    if (detectPromptInjection(learningObjectives)) {
      toast.dismiss();
      toast.error("检测到潜在的提示注入");
      throw new Error("检测到潜在的提示注入");
    }
    
    // 自定义系统提示
    const systemPrompt = `你是一个练习题生成器。请根据提供的学习目标创建 ${count} 个练习题（${multipleChoiceCount} 个选择题和 ${fillInCount} 个填空题）。

问题应符合布鲁姆分类法中的"${bloomLevel}"认知层级：
${bloomLevelDescription}

使用JSON格式返回响应，结构如下：{"questions": [{"id": "q1", "type": "multiple_choice", "question": "问题文本", "options": ["选项 A", "选项 B", "选项 C", "选项 D"], "correctAnswer": 0, "explanation": "解释", "bloomLevel": "${bloomLevel}"}, {"id": "q2", "type": "fill_in", "question": "带有空格的问题 ________。", "correctAnswer": "答案", "explanation": "解释", "bloomLevel": "${bloomLevel}"}]}`;

    console.log("Attempting to call DeepSeek API...");
    
    try {
      // 选择API调用方法
      let response;
      
      // 如果本地有API密钥，直接调用API
      if (DEEPSEEK_API_KEY) {
        console.log("Using local API key to call DeepSeek API");
        response = await fetch("https://api.deepseek.com/v1/chat/completions", {
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
      } else {
        // 否则使用服务器端API（会使用环境变量中的API密钥）
        console.log("Using server-side API endpoint");
        response = await fetch("/api/generate-quiz", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            learningObjectives,
            options: {
              count,
              bloomLevel,
              questionTypes
            }
          })
        });
      }

      console.log("API response status:", response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("API error response:", errorData);
        
        toast.dismiss();
        
        // Provide more specific error messages
        if (response.status === 401) {
          toast.error(`DeepSeek API 认证失败：API 密钥无效或过期`);
          throw new Error(`DeepSeek API 认证失败：API 密钥无效或过期`);
        } else if (response.status === 429) {
          toast.error(`DeepSeek API 请求过多：已达到限额`);
          throw new Error(`DeepSeek API 请求过多：已达到限额`);
        } else {
          toast.error(`DeepSeek API 错误: ${errorData.error?.message || response.statusText || "Unknown error"}`);
          throw new Error(`DeepSeek API 错误: ${errorData.error?.message || response.statusText || "Unknown error"}`);
        }
      }

      const data = await response.json();
      console.log("API successful response received");
      
      toast.dismiss();
      
      // 解析内容
      try {
        let questions;
        
        // 处理直接API调用的响应
        if (DEEPSEEK_API_KEY) {
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
            toast.error("无法解析 DeepSeek API 响应");
            throw new Error("Failed to parse DeepSeek API response as JSON");
          }
          
          if (!parsedContent.questions || !Array.isArray(parsedContent.questions)) {
            console.error("Invalid response format:", parsedContent);
            toast.error("来自 DeepSeek API 的响应格式无效");
            throw new Error("Invalid response format from DeepSeek API");
          }
          
          questions = parsedContent.questions;
        } else {
          // 处理服务器端API的响应
          if (!data.questions || !Array.isArray(data.questions)) {
            console.error("Invalid response format from server:", data);
            toast.error("服务器返回的响应格式无效");
            throw new Error("Invalid response format from server");
          }
          
          questions = data.questions;
        }
        
        // 验证并转换问题
        const processedQuestions = questions.map((q: any, index: number) => {
          // 确保每个问题都有有效的 ID
          const id = q.id || `q${index + 1}`;
          
          // 对于 multiple_choice 问题，确保 correctAnswer 是一个数字
          let correctAnswer = q.correctAnswer;
          if (q.type === "multiple_choice" && typeof correctAnswer === "string") {
            // 如果 correctAnswer 是像 "A"、"B" 这样的字符串，转换为索引
            const optionIndex = q.options.findIndex((opt: string) => 
              opt.trim().toLowerCase() === correctAnswer.trim().toLowerCase()
            );
            
            if (optionIndex >= 0) {
              correctAnswer = optionIndex;
            } else {
              const letterToIndex: Record<string, number> = {"a": 0, "b": 1, "c": 2, "d": 3, "e": 4};
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
        
        console.log(`Successfully generated ${processedQuestions.length} questions`);
        toast.success(`成功生成 ${processedQuestions.length} 个问题`);
        return processedQuestions;
      } catch (parseError) {
        return handleApiError(parseError, "解析 API 响应中的问题失败");
      }
    } catch (apiError) {
      return handleApiError(apiError, "无法连接到 API");
    }
  } catch (error) {
    return handleApiError(error, "生成测试失败");
  }
}

// 用于生成提示的函数
export async function generateHint(question: QuizQuestion): Promise<string> {
  try {
    // 获取OpenAI API密钥
    const OPENAI_API_KEY = getApiKey("OPENAI_API_KEY");
    
    // 如果有API密钥，直接调用API
    if (OPENAI_API_KEY) {
      try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
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
          throw new Error(`OpenAI API error: ${response.statusText}`);
        }
        
        const data = await response.json();
        return data.choices[0].message.content.trim();
      } catch (error) {
        console.error("Error calling OpenAI API directly:", error);
        // 回退到备用提示
        return getBasicHint(question);
      }
    } else {
      // 尝试服务器端API
      try {
        const response = await fetch("/api/generate-hint", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ question })
        });

        if (!response.ok) {
          throw new Error(`Server API error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.hint;
      } catch (serverError) {
        console.error("Error with server API:", serverError);
        // 回退到基本提示
        return getBasicHint(question);
      }
    }
  } catch (error) {
    console.error("Error generating hint:", error);
    return getBasicHint(question);
  }
}

// 获取基本提示（不使用API）
export function getBasicHint(question: QuizQuestion): string {
  if (question.type === "multiple_choice") {
    return "Try to eliminate obviously incorrect options first. Focus on the key terms in the question.";
  } else {
    const answer = String(question.correctAnswer);
    return `The answer starts with "${answer.charAt(0)}" and has ${answer.length} characters.`;
  }
}

// 内容审核
export const moderateContent = async (content: string): Promise<any> => {
  try {
    // 获取OpenAI API密钥
    const OPENAI_API_KEY = getApiKey("OPENAI_API_KEY");
    
    // 如果有API密钥，直接调用API
    if (OPENAI_API_KEY) {
      try {
        const response = await fetch('https://api.openai.com/v1/moderations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
          },
          body: JSON.stringify({ input: content })
        });

        if (!response.ok) {
          throw new Error(`OpenAI Moderation API error: ${response.statusText}`);
        }

        const data = await response.json();
        
        if (!data.results || !data.results[0]) {
          throw new Error('Invalid response from OpenAI Moderation API');
        }

        const result = data.results[0];
        
        // 映射 OpenAI 类别到我们的简化类别
        return {
          flagged: result.flagged,
          categories: {
            sexual: result.categories.sexual || result.categories["sexual/minors"] || false,
            hate: result.categories.hate || result.categories["hate/threatening"] || false,
            harassment: result.categories.harassment || result.categories["harassment/threatening"] || false,
            selfHarm: result.categories["self-harm"] || result.categories["self-harm/intent"] || 
                      result.categories["self-harm/instructions"] || false,
            violence: result.categories.violence || result.categories["violence/graphic"] || false,
            illicit: result.categories.illicit || false
          },
          categoryScores: {
            sexual: Math.max(result.category_scores.sexual || 0, result.category_scores["sexual/minors"] || 0),
            hate: Math.max(result.category_scores.hate || 0, result.category_scores["hate/threatening"] || 0),
            harassment: Math.max(result.category_scores.harassment || 0, result.category_scores["harassment/threatening"] || 0),
            selfHarm: Math.max(
              result.category_scores["self-harm"] || 0, 
              result.category_scores["self-harm/intent"] || 0,
              result.category_scores["self-harm/instructions"] || 0
            ),
            violence: Math.max(result.category_scores.violence || 0, result.category_scores["violence/graphic"] || 0),
            illicit: result.category_scores.illicit || 0
          }
        };
      } catch (error) {
        console.error("Error calling OpenAI Moderation API:", error);
        // 回退到本地内容审核
        return localModerateContent(content);
      }
    } else {
      // 尝试服务器端API
      try {
        const response = await fetch("/api/moderate-content", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ content })
        });

        if (!response.ok) {
          throw new Error(`Moderation server API error: ${response.statusText}`);
        }

        return await response.json();
      } catch (serverError) {
        console.error("Error with moderation server API:", serverError);
        // 回退到本地内容审核
        return localModerateContent(content);
      }
    }
  } catch (error) {
    console.error("Error with content moderation:", error);
    // 如果所有方法都失败，使用本地内容审核
    return localModerateContent(content);
  }
};

// 本地内容审核（不使用API）
export const localModerateContent = (content: string): any => {
  // 简单的基于词的检测
  const sensitiveTerms = {
    sexual: ["porn", "xxx", "sex", "nude"],
    hate: ["hate", "racist", "nazi", "bigot"],
    harassment: ["harass", "bully", "stalk"],
    selfHarm: ["suicide", "kill myself", "self harm"],
    violence: ["kill", "murder", "bomb", "shoot", "terrorist"],
    illicit: ["drug", "cocaine", "heroin", "illegal"]
  };
  
  const categories: Record<string, boolean> = {
    sexual: false,
    hate: false,
    harassment: false,
    selfHarm: false,
    violence: false,
    illicit: false
  };
  
  const categoryScores: Record<string, number> = {
    sexual: 0,
    hate: 0,
    harassment: 0,
    selfHarm: 0,
    violence: 0,
    illicit: 0
  };
  
  // 转为小写进行不区分大小写的匹配
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
  
  // 判断内容是否被标记
  const flagged = Object.values(categories).some(v => v);
  
  return {
    flagged,
    categories,
    categoryScores
  };
};

// 发送联系消息
export async function sendContactMessage(
  name: string, 
  email: string, 
  subject: string, 
  message: string
): Promise<boolean> {
  try {
    toast.loading("正在发送消息...");
    
    // 获取Brevo API密钥
    const BREVO_API_KEY = getApiKey("BREVO_API_KEY");
    
    // 内容审核
    const moderationResult = await moderateContent(message);
    if (moderationResult.flagged) {
      toast.dismiss();
      toast.error("您的消息包含不适当内容，无法发送。");
      return false;
    }
    
    let response;
    
    // 如果有API密钥，直接调用API
    if (BREVO_API_KEY) {
      // 创建邮件内容
      const emailContent = {
        sender: {
          name,
          email
        },
        to: [{
          email: "dickbussiness@163.com",
          name: "Website Contact"
        }],
        subject,
        htmlContent: `
          <html>
            <body>
              <h2>New Contact Form Submission</h2>
              <p><strong>From:</strong> ${name} (${email})</p>
              <p><strong>Subject:</strong> ${subject}</p>
              <div>
                <p><strong>Message:</strong></p>
                <p>${message.replace(/\n/g, '<br/>')}</p>
              </div>
            </body>
          </html>
        `
      };
      
      response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "api-key": BREVO_API_KEY
        },
        body: JSON.stringify(emailContent)
      });
    } else {
      // 尝试服务器端API
      response = await fetch("/api/send-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name, email, subject, message })
      });
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      toast.dismiss();
      toast.error(`发送失败: ${errorData.error || response.statusText || "未知错误"}`);
      return false;
    }
    
    toast.dismiss();
    toast.success("您的消息已成功发送！");
    return true;
  } catch (error) {
    console.error("Error sending message:", error);
    toast.dismiss();
    toast.error(`发送失败: ${(error as Error).message || "未知错误"}`);
    return false;
  }
}
