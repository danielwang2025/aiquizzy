
import { supabase } from "@/integrations/supabase/client";
import { User, Profile } from "@/types/supabase";
import { toast } from "sonner";

// Get the user profile from Supabase
export const getProfile = async (userId: string): Promise<Profile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error("Error fetching profile:", error);
    return null;
  }
};

// Update user profile
export const updateProfile = async (
  userId: string, 
  updates: Partial<Profile>
): Promise<Profile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error("Error updating profile:", error);
    return null;
  }
};

// Register a new user
export const registerUser = async (
  email: string, 
  password: string, 
  displayName?: string
): Promise<{ user: User | null; error: string | null }> => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName
        }
      }
    });
    
    if (error) throw error;
    
    return { 
      user: data.user as User, 
      error: null 
    };
  } catch (error) {
    console.error("Registration error:", error);
    return { 
      user: null, 
      error: error instanceof Error ? error.message : "Registration failed" 
    };
  }
};

// Login a user
export const loginUser = async (
  email: string, 
  password: string
): Promise<{ user: User | null; error: string | null }> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    
    return { 
      user: data.user as User, 
      error: null 
    };
  } catch (error) {
    console.error("Login error:", error);
    return { 
      user: null, 
      error: error instanceof Error ? error.message : "Login failed" 
    };
  }
};

// Get current user
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const { data } = await supabase.auth.getUser();
    return data?.user as User || null;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
};

// Check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  const user = await getCurrentUser();
  return !!user;
};

// Logout user
export const logoutUser = async (): Promise<void> => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    console.error("Logout error:", error);
    toast.error("Logout failed");
  }
};
