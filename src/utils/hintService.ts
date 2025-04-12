
import { QuizQuestion } from "@/types/quiz";

/**
 * Generates a hint for a given quiz question
 * @param question The quiz question to generate a hint for
 * @returns A promise that resolves to a hint string
 */
export async function generateHint(question: QuizQuestion): Promise<string> {
  try {
    // Define a timeout for the API call
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3-second timeout
    
    // Call the serverless function endpoint
    const response = await fetch("/api/generate-hint", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ question }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error("Failed to generate hint");
    }

    const data = await response.json();
    return data.hint;
  } catch (error) {
    console.error("Error generating hint:", error);
    
    // Return a cached hint immediately for better responsiveness
    return getBasicHint(question);
  }
}

/**
 * Provides a basic hint for a quiz question when API is unavailable
 * @param question The quiz question to generate a hint for
 * @returns A basic hint string based on question type
 */
export function getBasicHint(question: QuizQuestion): string {
  if (question.type === "multiple_choice") {
    const hintOptions = [
      "Try to eliminate obviously incorrect options first.",
      "Consider what the question is specifically asking for.",
      "Look for keywords in both the question and options.",
      "Think about what you know about this topic in general."
    ];
    return hintOptions[Math.floor(Math.random() * hintOptions.length)];
  } else {
    const hintOptions = [
      "Think about the key terminology related to this concept.",
      "Consider what would logically complete this statement.",
      "Review the main ideas covered in this section.",
      "Try to recall similar examples you've studied."
    ];
    return hintOptions[Math.floor(Math.random() * hintOptions.length)];
  }
}
