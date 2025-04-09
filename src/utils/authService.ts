
// Mock authentication service with minimal functionality
// All Supabase authentication has been removed

import { User } from "@/types/quiz";

// Return empty authentication state
export const sendPhoneOTP = async (): Promise<void> => {
  console.warn("Authentication functionality has been removed");
};

export const sendEmailOTP = async (): Promise<void> => {
  console.warn("Authentication functionality has been removed");
};

export const verifyOTP = async (): Promise<User> => {
  console.warn("Authentication functionality has been removed");
  return {
    id: "",
    email: "",
    displayName: "Guest User",
    createdAt: new Date().toISOString()
  };
};

export const registerUser = async (): Promise<User> => {
  console.warn("Authentication functionality has been removed");
  return {
    id: "",
    email: "",
    displayName: "Guest User",
    createdAt: new Date().toISOString()
  };
};

export const loginUser = async (): Promise<User> => {
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

export const updateUserProfile = async (): Promise<User> => {
  console.warn("Authentication functionality has been removed");
  return {
    id: "",
    email: "",
    displayName: "Guest User",
    createdAt: new Date().toISOString()
  };
};

export const requestPasswordReset = async (): Promise<void> => {
  console.warn("Authentication functionality has been removed");
};

export const updateUserPassword = async (): Promise<void> => {
  console.warn("Authentication functionality has been removed");
};
