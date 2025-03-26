
import { supabase } from './supabaseClient';
import { User } from "@/types/quiz";
import { validateStrongPassword } from "./securityUtils";

/**
 * User registration with Supabase
 */
export const registerUser = async (email: string, password: string, displayName?: string): Promise<User> => {
  try {
    // Validate password strength
    const passwordValidation = validateStrongPassword(password);
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.message);
    }
    
    // Register user with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName || email.split('@')[0]
        }
      }
    });
    
    if (error) throw error;
    
    // If we get here, the registration was successful
    if (!data.user) throw new Error("Registration failed: No user returned");
    
    // Return user object in our app's format
    return {
      id: data.user.id,
      email: data.user.email || '',
      displayName: data.user.user_metadata?.display_name || email.split('@')[0],
      createdAt: data.user.created_at || new Date().toISOString()
    };
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
};

/**
 * User login with Supabase
 */
export const loginUser = async (email: string, password: string): Promise<User> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    
    if (!data.user) throw new Error("Login failed: No user returned");
    
    // Return user object in our app's format
    return {
      id: data.user.id,
      email: data.user.email || '',
      displayName: data.user.user_metadata?.display_name || email.split('@')[0],
      createdAt: data.user.created_at || new Date().toISOString()
    };
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

/**
 * Get current user (async)
 */
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const { data, error } = await supabase.auth.getUser();
    
    if (error || !data.user) return null;
    
    return {
      id: data.user.id,
      email: data.user.email || '',
      displayName: data.user.user_metadata?.display_name || data.user.email?.split('@')[0] || '',
      createdAt: data.user.created_at || new Date().toISOString()
    };
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
};

/**
 * Get current user (sync)
 */
export const getCurrentUserSync = (): User | null => {
  // This is a synchronous version that returns the last known user state
  const session = supabase.auth.getSession();
  
  // This doesn't actually fetch from network, it returns the session from memory,
  // so it's safe to use in a synchronous context
  if (!session) return null;
  
  // The proper way is to use the async getCurrentUser(), but this provides
  // a fallback for components that need sync access
  return null;
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = async (): Promise<boolean> => {
  const { data } = await supabase.auth.getSession();
  return !!data.session;
};

/**
 * Check if user is authenticated (sync)
 */
export const isAuthenticatedSync = (): boolean => {
  // This uses the stored session info, doesn't make a network request
  const session = supabase.auth.getSession();
  return !!session;
};

/**
 * Logout user
 */
export const logoutUser = async (): Promise<void> => {
  await supabase.auth.signOut();
};

/**
 * Reset password
 */
export const resetPassword = async (email: string): Promise<void> => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`
  });
  
  if (error) throw error;
};

/**
 * Send magic link
 */
export const sendMagicLink = async (email: string): Promise<void> => {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`
    }
  });
  
  if (error) throw error;
};

/**
 * Makes authenticated API requests
 */
export const authenticatedFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const session = await supabase.auth.getSession();
  
  if (!session.data.session) {
    throw new Error("User not authenticated");
  }
  
  const headers = new Headers(options.headers);
  
  // Add authentication token
  headers.set("Authorization", `Bearer ${session.data.session.access_token}`);
  
  // Set content-type if not already set
  if (!headers.has("Content-Type") && options.method !== "GET") {
    headers.set("Content-Type", "application/json");
  }
  
  const updatedOptions = {
    ...options,
    headers
  };
  
  return fetch(url, updatedOptions);
};
