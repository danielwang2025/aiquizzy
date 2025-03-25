
// This is a placeholder implementation for auth service functions
// In a real application, you would integrate with an auth provider like Firebase, Auth0, etc.

import { User } from "@/types/quiz";

// Mock user data
const MOCK_USERS = [
  {
    id: "user1",
    email: "demo@example.com",
    displayName: "Demo User",
    createdAt: "2023-01-01T00:00:00Z",
  },
];

const AUTH_STORAGE_KEY = "quiz_app_auth";

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  const authData = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!authData) return false;
  
  try {
    const { token, expiry } = JSON.parse(authData);
    return !!token && new Date(expiry) > new Date();
  } catch (error) {
    return false;
  }
};

// Get current user
export const getCurrentUser = (): User | null => {
  if (!isAuthenticated()) return null;
  
  const userJson = localStorage.getItem("quiz_app_user");
  if (!userJson) return null;
  
  try {
    return JSON.parse(userJson);
  } catch (error) {
    return null;
  }
};

// Alias functions to match the expected imports
export const loginUser = login;
export const registerUser = register;
export const logoutUser = logout;

// Mock login function
export const login = (email: string, password: string): Promise<User> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = MOCK_USERS.find((u) => u.email === email);
      
      if (user && password === "password") {
        // Set auth data
        const expiryDate = new Date();
        expiryDate.setHours(expiryDate.getHours() + 24); // Token valid for 24 hours
        
        const authData = {
          token: "mock-jwt-token-" + Date.now(),
          expiry: expiryDate.toISOString(),
        };
        
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
        localStorage.setItem("quiz_app_user", JSON.stringify(user));
        
        resolve(user);
      } else {
        reject(new Error("Invalid credentials"));
      }
    }, 800); // Simulate network delay
  });
};

// Mock register function
export const register = (email: string, password: string, displayName: string): Promise<User> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const existingUser = MOCK_USERS.find((u) => u.email === email);
      
      if (existingUser) {
        reject(new Error("User already exists"));
        return;
      }
      
      const newUser = {
        id: "user" + Date.now().toString(),
        email,
        displayName,
        createdAt: new Date().toISOString(),
      };
      
      // In a real app, you would save this to a database
      // For demo, we'll just pretend it worked
      
      // Set auth data
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 24); // Token valid for 24 hours
      
      const authData = {
        token: "mock-jwt-token-" + Date.now(),
        expiry: expiryDate.toISOString(),
      };
      
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
      localStorage.setItem("quiz_app_user", JSON.stringify(newUser));
      
      resolve(newUser);
    }, 800); // Simulate network delay
  });
};

// Logout function
export const logout = (): void => {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem("quiz_app_user");
};

// Update user profile
export const updateUserProfile = (updates: Partial<User>): Promise<User> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const currentUser = getCurrentUser();
      
      if (!currentUser) {
        reject(new Error("Not authenticated"));
        return;
      }
      
      const updatedUser = { ...currentUser, ...updates };
      
      localStorage.setItem("quiz_app_user", JSON.stringify(updatedUser));
      
      resolve(updatedUser);
    }, 500);
  });
};
