
import { getApiKey } from "@/utils/envVars";
import OpenAI from "openai";

/**
 * Content categories that can be flagged
 */
export interface ModerationCategories {
  sexual: boolean;
  hate: boolean;
  harassment: boolean;
  selfHarm: boolean;
  violence: boolean;
  illicit: boolean;
}

/**
 * Extended categories from OpenAI moderation API
 */
export interface ExtendedModerationCategories extends ModerationCategories {
  "sexual/minors": boolean;
  "harassment/threatening": boolean;
  "hate/threatening": boolean;
  "illicit/violent": boolean;
  "self-harm/intent": boolean;
  "self-harm/instructions": boolean;
  "violence/graphic": boolean;
}

/**
 * Result of content moderation
 */
export interface ModerationResult {
  flagged: boolean;
  categories: ModerationCategories;
  categoryScores: Record<keyof ModerationCategories, number>;
}

/**
 * OpenAI Moderation API result
 */
interface OpenAIModerationResult {
  id: string;
  model: string;
  results: {
    flagged: boolean;
    categories: Record<string, boolean>;
    category_scores: Record<string, number>;
    category_applied_input_types?: Record<string, string[]>;
  }[];
}

/**
 * Content moderation using OpenAI's Moderation API
 * Falls back to local moderation if OpenAI key is not available
 */
export const moderateContent = async (content: string): Promise<ModerationResult> => {
  try {
    const OPENAI_API_KEY = getApiKey("OPENAI_API_KEY");

    // If we have an OpenAI API key, use their moderation API
    if (OPENAI_API_KEY) {
      const openai = new OpenAI({
        apiKey: OPENAI_API_KEY,
      });

      const moderation = await openai.moderations.create({
        input: content,
      });

      const result = moderation.results[0];

      // Map OpenAI categories to our simplified categories
      const categories: ModerationCategories = {
        sexual: result.categories.sexual || result.categories["sexual/minors"] || false,
        hate: result.categories.hate || result.categories["hate/threatening"] || false,
        harassment: result.categories.harassment || result.categories["harassment/threatening"] || false,
        selfHarm: result.categories["self-harm"] || result.categories["self-harm/intent"] || 
                  result.categories["self-harm/instructions"] || false,
        violence: result.categories.violence || result.categories["violence/graphic"] || false,
        illicit: result.categories.illicit || result.categories["illicit/violent"] || false
      };

      // Map scores
      const categoryScores: Record<keyof ModerationCategories, number> = {
        sexual: Math.max(result.category_scores.sexual || 0, result.category_scores["sexual/minors"] || 0),
        hate: Math.max(result.category_scores.hate || 0, result.category_scores["hate/threatening"] || 0),
        harassment: Math.max(result.category_scores.harassment || 0, result.category_scores["harassment/threatening"] || 0),
        selfHarm: Math.max(
          result.category_scores["self-harm"] || 0, 
          result.category_scores["self-harm/intent"] || 0,
          result.category_scores["self-harm/instructions"] || 0
        ),
        violence: Math.max(result.category_scores.violence || 0, result.category_scores["violence/graphic"] || 0),
        illicit: Math.max(result.category_scores.illicit || 0, result.category_scores["illicit/violent"] || 0)
      };

      return {
        flagged: result.flagged,
        categories,
        categoryScores
      };
    }

    // Fallback to simple local moderation
    return localModerateContent(content);
  } catch (error) {
    console.error("Error using OpenAI moderation, falling back to local moderation:", error);
    // Fallback to local moderation in case of API errors
    return localModerateContent(content);
  }
};

/**
 * Basic local content moderation (fallback when OpenAI API is not available)
 */
export const localModerateContent = (content: string): ModerationResult => {
  // Simple word-based detection for demo purposes
  const sensitiveTerms = {
    sexual: ["porn", "xxx", "sex", "nude"],
    hate: ["hate", "racist", "nazi", "bigot"],
    harassment: ["harass", "bully", "stalk"],
    selfHarm: ["suicide", "kill myself", "self harm"],
    violence: ["kill", "murder", "bomb", "shoot", "terrorist"],
    illicit: ["drug", "cocaine", "heroin", "illegal"]
  };
  
  const categories: ModerationCategories = {
    sexual: false,
    hate: false,
    harassment: false,
    selfHarm: false,
    violence: false,
    illicit: false
  };
  
  const categoryScores: Record<keyof ModerationCategories, number> = {
    sexual: 0,
    hate: 0,
    harassment: 0,
    selfHarm: 0,
    violence: 0,
    illicit: 0
  };
  
  // Convert to lowercase for case-insensitive matching
  const lowerContent = content.toLowerCase();
  
  // Check each category
  for (const [category, terms] of Object.entries(sensitiveTerms)) {
    const typedCategory = category as keyof ModerationCategories;
    
    for (const term of terms) {
      if (lowerContent.includes(term)) {
        categories[typedCategory] = true;
        categoryScores[typedCategory] += 0.7;
      }
    }
  }
  
  // Determine if content is flagged
  const flagged = Object.values(categories).some(v => v);
  
  return {
    flagged,
    categories,
    categoryScores
  };
};

/**
 * Filter potentially harmful user input
 * @param input User input text
 * @returns Filtered text or null if completely blocked
 */
export const filterUserInput = async (input: string): Promise<{ text: string | null; blocked: boolean }> => {
  const result = await moderateContent(input);
  
  // Block completely if high severity issues detected
  if (result.flagged && (result.categories.violence || result.categories.hate)) {
    return { text: null, blocked: true };
  }
  
  // For other issues, return filtered text
  let filteredText = input;
  
  // Simple asterisk filtering for demo (in real app use more sophisticated methods)
  const sensitiveTerms = {
    sexual: ["porn", "xxx", "sex", "nude"],
    hate: ["hate", "racist", "nazi", "bigot"],
    harassment: ["harass", "bully", "stalk"],
    selfHarm: ["suicide", "kill myself", "self harm"],
    violence: ["kill", "murder", "bomb", "shoot", "terrorist"],
    illicit: ["drug", "cocaine", "heroin", "illegal"]
  };
  
  for (const terms of Object.values(sensitiveTerms)) {
    for (const term of terms) {
      const regex = new RegExp(term, 'gi');
      filteredText = filteredText.replace(regex, '*'.repeat(term.length));
    }
  }
  
  return { 
    text: filteredText, 
    blocked: filteredText !== input 
  };
};

/**
 * Detect potential prompt injection attacks
 * @param userInput User provided input
 * @returns True if injection is detected
 */
export const detectPromptInjection = (userInput: string): boolean => {
  const lowerInput = userInput.toLowerCase();
  
  // Common prompt injection patterns
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
