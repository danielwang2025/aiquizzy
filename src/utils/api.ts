
import { QuizQuestion } from "@/types/quiz";
import { toast } from "sonner";
import { addCsrfToHeaders } from "@/utils/securityUtils";
import { getApiKey } from "@/utils/envVars";
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
      toast.error("Potential prompt injection detected. Please reformulate your request.");
      throw new Error("Prompt injection attempt detected");
    }

    const moderationResult = moderateContent(learningObjectives);
    if (moderationResult.flagged) {
      toast.error("Your input contains potentially harmful content and cannot be processed.");
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
    
    toast.loading("Generating questions with AI...");

    // Get the DeepSeek API key from our environment variables
    const DEEPSEEK_API_KEY = getApiKey("DEEPSEEK_API_KEY");
    
    // Customize the system prompt based on options
    const systemPrompt = `You are a quiz generator. Create ${count} practice questions (${multipleChoiceCount} multiple choice and ${fillInCount} fill-in-the-blank) based on the learning objectives provided. The difficulty level should be ${difficulty}. Return the response in JSON format with the following structure: {"questions": [{"id": "q1", "type": "multiple_choice", "question": "Question text", "options": ["Option A", "Option B", "Option C", "Option D"], "correctAnswer": 0, "explanation": "Explanation", "difficulty": "${difficulty}"}, {"id": "q2", "type": "fill_in", "question": "Question with ________.", "correctAnswer": "answer", "explanation": "Explanation", "difficulty": "${difficulty}"}]}`;
    
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
            content: `Create a quiz based on these learning objectives: ${learningObjectives}`
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
          difficulty: q.difficulty || difficulty,
          topic
        };
      });
      
      return questions;
    } catch (error) {
      console.error("Error parsing DeepSeek response:", error);
      throw new Error("Failed to parse questions from DeepSeek API response");
    }
  } catch (error) {
    console.error("Error generating quiz:", error);
    toast.error("Failed to generate quiz. Please try again.");
    throw new Error("Failed to generate quiz");
  }
}
