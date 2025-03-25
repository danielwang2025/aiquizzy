
/**
 * Environment variables management for the application.
 * 
 * This file manages environment variables and provides fallback values during development.
 * In production, these values should be set via proper environment variables.
 */

// Get an environment variable with fallback value
export const getEnvVar = (name: string): string => {
  // In a production environment, these would come from actual environment variables
  // For development, we can use import.meta.env (Vite) or process.env (Create React App)
  const envValue = import.meta.env?.[`VITE_${name}`] || 
                  (typeof process !== 'undefined' && process.env?.[name]) || 
                  '';
  
  // If we have an actual environment value, return it
  if (envValue) {
    return envValue;
  }
  
  // Check localStorage for development override
  try {
    const localStorageValue = localStorage.getItem(`ENV_${name}`);
    if (localStorageValue) {
      return localStorageValue;
    }
  } catch (error) {
    console.error(`Error accessing localStorage for ENV_${name}:`, error);
  }
  
  // Return empty string if no value is found
  return '';
};

// Set a development environment variable in localStorage
export const setDevEnvVar = (name: string, value: string): void => {
  try {
    localStorage.setItem(`ENV_${name}`, value);
  } catch (error) {
    console.error(`Error saving ENV_${name} to localStorage:`, error);
  }
};

// Get all development environment variables from localStorage
export const getAllDevEnvVars = (): Record<string, string> => {
  const envVars: Record<string, string> = {};
  
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('ENV_')) {
        const envName = key.replace('ENV_', '');
        envVars[envName] = localStorage.getItem(key) || '';
      }
    }
  } catch (error) {
    console.error('Error retrieving environment variables from localStorage:', error);
  }
  
  return envVars;
};

// Check if all required environment variables are set
export const checkRequiredEnvVars = (requiredVars: string[]): boolean => {
  return requiredVars.every(name => !!getEnvVar(name));
};

// Required environment variables for the application
export const REQUIRED_ENV_VARS = [
  'DEEPSEEK_API_KEY',
  'OPENAI_API_KEY'
];

// Check if the application has all required environment variables
export const hasAllRequiredEnvVars = (): boolean => {
  return checkRequiredEnvVars(REQUIRED_ENV_VARS);
};
