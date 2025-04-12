
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
    };
    
    // 如果本地存储有密钥，直接返回
    const missingKeys: string[] = [];
    const optionalMissingKeys: string[] = [];
    
    if (!localKeys.DEEPSEEK_API_KEY) missingKeys.push("DEEPSEEK_API_KEY");
    if (!localKeys.BREVO_API_KEY) missingKeys.push("BREVO_API_KEY");
    
    // 如果本地有所有必需的密钥，就不需要检查Vercel环境变量
    if (missingKeys.length === 0) {
      return { missingKeys, optionalMissingKeys };
    }
    
    // 尝试检查Vercel环境变量
    try {
      const response = await fetch("/api/check-api-keys", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store" // 禁用缓存，确保每次获取最新数据
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
      optionalMissingKeys: []
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

// 优化的API请求函数，添加AbortController支持
const fetchWithTimeout = async (
  url: string, 
  options: RequestInit, 
  timeout: number = 30000
): Promise<Response> => {
  const controller = new AbortController();
  const { signal } = controller;
  
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, { ...options, signal });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
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

    // 服务端API请求选项
    const serverRequestBody = {
      learningObjectives,
      options: {
        count: options.count || 5,
        bloomLevel: options.bloomLevel || 'understand',
        questionTypes: options.questionTypes || ['multiple_choice', 'fill_in']
      }
    };

    // 设置缓存控制
    const cacheOptions: RequestCache = "no-store"; // 禁用缓存
    
    // 添加自定义头以传递API密钥（如果在客户端有）
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
          cache: cacheOptions
        },
        90000 // 90秒超时，因为生成可能需要时间
      );
      
      console.log("API response status:", response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("API error response:", errorData);
        
        toast.dismiss();
        
        // 提供更具体的错误消息
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
      
      // 处理响应
      try {
        const questions = data.questions;
        
        if (!questions || !Array.isArray(questions)) {
          console.error("Invalid response format from server:", data);
          toast.error("服务器返回的响应格式无效");
          throw new Error("Invalid response format from server");
        }
        
        // 验证并处理问题
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
      // 处理请求超时
      if (apiError.name === 'AbortError') {
        toast.dismiss();
        toast.error("生成请求超时，请重试或简化您的请求");
        throw new Error("API request timed out");
      }
      return handleApiError(apiError, "无法连接到 API");
    }
  } catch (error) {
    return handleApiError(error, "生成测试失败");
  }
}

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
