
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
    // 在客户端进行简单检查
    if (detectPromptInjection(learningObjectives)) {
      toast.error("检测到潜在的提示注入。请重新表述您的请求。");
      throw new Error("Prompt injection attempt detected");
    }
    
    console.log("Generating quiz for learning objectives:", learningObjectives);
    console.log("Options:", options);
    
    toast.loading("AI 正在生成练习题...");

    const response = await fetch("/api/generate-quiz", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        learningObjectives,
        options
      })
    });

    toast.dismiss();
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "服务器错误" }));
      console.error("API error:", errorData);
      
      // 提供更详细的错误信息
      if (errorData.error?.includes("API key not configured")) {
        toast.error("DeepSeek API 密钥未配置或无效。请在 Vercel 环境变量中检查 DEEPSEEK_API_KEY 设置。");
      } else {
        toast.error(`生成测试失败: ${errorData.error || "未知错误"}`);
      }
      
      throw new Error(`API error: ${errorData.error || "Unknown error"}`);
    }

    const data = await response.json();
    console.log("API response:", data);
    
    if (!data.questions || !Array.isArray(data.questions) || data.questions.length === 0) {
      toast.error("生成的问题格式无效或为空。请重试。");
      throw new Error("Invalid or empty questions data");
    }
    
    return data.questions;
  } catch (error) {
    console.error("Error generating quiz:", error);
    toast.error("生成测试失败。请重试。");
    throw new Error("Failed to generate quiz");
  }
}
