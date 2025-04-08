
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
 * Content moderation using server API
 */
export const moderateContent = async (content: string): Promise<ModerationResult> => {
  try {
    const response = await fetch("/api/moderate-content", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ content })
    });

    if (!response.ok) {
      throw new Error("Content moderation API error");
    }

    return await response.json();
  } catch (error) {
    console.error("Error using moderation API, falling back to local moderation:", error);
    // Fallback to simple local moderation in case of API errors
    return localModerateContent(content);
  }
};

/**
 * Basic local content moderation (fallback when API is not available)
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
  
  // Simple asterisk filtering for demo
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
