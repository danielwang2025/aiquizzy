
// Environment variables management
// Since Lovable doesn't support .env files, we're using localStorage as a fallback

// API Keys object
export interface ApiKeys {
  DEEPSEEK_API_KEY: string;
  BREVO_API_KEY: string;
  OPENAI_API_KEY: string;
}

// Default API keys from the codebase (for development only)
const defaultApiKeys: ApiKeys = {
  DEEPSEEK_API_KEY: "sk-8e77c6120a864abf9a412304be119a2e",
  BREVO_API_KEY: "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",
  OPENAI_API_KEY: "", // This needs to be set by the user
};

// LocalStorage key for API keys
const API_KEYS_STORAGE_KEY = "app_api_keys";

/**
 * Get an API key from localStorage or fallback to the default
 * @param key The API key name
 * @returns The API key value
 */
export function getApiKey(key: keyof ApiKeys): string {
  try {
    const storedKeys = localStorage.getItem(API_KEYS_STORAGE_KEY);
    if (storedKeys) {
      const parsedKeys = JSON.parse(storedKeys) as Partial<ApiKeys>;
      if (parsedKeys[key]) {
        return parsedKeys[key] as string;
      }
    }
    return defaultApiKeys[key];
  } catch (error) {
    console.error(`Error retrieving API key ${key}:`, error);
    return defaultApiKeys[key];
  }
}

/**
 * Set an API key in localStorage
 * @param key The API key name
 * @param value The API key value
 */
export function setApiKey(key: keyof ApiKeys, value: string): void {
  try {
    const storedKeys = localStorage.getItem(API_KEYS_STORAGE_KEY);
    let parsedKeys: Partial<ApiKeys> = {};
    
    if (storedKeys) {
      parsedKeys = JSON.parse(storedKeys) as Partial<ApiKeys>;
    }
    
    parsedKeys[key] = value;
    localStorage.setItem(API_KEYS_STORAGE_KEY, JSON.stringify(parsedKeys));
  } catch (error) {
    console.error(`Error setting API key ${key}:`, error);
  }
}

/**
 * Get all API keys
 * @returns All API keys
 */
export function getAllApiKeys(): ApiKeys {
  try {
    const storedKeys = localStorage.getItem(API_KEYS_STORAGE_KEY);
    if (storedKeys) {
      const parsedKeys = JSON.parse(storedKeys) as Partial<ApiKeys>;
      return { ...defaultApiKeys, ...parsedKeys };
    }
    return defaultApiKeys;
  } catch (error) {
    console.error("Error retrieving all API keys:", error);
    return defaultApiKeys;
  }
}

/**
 * Set all API keys
 * @param keys API keys object
 */
export function setAllApiKeys(keys: Partial<ApiKeys>): void {
  try {
    const currentKeys = getAllApiKeys();
    const updatedKeys = { ...currentKeys, ...keys };
    localStorage.setItem(API_KEYS_STORAGE_KEY, JSON.stringify(updatedKeys));
  } catch (error) {
    console.error("Error setting all API keys:", error);
  }
}
