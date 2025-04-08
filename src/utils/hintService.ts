
import { QuizQuestion } from "@/types/quiz";

/**
 * Generates a hint for a given quiz question
 * @param question The quiz question to generate a hint for
 * @returns A promise that resolves to a hint string
 */
export async function generateHint(question: QuizQuestion): Promise<string> {
  try {
    // Call the serverless function endpoint
    const response = await fetch("/api/generate-hint", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ question })
    });

    if (!response.ok) {
      throw new Error("Failed to generate hint");
    }

    const data = await response.json();
    return data.hint;
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
