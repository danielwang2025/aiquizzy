import { QuizQuestion } from "@/types/quiz";
import { toast } from "sonner";

// Optimized version with request deduplication and caching support
const requestCache = new Map();

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
  // Cache key for this request
  const cacheKey = 'api-keys-check';
  
  // Check cache first
  if (requestCache.has(cacheKey)) {
    const cachedData = requestCache.get(cacheKey);
    const cacheAge = Date.now() - cachedData.timestamp;
    
    // Cache valid for 5 minutes
    if (cacheAge < 300000) {
      return cachedData.data;
    } else {
      requestCache.delete(cacheKey);
    }
  }
  
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
      const result = { missingKeys, optionalMissingKeys };
      requestCache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });
      return result;
    }
    
    // 尝试检查Vercel环境变量
    try {
      const response = await fetchWithTimeout(
        "/api/check-api-keys", 
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          cache: "no-store"
        },
        5000 // Reduced timeout for config checks
      );
      
      if (response.ok) {
        const data = await response.json();
        const result = {
          missingKeys: data.missingKeys || [],
          optionalMissingKeys: data.optionalMissingKeys || []
        };
        
        // Cache the successful response
        requestCache.set(cacheKey, {
          data: result,
          timestamp: Date.now()
        });
        
        return result;
      } else {
        return { missingKeys, optionalMissingKeys };
      }
    } catch (error) {
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

// Enhanced fetch with improved timeout and retry logic
const fetchWithTimeout = async (
  url: string, 
  options: RequestInit, 
  timeout: number = 30000,
  retries: number = 1
): Promise<Response> => {
  const controller = new AbortController();
  const { signal } = controller;
  
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    // Add cache control headers for GET requests
    if (options.method === 'GET' || !options.method) {
      options.headers = {
        ...options.headers,
        'Cache-Control': 'max-age=60' // 1 minute cache for GET requests
      };
    }
    
    const response = await fetch(url, { ...options, signal });
    clearTimeout(timeoutId);
    return response;
  } catch (error: any) {
    clearTimeout(timeoutId);
    
    // Implement retry logic for network issues
    if (retries > 0 && (error.name === 'TypeError' || error.name === 'AbortError')) {
      console.log(`Retrying fetch to ${url}, ${retries} attempts remaining`);
      // Exponential backoff - wait longer between retries
      await new Promise(resolve => setTimeout(resolve, 1000 * (3 - retries)));
      return fetchWithTimeout(url, options, timeout, retries - 1);
    }
    
    throw error;
  }
};

// Implement request deduplication for quiz generation
const pendingRequests = new Map();

