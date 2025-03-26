
import { User } from "@/types/quiz";
import { addCsrfToHeaders, validateStrongPassword } from "./securityUtils";

// LocalStorage keys
const USER_KEY = "quiz_user";
const AUTH_TOKEN_KEY = "quiz_auth_token";

// Simulated API delay for authentication operations
const SIMULATED_DELAY = 800;

/**
 * Simple user registration with security enhancements
 */
export const registerUser = async (email: string, password: string, displayName?: string): Promise<User> => {
  try {
    // Validate password strength
    const passwordValidation = validateStrongPassword(password);
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.message);
    }
    
    // Add simulated API delay
    await new Promise(resolve => setTimeout(resolve, SIMULATED_DELAY));
    
    // Check if email is already registered
    const existingUsers = localStorage.getItem("quiz_users");
    const users = existingUsers ? JSON.parse(existingUsers) : [];
    
    const existingUser = users.find((u: any) => u.email === email);
    if (existingUser) {
      throw new Error("Email already registered");
    }
    
    // Create new user
    const newUser: User = {
      id: crypto.randomUUID(),
      email,
      displayName: displayName || email.split('@')[0],
      createdAt: new Date().toISOString()
    };
    
    // In a real application, we would hash the password using bcrypt or Argon2
    // For this demo, we'll simulate password hashing with a simple prefix
    const hashedPassword = `hashed_${password}`;
    
    // Store user with hashed password
    users.push({ ...newUser, password: hashedPassword });
    localStorage.setItem("quiz_users", JSON.stringify(users));
    
    // Save user in localStorage and return
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    localStorage.setItem(AUTH_TOKEN_KEY, newUser.id); // Simple token
    
    return newUser;
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
};

/**
 * User login with security enhancements
 */
export const loginUser = async (email: string, password: string): Promise<User> => {
  try {
    // Add simulated API delay and rate limiting
    await new Promise(resolve => setTimeout(resolve, SIMULATED_DELAY));
    
    // Implement basic rate limiting
    const attempts = localStorage.getItem(`login_attempts_${email}`) || "0";
    const attemptCount = parseInt(attempts, 10);
    const lastAttemptTime = parseInt(localStorage.getItem(`last_attempt_${email}`) || "0", 10);
    const now = Date.now();
    
    // If more than 5 failed attempts within 15 minutes, block login
    if (attemptCount >= 5 && now - lastAttemptTime < 15 * 60 * 1000) {
      const minutesLeft = Math.ceil((15 * 60 * 1000 - (now - lastAttemptTime)) / 60000);
      throw new Error(`Too many login attempts. Please try again in ${minutesLeft} minutes.`);
    }
    
    // Get users from localStorage
    const existingUsers = localStorage.getItem("quiz_users");
    if (!existingUsers) {
      // Increment failed attempts
      localStorage.setItem(`login_attempts_${email}`, (attemptCount + 1).toString());
      localStorage.setItem(`last_attempt_${email}`, now.toString());
      throw new Error("Invalid credentials");
    }
    
    const users = JSON.parse(existingUsers);
    
    // In a real app, we would hash the password and compare hashes
    // For this demo, we'll use our simulated hashing
    const hashedPassword = `hashed_${password}`;
    
    // Find user with matching email and hashed password
    const user = users.find((u: any) => 
      u.email === email && (u.password === hashedPassword || u.password === password)
    );
    
    if (!user) {
      // Increment failed attempts
      localStorage.setItem(`login_attempts_${email}`, (attemptCount + 1).toString());
      localStorage.setItem(`last_attempt_${email}`, now.toString());
      throw new Error("Invalid credentials");
    }
    
    // Reset login attempts on successful login
    localStorage.removeItem(`login_attempts_${email}`);
    localStorage.removeItem(`last_attempt_${email}`);
    
    // Save user in localStorage
    const userData: User = {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      createdAt: user.createdAt
    };
    
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    localStorage.setItem(AUTH_TOKEN_KEY, userData.id); // Simple token
    
    return userData;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

/**
 * Send magic link to user email
 */
export const sendMagicLink = async (email: string): Promise<boolean> => {
  try {
    // Add simulated API delay
    await new Promise(resolve => setTimeout(resolve, SIMULATED_DELAY));
    
    // In a real app, this would send an actual email with a magic link
    // For this demo, we'll simulate it
    console.log(`Magic link sent to ${email}`);
    
    // Store the email for validation
    localStorage.setItem("magic_link_pending", email);
    
    return true;
  } catch (error) {
    console.error("Magic link error:", error);
    throw error;
  }
};

/**
 * Get current user
 */
export const getCurrentUser = (): User | null => {
  const userJson = localStorage.getItem(USER_KEY);
  if (!userJson) return null;
  
  try {
    return JSON.parse(userJson) as User;
  } catch (error) {
    console.error("Error parsing user data:", error);
    return null;
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return localStorage.getItem(AUTH_TOKEN_KEY) !== null;
};

/**
 * Logout user
 */
export const logoutUser = (): void => {
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(AUTH_TOKEN_KEY);
};

/**
 * Makes authenticated API requests with CSRF protection
 * @param url API endpoint
 * @param options Fetch options
 * @returns Response from the API
 */
export const authenticatedFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  if (!isAuthenticated()) {
    throw new Error("User not authenticated");
  }
  
  const authToken = localStorage.getItem(AUTH_TOKEN_KEY);
  const headers = new Headers(options.headers);
  
  // Add authentication token
  headers.set("Authorization", `Bearer ${authToken}`);
  
  // Add CSRF token
  const csrfHeaders = addCsrfToHeaders(headers);
  
  // Set content-type if not already set
  if (!headers.has("Content-Type") && options.method !== "GET") {
    headers.set("Content-Type", "application/json");
  }
  
  // Add additional security headers
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Frame-Options", "DENY");
  
  const updatedOptions = {
    ...options,
    headers: csrfHeaders,
  };
  
  return fetch(url, updatedOptions);
};
