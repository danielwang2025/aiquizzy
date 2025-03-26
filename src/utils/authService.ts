
import { supabase } from "@/integrations/supabase/client";
import { User, LearningPreferences } from "@/types/quiz";
import { v4 as uuidv4 } from "uuid";

// Local storage key for user data
const USER_STORAGE_KEY = "currentUser";

// Current user state
let currentUser: User | null = null;

// Parse JSON safely
const safeParseJson = (json: any, defaultValue: any = null): any => {
  if (!json) return defaultValue;
  try {
    return typeof json === 'string' ? JSON.parse(json) : json;
  } catch (e) {
    console.error("Error parsing JSON:", e);
    return defaultValue;
  }
};

// Initialize auth from local storage
export const initAuth = async (): Promise<void> => {
  try {
    // Check if we have a saved user in localStorage
    const savedUser = localStorage.getItem(USER_STORAGE_KEY);
    if (savedUser) {
      currentUser = JSON.parse(savedUser);
    }
    
    // Check if we have a Supabase session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
      // Get user data from Supabase
      const { data: userData, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", session.user.id)
        .single();
        
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      if (userData) {
        currentUser = {
          id: userData.id,
          email: userData.email,
          displayName: userData.display_name || session.user.email?.split('@')[0] || undefined,
          createdAt: userData.created_at || new Date().toISOString(),
          learningPreferences: safeParseJson(userData.learning_preferences) as LearningPreferences
        };
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(currentUser));
      } else if (session.user.email) {
        // Create user record if it doesn't exist
        const newUser: User = {
          id: session.user.id,
          email: session.user.email,
          displayName: session.user.email.split('@')[0],
          createdAt: new Date().toISOString()
        };
        
        const { error: insertError } = await supabase
          .from("users")
          .insert({
            id: newUser.id,
            email: newUser.email,
            display_name: newUser.displayName
          });
          
        if (insertError) {
          console.error("Error creating user record:", insertError);
        } else {
          currentUser = newUser;
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(currentUser));
        }
      }
    }
  } catch (error) {
    console.error("Error initializing auth:", error);
  }
};

// Register a new user
export const register = async (email: string, password: string, displayName?: string): Promise<User> => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });
    
    if (error) throw error;
    
    if (!data.user) {
      throw new Error("Failed to create user");
    }
    
    // Create user profile
    const user: User = {
      id: data.user.id,
      email: data.user.email || email,
      displayName: displayName || email.split('@')[0],
      createdAt: new Date().toISOString()
    };
    
    // Store in Supabase
    const { error: insertError } = await supabase
      .from("users")
      .insert({
        id: user.id,
        email: user.email,
        display_name: user.displayName
      });
      
    if (insertError) {
      console.error("Error creating user profile:", insertError);
    }
    
    // Store locally
    currentUser = user;
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    
    return user;
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
};

// Login user
export const login = async (email: string, password: string): Promise<User> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    
    if (!data.user) {
      throw new Error("Failed to login");
    }
    
    // Get user profile data
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", data.user.id)
      .single();
      
    if (userError && userError.code !== 'PGRST116') {
      console.error("Error fetching user profile:", userError);
      // Create profile if it doesn't exist
      const user: User = {
        id: data.user.id,
        email: data.user.email || email,
        displayName: email.split('@')[0],
        createdAt: new Date().toISOString()
      };
      
      await supabase
        .from("users")
        .insert({
          id: user.id,
          email: user.email,
          display_name: user.displayName
        });
        
      currentUser = user;
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      
      return user;
    }
    
    if (userData) {
      const user: User = {
        id: userData.id,
        email: userData.email,
        displayName: userData.display_name || data.user.email?.split('@')[0],
        createdAt: userData.created_at || new Date().toISOString(),
        learningPreferences: safeParseJson(userData.learning_preferences)
      };
      
      currentUser = user;
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      
      return user;
    }
    
    throw new Error("Failed to get user data");
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

// Logout user
export const logout = async (): Promise<void> => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    // Clear local user data
    currentUser = null;
    localStorage.removeItem(USER_STORAGE_KEY);
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
};

// Update user profile
export const updateUserProfile = async (updates: Partial<User>): Promise<User> => {
  try {
    if (!currentUser) {
      throw new Error("No user logged in");
    }
    
    const { error } = await supabase
      .from("users")
      .update({
        display_name: updates.displayName,
        learning_preferences: updates.learningPreferences
      })
      .eq("id", currentUser.id);
      
    if (error) throw error;
    
    // Update local user data
    currentUser = { ...currentUser, ...updates };
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(currentUser));
    
    return currentUser;
  } catch (error) {
    console.error("Update profile error:", error);
    throw error;
  }
};

// Get current user
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    // If we have a current user, return it
    if (currentUser) {
      return currentUser;
    }
    
    // Try to get from Supabase session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
      // Fetch user data from database
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", session.user.id)
        .single();
        
      if (error && error.code !== 'PGRST116') {
        console.error("Error fetching user profile:", error);
        return null;
      }
      
      if (data) {
        currentUser = {
          id: data.id,
          email: data.email,
          displayName: data.display_name || session.user.email?.split('@')[0],
          createdAt: data.created_at,
          learningPreferences: safeParseJson(data.learning_preferences)
        };
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(currentUser));
        return currentUser;
      }
    }
    
    // Try to get from localStorage
    const savedUser = localStorage.getItem(USER_STORAGE_KEY);
    if (savedUser) {
      currentUser = JSON.parse(savedUser);
      return currentUser;
    }
    
    return null;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!currentUser || !!localStorage.getItem(USER_STORAGE_KEY);
};

// Reset password
export const resetPassword = async (email: string): Promise<void> => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  } catch (error) {
    console.error("Reset password error:", error);
    throw error;
  }
};

// Initialize auth on module import
initAuth().catch(console.error);
