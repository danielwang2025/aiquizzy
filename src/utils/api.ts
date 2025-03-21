
import { QuizQuestionType } from "@/types/quiz";
import { toast } from "sonner";

const DEEPSEEK_API_KEY = "sk-8e77c6120a864abf9a412304be119a2e";

export async function generateQuestions(learningObjectives: string): Promise<QuizQuestionType[]> {
  try {
    console.log("Generating quiz for learning objectives:", learningObjectives);
    
    toast.loading("Generating questions with DeepSeek AI...");
    
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
            content: "You are a quiz generator. Create 5 practice questions (3 multiple choice and 2 fill-in-the-blank) based on the learning objectives provided. Return the response in JSON format with the following structure: {\"questions\": [{\"id\": \"q1\", \"type\": \"multiple_choice\", \"question\": \"Question text\", \"options\": [\"Option A\", \"Option B\", \"Option C\", \"Option D\"], \"correctAnswer\": 0, \"explanation\": \"Explanation\"}, {\"id\": \"q2\", \"type\": \"fill_in\", \"question\": \"Question with ________.\", \"correctAnswer\": \"answer\", \"explanation\": \"Explanation\"}]}"
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
        
        return {
          ...q,
          id,
          correctAnswer
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
