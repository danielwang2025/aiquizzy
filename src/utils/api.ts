
import { QuizQuestion } from "@/types/quiz";
import { toast } from "sonner";
import { addCsrfToHeaders } from "@/utils/securityUtils";
import { getEnvVar } from "@/utils/envConfig";
import { moderateContent, detectPromptInjection } from "@/utils/moderationService";

export async function generateQuestions(
  learningObjectives: string,
  options: {
    count?: number;
    difficulty?: 'easy' | 'medium' | 'hard';
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
      difficulty = 'medium',
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
    console.log("Options:", { count, difficulty, questionTypes, multipleChoiceCount, fillInCount });
    
    toast.loading("AI 正在生成练习题...");

    // Get the DeepSeek API key from environment variables
    const DEEPSEEK_API_KEY = getEnvVar("DEEPSEEK_API_KEY");
    
    // Customize the system prompt based on options, now including hints
    const systemPrompt = `你是一个练习题生成器。请根据提供的学习目标创建 ${count} 个练习题（${multipleChoiceCount} 个选择题和 ${fillInCount} 个填空题）。难度级别应为 ${difficulty}。每个问题都应包含一个有用的提示(hint)，以帮助学生解决问题。使用JSON格式返回响应，结构如下：{"questions": [{"id": "q1", "type": "multiple_choice", "question": "问题文本", "options": ["选项 A", "选项 B", "选项 C", "选项 D"], "correctAnswer": 0, "explanation": "解释", "difficulty": "${difficulty}", "hint": "这个问题的提示"}, {"id": "q2", "type": "fill_in", "question": "带有空格的问题 ________。", "correctAnswer": "答案", "explanation": "解释", "difficulty": "${difficulty}", "hint": "填空题的提示"}]}`;
    
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
        
        // Ensure we have a hint, or generate a default one
        const hint = q.hint || (q.type === "multiple_choice" 
          ? "试着排除明显不正确的选项，并专注于问题中的关键术语。" 
          : `答案以"${String(q.correctAnswer).charAt(0)}"开头，并且有${String(q.correctAnswer).length}个字符。`);
        
        return {
          ...q,
          id,
          correctAnswer,
          difficulty: q.difficulty || difficulty,
          topic,
          hint
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
