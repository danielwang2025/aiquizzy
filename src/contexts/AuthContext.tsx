
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@/types/quiz';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  sendMagicLink: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get the initial session
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        setUser({
          id: data.session.user.id,
          email: data.session.user.email || '',
          displayName: data.session.user.user_metadata?.display_name || data.session.user.email?.split('@')[0] || '',
          createdAt: data.session.user.created_at || new Date().toISOString()
        });
      }
      setLoading(false);
    });

    // Set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            displayName: session.user.user_metadata?.display_name || session.user.email?.split('@')[0] || '',
            createdAt: session.user.created_at || new Date().toISOString()
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) throw error;
      
      toast.success('Logged in successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, displayName?: string) => {
    try {
      setLoading(true);
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
      
      // Create user in our users table
      if (data.user) {
        const { error: insertError } = await supabase.from('users').insert({
          id: data.user.id,
          email: email,
          display_name: displayName || email.split('@')[0],
          password_hash: 'hashed_in_supabase' // Just a placeholder
        });
        
        if (insertError) {
          console.error("Error creating user profile:", insertError);
        }
      }
      
      toast.success('Signed up successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign up');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success('Logged out successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign out');
    } finally {
      setLoading(false);
    }
  };

  const sendMagicLink = async (email: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin
        }
      });
      
      if (error) throw error;
      
      toast.success('Magic link sent to your email');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send magic link');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, sendMagicLink }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
