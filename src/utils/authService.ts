
import { User } from "@/types/quiz";
import { addCsrfToHeaders, validateStrongPassword } from "./securityUtils";
import { supabase } from "@/integrations/supabase/client";

// LocalStorage keys
const USER_KEY = "quiz_user";
const AUTH_TOKEN_KEY = "quiz_auth_token";

// Simulated API delay for authentication operations
const SIMULATED_DELAY = 800;

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
    
    // Add simulated API delay
    await new Promise(resolve => setTimeout(resolve, SIMULATED_DELAY));
    
    // Register user with Supabase
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
    
    if (!data.user) {
      throw new Error("Failed to create user account");
    }
    
    // Create user in our users table
    const { error: insertError } = await supabase.from('users').insert({
      id: data.user.id,
      email: email,
      display_name: displayName || email.split('@')[0],
      password_hash: `hashed_${password}` // This is just a placeholder, the real hash is in Supabase Auth
    });
    
    if (insertError) {
      console.error("Error creating user profile:", insertError);
      // We'll continue anyway since the auth user was created
    }
    
    const newUser: User = {
      id: data.user.id,
      email,
      displayName: displayName || email.split('@')[0],
      createdAt: new Date().toISOString()
    };
    
    // Save user in localStorage for backwards compatibility
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    
    return newUser;
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
    // Add simulated API delay
    await new Promise(resolve => setTimeout(resolve, SIMULATED_DELAY));
    
    // Login with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    
    if (!data.user) {
      throw new Error("Invalid credentials");
    }
    
    // Get user data from our users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();
    
    if (userError && userError.code !== 'PGRST116') { // PGRST116 is "no rows returned" which we can ignore
      console.error("Error fetching user data:", userError);
    }
    
    // Create user object from Supabase data
    const user: User = {
      id: data.user.id,
      email: data.user.email || email,
      displayName: userData?.display_name || data.user.user_metadata?.display_name || email.split('@')[0],
      createdAt: data.user.created_at || new Date().toISOString(),
      learningPreferences: userData?.learning_preferences
    };
    
    // Save user in localStorage for backwards compatibility
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    localStorage.setItem(AUTH_TOKEN_KEY, data.session.access_token); // For backwards compatibility
    
    return user;
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
    
    // Send magic link with Supabase
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin
      }
    });
    
    if (error) throw error;
    
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
  try {
    // First check if we have a user in Supabase
    const { data } = supabase.auth.getSession();
    if (data.session?.user) {
      // Return user from Supabase session
      return {
        id: data.session.user.id,
        email: data.session.user.email || "",
        displayName: data.session.user.user_metadata?.display_name || data.session.user.email?.split('@')[0] || "",
        createdAt: data.session.user.created_at || new Date().toISOString()
      };
    }
    
    // Fallback to localStorage for backwards compatibility
    const userJson = localStorage.getItem(USER_KEY);
    if (!userJson) return null;
    
    return JSON.parse(userJson) as User;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  // Check Supabase session first
  const { data } = supabase.auth.getSession();
  if (data.session) return true;
  
  // Fallback to localStorage for backwards compatibility
  return localStorage.getItem(AUTH_TOKEN_KEY) !== null;
};

/**
 * Logout user
 */
export const logoutUser = async (): Promise<void> => {
  try {
    // Sign out from Supabase
    await supabase.auth.signOut();
    
    // Clear localStorage for backwards compatibility
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(AUTH_TOKEN_KEY);
  } catch (error) {
    console.error("Logout error:", error);
    
    // Even if Supabase logout fails, clear local storage
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(AUTH_TOKEN_KEY);
  }
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
  
  const session = supabase.auth.getSession();
  const headers = new Headers(options.headers);
  
  // Add authentication token
  const authToken = localStorage.getItem(AUTH_TOKEN_KEY) || session.data?.session?.access_token;
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
