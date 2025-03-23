
// This is a simplified content moderation service
// In a real app, you would use OpenAI's Moderation API or similar services

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
 * Result of content moderation
 */
export interface ModerationResult {
  flagged: boolean;
  categories: ModerationCategories;
  categoryScores: Record<keyof ModerationCategories, number>;
}

/**
 * Basic local content moderation (demo version)
 * In a real app, you would use the OpenAI Moderation API:
 * 
 * ```javascript
 * import OpenAI from "openai";
 * const openai = new OpenAI();
 * 
 * const moderation = await openai.moderations.create({
 *   model: "text-moderation-latest",
 *   input: textToModerate
 * });
 * ```
 */
export const moderateContent = (content: string): ModerationResult => {
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
export const filterUserInput = (input: string): { text: string | null; blocked: boolean } => {
  const result = moderateContent(input);
  
  // Block completely if high severity issues detected
  if (result.flagged && (result.categories.violence || result.categories.hate)) {
    return { text: null, blocked: true };
  }
  
  // For other issues, return filtered text
  let filteredText = input;
  
  // Simple asterisk filtering for demo (in real app use more sophisticated methods)
  const termsToFilter = [].concat(...Object.values(sensitiveTerms));
  
  for (const term of termsToFilter) {
    const regex = new RegExp(term, 'gi');
    filteredText = filteredText.replace(regex, '*'.repeat(term.length));
  }
  
  return { 
    text: filteredText, 
    blocked: filteredText !== input 
  };
};

// Example sensitive terms for filtering
const sensitiveTerms = {
  sexual: ["porn", "xxx", "sex", "nude"],
  hate: ["hate", "racist", "nazi", "bigot"],
  harassment: ["harass", "bully", "stalk"],
  selfHarm: ["suicide", "kill myself", "self harm"],
  violence: ["kill", "murder", "bomb", "shoot", "terrorist"],
  illicit: ["drug", "cocaine", "heroin", "illegal"]
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