export async function generateQuestions(
  learningObjectives: string,
  options: {
    count?: number;
    difficulty?: 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create';
    bloomLevel?: 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create';
    questionTypes?: ('multiple_choice' | 'fill_in')[];
  } = {}
): Promise<QuizQuestion[]> {
  // Create a unique request key based on params
  const requestKey = JSON.stringify({learningObjectives, options});
  
  // Check if there's already a pending request with the same parameters
  if (pendingRequests.has(requestKey)) {
    console.log('Returning existing pending request for same quiz parameters');
    return pendingRequests.get(requestKey);
  }
  
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
    
    // Create promise for the request
    const requestPromise = (async () => {
      toast.loading("AI 正在生成练习题...");

      const DEEPSEEK_API_KEY = getApiKey("DEEPSEEK_API_KEY");
      
      if (!DEEPSEEK_API_KEY) {
        const { missingKeys } = await checkApiKeys();
        if (missingKeys.includes("DEEPSEEK_API_KEY")) {
          toast.dismiss();
          toast.error("DeepSeek API 密钥未配置。请在API密钥设置中添加。");
          throw new Error("DeepSeek API key not configured");
        }
      }

      // 服务端API请求选项
      const serverRequestBody = {
        learningObjectives,
        options: {
          count: options.count || 5,
          bloomLevel: options.bloomLevel || 'understand',
          questionTypes: options.questionTypes || ['multiple_choice', 'fill_in']
        }
      };

      // Enhanced headers with performance optimizations
      const headers: Record<string, string> = { 
        "Content-Type": "application/json"
      };
      
      if (DEEPSEEK_API_KEY) {
        headers["x-deepseek-key"] = DEEPSEEK_API_KEY;
      }
      
      try {
        // 使用优化的timeout请求，60秒超时
        console.log("Calling API endpoint");
        const response = await fetchWithTimeout(
          "/api/generate-quiz", 
          {
            method: "POST",
            headers,
            body: JSON.stringify(serverRequestBody),
            cache: "no-store"
          },
          90000, // 90 second timeout
          2  // Allow 2 retries for API calls
        );
        
        console.log("API response status:", response.status);
        
        if (!response.ok) {
          // ... keep existing error handling
          const errorData = await response.json().catch(() => ({}));
          console.error("API error response:", errorData);
          
          toast.dismiss();
          
          if (response.status === 401) {
            toast.error(`DeepSeek API 认证失败：API 密钥无效或过期`);
            throw new Error(`DeepSeek API 认证失败：API 密钥无效或过期`);
          } else if (response.status === 429) {
            toast.error(`DeepSeek API 请求过多：已达到限额`);
            throw new Error(`DeepSeek API 请求过多：已达到限额`);
          } else if (response.status === 408 || response.status === 504) {
            toast.error(`生成超时，请重试或简化您的请求`);
            throw new Error(`API请求超时`);
          } else {
            toast.error(`DeepSeek API 错误: ${errorData.error || response.statusText || "Unknown error"}`);
            throw new Error(`DeepSeek API 错误: ${errorData.error || response.statusText || "Unknown error"}`);
          }
        }

        const data = await response.json();
        console.log("API successful response received");
        
        toast.dismiss();
        
        // Process the response data
        try {
          const questions = data.questions;
          
          if (!questions || !Array.isArray(questions)) {
            console.error("Invalid response format from server:", data);
            toast.error("服务器返回的响应格式无效");
            throw new Error("Invalid response format from server");
          }
          
          // Process and return the questions
          const processedQuestions = questions.map((q: any, index: number) => {
            // 确保每个问题都有有效的 ID
            const id = q.id || `q${index + 1}`;
            
            // 对于 multiple_choice 问题，确保 correctAnswer 是一个数字
            let correctAnswer = q.correctAnswer;
            if (q.type === "multiple_choice" && typeof correctAnswer === "string") {
              // 如果 correctAnswer 是像 "A"、"B" 这样的字符串，转换为索引
              const optionIndex = q.options?.findIndex((opt: string) => 
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
              bloomLevel: q.bloomLevel || options.bloomLevel || 'understand',
              topic
            };
          });
          
          console.log(`Successfully generated ${processedQuestions.length} questions`);
          toast.success(`成功生成 ${processedQuestions.length} 个问题`);
          return processedQuestions;
        } catch (parseError) {
          return handleApiError(parseError, "解析 API 响应中的问题失败");
        }
      } catch (apiError: any) {
        if (apiError.name === 'AbortError') {
          toast.dismiss();
          toast.error("生成请求超时，请重试或简化您的请求");
          throw new Error("API request timed out");
        }
        return handleApiError(apiError, "无法连接到 API");
      }
    })();
    
    // Store the promise in the pending requests map
    pendingRequests.set(requestKey, requestPromise);
    
    // Get the result
    const result = await requestPromise;
    
    // Remove from pending requests after completion
    pendingRequests.delete(requestKey);
    
    return result;
  } catch (error) {
    // Remove from pending requests if there was an error
    pendingRequests.delete(requestKey);
    return handleApiError(error, "生成测试失败");
  }
}

