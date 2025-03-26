
import { supabase } from './supabaseClient';
import { User } from '@/types/quiz';

// Register a new user
export const registerUser = async (email: string, password: string, displayName?: string): Promise<{ user: User | null; error: string | null }> => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return { user: null, error: error.message };
    }

    if (data.user) {
      // Create a user entry in the users table
      const { error: profileError } = await supabase
        .from('users')
        .insert([
          {
            id: data.user.id,
            email: data.user.email,
            display_name: displayName || email.split('@')[0],
            created_at: new Date().toISOString(),
          },
        ]);

      if (profileError) {
        return { user: null, error: profileError.message };
      }

      const user: User = {
        id: data.user.id,
        email: data.user.email || '',
        displayName: displayName || email.split('@')[0],
        createdAt: new Date().toISOString(),
      };

      return { user, error: null };
    }

    return { user: null, error: 'User registration failed' };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
};

// Log in a user
export const loginUser = async (email: string, password: string): Promise<{ user: User | null; error: string | null }> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { user: null, error: error.message };
    }

    if (data.user) {
      // Get user profile data from the users table
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        return { user: null, error: profileError.message };
      }

      const user: User = {
        id: data.user.id,
        email: data.user.email || '',
        displayName: profileData?.display_name || email.split('@')[0],
        createdAt: profileData?.created_at || new Date().toISOString(),
      };

      return { user, error: null };
    }

    return { user: null, error: 'Login failed' };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
};

// Get the current logged-in user
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      return null;
    }

    // Get user profile data from the users table
    const { data: profileData } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    return {
      id: data.user.id,
      email: data.user.email || '',
      displayName: profileData?.display_name || data.user.email?.split('@')[0] || '',
      createdAt: profileData?.created_at || new Date().toISOString(),
    };
  } catch (error) {
    return null;
  }
};

// Add a synchronous version that checks the session first - for use in historyService
export const getCurrentUserSync = (): User | null => {
  const session = supabase.auth.getSession();
  if (!session) {
    return null;
  }
  
  return {
    id: 'anonymous', // Default ID for when we don't have full user data yet
    email: 'anonymous',
    displayName: 'Anonymous User',
    createdAt: new Date().toISOString(),
  };
};

// Log out the current user
export const logoutUser = async (): Promise<{ error: string | null }> => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      return { error: error.message };
    }
    
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

// Reset password
export const resetPassword = async (email: string): Promise<{ error: string | null }> => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/reset-password',
    });
    
    if (error) {
      return { error: error.message };
    }
    
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

// Update user details
export const updateUserProfile = async (userId: string, updates: { displayName?: string }): Promise<{ error: string | null }> => {
  try {
    const { error } = await supabase
      .from('users')
      .update({
        display_name: updates.displayName,
      })
      .eq('id', userId);
    
    if (error) {
      return { error: error.message };
    }
    
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};
