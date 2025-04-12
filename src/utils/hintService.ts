
import { QuizQuestion } from "@/types/quiz";

// Implement caching for hint requests
const hintCache = new Map<string, {hint: string, timestamp: number}>();
const CACHE_TTL = 3600000; // 1 hour cache lifetime

/**
 * Generates a hint for a given quiz question
 * @param question The quiz question to generate a hint for
 * @returns A promise that resolves to a hint string
 */
export async function generateHint(question: QuizQuestion): Promise<string> {
  try {
    // Generate cache key based on question content
    const cacheKey = `hint-${question.id}-${question.question.substring(0, 50)}`;
    
    // Check cache first
    if (hintCache.has(cacheKey)) {
      const cachedData = hintCache.get(cacheKey);
      if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
        console.log("Using cached hint");
        return cachedData.hint;
      } else {
        // Remove expired cache entry
        hintCache.delete(cacheKey);
      }
    }

    // Set up AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    try {
      // Call the serverless function endpoint
      const response = await fetch("/api/generate-hint", {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ question })
      });

      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Hint API error:", errorData);
        throw new Error(errorData.error || "Failed to generate hint");
      }

      const data = await response.json();
      
      // Cache the hint
      hintCache.set(cacheKey, {
        hint: data.hint,
        timestamp: Date.now()
      });
      
      return data.hint;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        console.warn("Hint request timed out");
        return getBasicHint(question);
      }
      
      console.error("Error generating hint:", error);
      return getBasicHint(question);
    }
  } catch (error) {
    console.error("Error in hint generation:", error);
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
    return "Try to eliminate obviously incorrect options first. Focus on the key terms in the question.";
  } else {
    const answer = String(question.correctAnswer);
    return `The answer starts with "${answer.charAt(0)}" and has ${answer.length} characters.`;
  }
}