// Hint generation with improved caching
const hintCache = new Map();

export async function generateHint(question: QuizQuestion): Promise<string> {
  // Create cache key based on question ID and content
  const cacheKey = `hint-${question.id}-${question.question.substring(0, 50)}`;
  
  // Check cache first
  if (hintCache.has(cacheKey)) {
    console.log("Using cached hint");
    return hintCache.get(cacheKey);
  }
  
  try {
    // 获取OpenAI API密钥
    const OPENAI_API_KEY = getApiKey("OPENAI_API_KEY");
    
    // 如果没有API密钥，直接返回基本提示
    if (!OPENAI_API_KEY) {
      const hint = getBasicHint(question);
      hintCache.set(cacheKey, hint);
      return hint;
    }
    
    try {
      const response = await fetchWithTimeout(
        "https://api.openai.com/v1/chat/completions", 
        {
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
        },
        5000 // 5 second timeout
      );
      
      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }
      
      const data = await response.json();
      const hint = data.choices[0].message.content.trim();
      
      // Cache the hint
      hintCache.set(cacheKey, hint);
      
      return hint;
    } catch (error) {
      console.error("Error calling OpenAI API directly:", error);
      const hint = getBasicHint(question);
      hintCache.set(cacheKey, hint);
      return hint;
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
};

// Content moderation with caching
const moderationCache = new Map();

export const moderateContent = async (content: string): Promise<any> => {
  // Create cache key based on content hash
  const cacheKey = `moderation-${hashString(content)}`;
  
  // Check cache first
  if (moderationCache.has(cacheKey)) {
    console.log("Using cached moderation result");
    return moderationCache.get(cacheKey);
  }
  
  try {
    // 获取OpenAI API密钥
    const OPENAI_API_KEY = getApiKey("OPENAI_API_KEY");
    
    // 如果没有API密钥，使用本地审核
    if (!OPENAI_API_KEY) {
      const result = localModerateContent(content);
      moderationCache.set(cacheKey, result);
      return result;
    }
    
    try {
      const response = await fetchWithTimeout(
        'https://api.openai.com/v1/moderations', 
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
          },
          body: JSON.stringify({ input: content })
        },
        5000
      );

      if (!response.ok) {
        throw new Error(`OpenAI Moderation API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.results || !data.results[0]) {
        throw new Error('Invalid response from OpenAI Moderation API');
      }

      const result = data.results[0];
      
      // Map OpenAI categories to our simplified categories
      const mappedResult = {
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
      
      // Cache the result
      moderationCache.set(cacheKey, mappedResult);
      
      return mappedResult;
    } catch (error) {
      console.error("Error calling OpenAI Moderation API:", error);
      const result = localModerateContent(content);
      moderationCache.set(cacheKey, result);
      return result;
    }
  } catch (error) {
    console.error("Error with content moderation:", error);
    return localModerateContent(content);
  }
};

// Simple string hashing function for cache keys
function hashString(str: string): string {
  let hash = 0;
  if (str.length === 0) return hash.toString();
  
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return hash.toString();
}

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
    
    try {
      // 使用优化的请求函数
      response = await fetchWithTimeout(
        "/api/send-message", 
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ name, email, subject, message })
        },
        10000 // 10秒超时
      );
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        toast.dismiss();
        toast.error(`发送失败: ${errorData.error || response.statusText || "未知错误"}`);
        return false;
      }
      
      toast.dismiss();
      toast.success("您的消息已成功发送！");
      return true;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        toast.dismiss();
        toast.error("发送请求超时，请重试");
        return false;
      }
      console.error("Error sending message:", error);
      toast.dismiss();
      toast.error(`发送失败: ${error.message || "未知错误"}`);
      return false;
    }
  } catch (error: any) {
    console.error("Error in contact form:", error);
    toast.dismiss();
    toast.error(`发送失败: ${error.message || "未知错误"}`);
    return false;
  }
}
