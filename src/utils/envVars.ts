
// Environment variables management using Vite's import.meta.env
// This is a more secure approach than using localStorage

// API Keys object type definition
export interface ApiKeys {
  DEEPSEEK_API_KEY: string;
  BREVO_API_KEY: string;
  OPENAI_API_KEY: string;
}

/**
 * Get an API key from environment variables
 * @param key The API key name
 * @returns The API key value
 */
export function getApiKey(key: keyof ApiKeys): string {
  // Check if we're in a development environment
  const isDev = import.meta.env.DEV;
  
  // Use the environment variables based on the key
  switch (key) {
    case 'DEEPSEEK_API_KEY':
      return import.meta.env.VITE_DEEPSEEK_API_KEY || '';
    case 'BREVO_API_KEY':
      return import.meta.env.VITE_BREVO_API_KEY || '';
    case 'OPENAI_API_KEY':
      return import.meta.env.VITE_OPENAI_API_KEY || '';
    default:
      console.error(`Unknown API key requested: ${key}`);
      return '';
  }
}

/**
 * This function exists for backward compatibility
 * but no longer allows setting keys at runtime as they should be
 * environment variables only.
 */
export function setApiKey(key: keyof ApiKeys, value: string): void {
  console.warn('Setting API keys at runtime is no longer supported for security reasons. Please use environment variables.');
}

/**
 * Get all API keys from environment variables
 */
export function getAllApiKeys(): ApiKeys {
  return {
    DEEPSEEK_API_KEY: getApiKey('DEEPSEEK_API_KEY'),
    BREVO_API_KEY: getApiKey('BREVO_API_KEY'),
    OPENAI_API_KEY: getApiKey('OPENAI_API_KEY')
  };
}

/**
 * This function exists for backward compatibility
 * but no longer allows setting keys at runtime.
 */
export function setAllApiKeys(keys: Partial<ApiKeys>): void {
  console.warn('Setting API keys at runtime is no longer supported for security reasons. Please use environment variables.');
}
