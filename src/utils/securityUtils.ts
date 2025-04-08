
// Security utilities for the application

/**
 * Checks if a password meets the strong password requirements:
 * - 8-12 characters long
 * - Contains at least one uppercase letter
 * - Contains at least one lowercase letter
 * - Contains at least one number
 * - Contains at least one special character
 * 
 * @param password The password to validate
 * @returns An object with validation result and error message if applicable
 */
export const validateStrongPassword = (password: string): { isValid: boolean; message?: string } => {
  if (!password) {
    return { isValid: false, message: "密码是必需的" };
  }

  // Check length
  if (password.length < 8 || password.length > 12) {
    return { isValid: false, message: "密码长度必须为 8-12 个字符" };
  }

  // Check for uppercase letters
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: "密码必须包含至少一个大写字母" };
  }

  // Check for lowercase letters
  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: "密码必须包含至少一个小写字母" };
  }

  // Check for numbers
  if (!/[0-9]/.test(password)) {
    return { isValid: false, message: "密码必须包含至少一个数字" };
  }

  // Check for special characters
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { isValid: false, message: "密码必须包含至少一个特殊字符" };
  }

  // Check for common weak passwords
  const weakPasswords = ["password", "123456", "qwerty", "admin", "welcome"];
  if (weakPasswords.includes(password.toLowerCase())) {
    return { isValid: false, message: "此密码太常见，容易被猜到" };
  }

  return { isValid: true };
};

/**
 * Escapes HTML characters in a string to prevent XSS attacks
 * @param input The string to escape
 * @returns The escaped string
 */
export const escapeHtml = (input: string): string => {
  if (!input) return '';
  
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

/**
 * Generates a CSRF token
 * @returns A random token string
 */
export const generateCsrfToken = (): string => {
  return crypto.getRandomValues(new Uint8Array(16))
    .reduce((acc, val) => acc + val.toString(16).padStart(2, '0'), '');
};

/**
 * Stores the CSRF token in localStorage
 * @param token The token to store
 */
export const storeCsrfToken = (token: string): void => {
  localStorage.setItem('csrf_token', token);
};

/**
 * Retrieves the CSRF token from localStorage
 * @returns The stored token or null if not found
 */
export const getCsrfToken = (): string | null => {
  return localStorage.getItem('csrf_token');
};

/**
 * Adds CSRF token to fetch headers
 * @param headers The headers object to modify
 * @returns The updated headers
 */
export const addCsrfToHeaders = (headers: HeadersInit = {}): HeadersInit => {
  const token = getCsrfToken();
  if (token) {
    const updatedHeaders = new Headers(headers);
    updatedHeaders.append('X-CSRF-Token', token);
    return updatedHeaders;
  }
  return headers;
};

/**
 * Sanitizes a string for safe database operations
 * @param input The string to sanitize
 * @returns The sanitized string
 */
export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  
  // Remove SQL injection patterns
  return input
    .replace(/'/g, "''") // Escape single quotes
    .replace(/;/g, "") // Remove semicolons
    .replace(/--/g, "") // Remove comment markers
    .replace(/\/\*/g, "")
    .replace(/\*\//g, "")
    .trim();
};
