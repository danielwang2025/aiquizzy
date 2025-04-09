
// Mock authentication service with minimal functionality
// All Supabase authentication has been removed

import { User } from "@/types/quiz";

// Return empty authentication state
export const sendPhoneOTP = async (phone?: string): Promise<void> => {
  console.warn("Authentication functionality has been removed");
};

export const sendEmailOTP = async (email?: string): Promise<void> => {
  console.warn("Authentication functionality has been removed");
};

export const verifyOTP = async (email?: string, otpCode?: string): Promise<User> => {
  console.warn("Authentication functionality has been removed");
  return {
    id: "",
    email: "",
    displayName: "Guest User",
    createdAt: new Date().toISOString()
  };
};

export const registerUser = async (email?: string, password?: string, displayName?: string): Promise<User> => {
  console.warn("Authentication functionality has been removed");
  return {
    id: "",
    email: "",
    displayName: "Guest User",
    createdAt: new Date().toISOString()
  };
};

export const loginUser = async (email?: string, password?: string): Promise<User> => {
  console.warn("Authentication functionality has been removed");
  return {
    id: "",
    email: "",
    displayName: "Guest User",
    createdAt: new Date().toISOString()
  };
};

export const getCurrentUser = async (): Promise<User | null> => {
  return null;
};

export const isAuthenticated = async (): Promise<boolean> => {
  return false;
};

export const logoutUser = async (): Promise<void> => {
  console.warn("Authentication functionality has been removed");
};

export const updateUserProfile = async (userData?: any): Promise<User> => {
  console.warn("Authentication functionality has been removed");
  return {
    id: "",
    email: "",
    displayName: "Guest User",
    createdAt: new Date().toISOString()
  };
};

export const requestPasswordReset = async (email?: string): Promise<void> => {
  console.warn("Authentication functionality has been removed");
};

export const updateUserPassword = async (password?: string): Promise<void> => {
  console.warn("Authentication functionality has been removed");
};
