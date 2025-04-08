
import { QuizQuestion } from "@/types/quiz";
import { getApiKey } from "./envVars";

/**
 * Generates a hint for a given quiz question
 * @param question The quiz question to generate a hint for
 * @returns A promise that resolves to a hint string
 */
export async function generateHint(question: QuizQuestion): Promise<string> {
  const DEEPSEEK_API_KEY = getApiKey("DEEPSEEK_API_KEY");
  
  try {
    // For simple questions, return a generic hint to avoid unnecessary API calls
    if (question.bloomLevel === "remember") {
      if (question.type === "multiple_choice") {
        return "Try eliminating options that are clearly incorrect first. Look for keywords in the question that match with specific options.";
      } else {
        const answer = String(question.correctAnswer);
        return `The answer is a term related to ${question.question.split(" ").slice(-3).join(" ")}. It starts with "${answer.charAt(0)}".`;
      }
    }
    
    // For more complex questions, use the AI API
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
      throw new Error("Failed to generate hint");
    }

    const data = await response.json();
    const hint = data.choices[0].message.content.trim();
    
    return hint;
  } catch (error) {
    console.error("Error generating hint:", error);
    
    // Fallback hints if API call fails
    if (question.type === "multiple_choice") {
      return "Consider the context of the question and try to eliminate options that don't fit.";
    } else {
      return "Think about the key concepts related to this question and try to recall relevant terminology.";
    }
  }
}

/**
 * Get a basic hint based on question type without using API
 * @param question The quiz question
 * @returns A hint string
 */
export function getBasicHint(question: QuizQuestion): string {
  if (question.type === "multiple_choice") {
    return "Try to eliminate obviously incorrect options first. Focus on the key terms in the question.";
  } else {
    const answer = String(question.correctAnswer);
    return `The answer starts with "${answer.charAt(0)}" and has ${answer.length} characters.`;
  }
}
