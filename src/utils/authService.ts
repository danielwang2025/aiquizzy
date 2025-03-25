
import { supabase } from "@/integrations/supabase/client";
import { UserWithProfile, Profile } from "@/types/supabase";
import { toast } from "sonner";

// Auth state type
export interface AuthState {
  user: UserWithProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Initialize auth state
export const initialAuthState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Sign up with email and password
export const signUp = async (email: string, password: string, displayName?: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: displayName || email.split('@')[0],
        },
      },
    });

    if (error) throw error;
    
    toast.success("Registration successful! Please check your email for verification.");
    return { success: true, data };
  } catch (error: any) {
    console.error("Error during sign up:", error);
    toast.error(error.message || "Failed to sign up");
    return { success: false, error };
  }
};

// Sign in with email and password
export const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    
    toast.success("Login successful!");
    return { success: true, data };
  } catch (error: any) {
    console.error("Error during sign in:", error);
    toast.error(error.message || "Failed to sign in");
    return { success: false, error };
  }
};

// Sign out
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    toast.success("You have been logged out");
    return { success: true };
  } catch (error: any) {
    console.error("Error during sign out:", error);
    toast.error(error.message || "Failed to sign out");
    return { success: false, error };
  }
};

// Get current session
export const getCurrentSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return { session, error: null };
  } catch (error: any) {
    console.error("Error getting session:", error);
    return { session: null, error };
  }
};

// Get user profile data
export const getUserProfile = async (userId: string): Promise<Profile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
};

// Update user profile
export const updateProfile = async (userId: string, updates: Partial<Profile>) => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);
    
    if (error) throw error;
    
    toast.success("Profile updated successfully");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating profile:", error);
    toast.error(error.message || "Failed to update profile");
    return { success: false, error };
  }
};

// Get current user with profile
export const getCurrentUser = async (): Promise<UserWithProfile | null> => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) return null;
    
    const profile = await getUserProfile(user.id);
    
    return {
      id: user.id,
      email: user.email,
      profile
    };
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
};
