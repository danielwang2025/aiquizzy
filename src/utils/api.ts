
import { QuizQuestion } from "@/types/quiz";
import { toast } from "sonner";
import { addCsrfToHeaders } from "@/utils/securityUtils";
import { getApiKey } from "@/utils/envVars";
import { moderateContent, detectPromptInjection } from "@/utils/moderationService";

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
    // Check for prompt injection or harmful content
    if (detectPromptInjection(learningObjectives)) {
      toast.error("检测到潜在的提示注入。请重新表述您的请求。");
      throw new Error("Prompt injection attempt detected");
    }

    // Wait for the moderation result
    const moderationResult = await moderateContent(learningObjectives);
    if (moderationResult.flagged) {
      toast.error("您的输入包含潜在有害内容，无法处理。");
      throw new Error("Content moderation failed");
    }
    
    const {
      count = 5,
      bloomLevel = 'understand',
      questionTypes = ['multiple_choice', 'fill_in']
    } = options;
    
    // Calculate ratio of multiple choice to fill-in questions
    let multipleChoiceCount = count;
    let fillInCount = 0;
    
    if (questionTypes.includes('multiple_choice') && questionTypes.includes('fill_in')) {
      multipleChoiceCount = Math.ceil(count * 0.6); // 60% multiple choice
      fillInCount = count - multipleChoiceCount;
    } else if (questionTypes.includes('fill_in')) {
      multipleChoiceCount = 0;
      fillInCount = count;
    }
    
    console.log("Generating quiz for learning objectives:", learningObjectives);
    console.log("Options:", { count, bloomLevel, questionTypes, multipleChoiceCount, fillInCount });
    
    toast.loading("AI 正在生成练习题...");

    // Get the DeepSeek API key from our environment variables
    const DEEPSEEK_API_KEY = getApiKey("DEEPSEEK_API_KEY");
    
    // Create a description of the Bloom's level to guide the AI
    const bloomLevelDescriptions = {
      remember: "基础记忆级别 - 考验学生对事实、术语、概念的记忆和识别能力。问题类型：定义术语、列出要点、识别正确陈述等。",
      understand: "理解级别 - 考验学生对所学内容的理解并能用自己的话解释的能力。问题类型：解释概念、总结内容、分类、比较差异等。",
      apply: "应用级别 - 考验学生在新情境中应用所学知识解决问题的能力。问题类型：应用公式、使用概念解决实际问题、展示使用方法等。",
      analyze: "分析级别 - 考验学生将信息分解为各组成部分并理解其关系的能力。问题类型：分析原因和结果、找出模式、辨别主要观点和支持证据等。",
      evaluate: "评估级别 - 考验学生基于标准和证据做出判断的能力。问题类型：评判方法有效性、辩护观点、批判性分析论点、作出决策并证明等。",
      create: "创造级别 - 考验学生将各元素组合成新整体的能力。问题类型：设计解决方案、提出假设、创建模型、开发计划等。"
    };
    
    const bloomLevelDescription = bloomLevelDescriptions[bloomLevel];
    
    // Customize the system prompt based on options
    const systemPrompt = `你是一个练习题生成器。请根据提供的学习目标创建 ${count} 个练习题（${multipleChoiceCount} 个选择题和 ${fillInCount} 个填空题）。

问题应符合布鲁姆分类法中的"${bloomLevel}"认知层级：
${bloomLevelDescription}

使用JSON格式返回响应，结构如下：{"questions": [{"id": "q1", "type": "multiple_choice", "question": "问题文本", "options": ["选项 A", "选项 B", "选项 C", "选项 D"], "correctAnswer": 0, "explanation": "解释", "bloomLevel": "${bloomLevel}"}, {"id": "q2", "type": "fill_in", "question": "带有空格的问题 ________。", "correctAnswer": "答案", "explanation": "解释", "bloomLevel": "${bloomLevel}"}]}`;
    
    // Add CSRF token to headers
    const headers = addCsrfToHeaders({
      "Content-Type": "application/json",
      "Authorization": `Bearer ${DEEPSEEK_API_KEY}`
    });
    
    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers,
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

    toast.dismiss();
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("DeepSeek API error:", errorData);
      throw new Error(`DeepSeek API error: ${errorData.error?.message || "Unknown error"}`);
    }

    const data = await response.json();
    console.log("DeepSeek API response:", data);
    
    // Parse the content from the response
    try {
      const content = data.choices[0].message.content;
      // Sometimes the API returns markdown with ```json blocks, so we need to extract the JSON
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```([\s\S]*?)```/);
      const jsonString = jsonMatch ? jsonMatch[1] : content;
      
      const parsedContent = JSON.parse(jsonString.trim());
      
      if (!parsedContent.questions || !Array.isArray(parsedContent.questions)) {
        throw new Error("Invalid response format from DeepSeek API");
      }
      
      // Validate and transform the questions if needed
      const questions = parsedContent.questions.map((q: any, index: number) => {
        // Ensure each question has a valid ID
        const id = q.id || `q${index + 1}`;
        
        // For multiple_choice questions, ensure correctAnswer is a number
        let correctAnswer = q.correctAnswer;
        if (q.type === "multiple_choice" && typeof correctAnswer === "string") {
          // If correctAnswer is a string like "A", "B", convert to index
          const optionIndex = q.options.findIndex((opt: string) => 
            opt.trim().toLowerCase() === correctAnswer.trim().toLowerCase()
          );
          
          if (optionIndex >= 0) {
            correctAnswer = optionIndex;
          } else {
            const letterToIndex = {"a": 0, "b": 1, "c": 2, "d": 3, "e": 4};
            const letter = correctAnswer.trim().toLowerCase();
            if (letter in letterToIndex) {
              correctAnswer = letterToIndex[letter as keyof typeof letterToIndex];
            }
          }
        }
        
        // Add topic information based on learning objectives
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
      
      return questions;
    } catch (error) {
      console.error("Error parsing DeepSeek response:", error);
      throw new Error("解析 DeepSeek API 响应中的问题失败");
    }
  } catch (error) {
    console.error("Error generating quiz:", error);
    toast.error("生成测试失败。请重试。");
    throw new Error("Failed to generate quiz");
  }
}
