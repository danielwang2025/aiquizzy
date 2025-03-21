
import { User } from "@/types/quiz";

// LocalStorage keys
const USER_KEY = "quiz_user";
const AUTH_TOKEN_KEY = "quiz_auth_token";

// Simple user registration
export const registerUser = async (email: string, password: string, displayName?: string): Promise<User> => {
  try {
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
    
    // Store password securely (in real app, this would be hashed and stored in a secure database)
    // For demo purposes, we're using localStorage
    users.push({ ...newUser, password });
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

// User login
export const loginUser = async (email: string, password: string): Promise<User> => {
  try {
    // Get users from localStorage
    const existingUsers = localStorage.getItem("quiz_users");
    if (!existingUsers) {
      throw new Error("Invalid credentials");
    }
    
    const users = JSON.parse(existingUsers);
    const user = users.find((u: any) => u.email === email && u.password === password);
    
    if (!user) {
      throw new Error("Invalid credentials");
    }
    
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

// Get current user
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

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return localStorage.getItem(AUTH_TOKEN_KEY) !== null;
};

// Logout
export const logoutUser = (): void => {
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(AUTH_TOKEN_KEY);
};
