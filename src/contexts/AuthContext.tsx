
import React, { createContext, useState, useEffect, useContext } from "react";
import { User } from "@/types/quiz";
import { getCurrentUser, logoutUser } from "@/utils/authService";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<User | null>;  // Updated return type to match implementation
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Refresh user data function that can be used throughout the app
  const refreshUser = async () => {
    try {
      const userData = await getCurrentUser();
      setUser(userData);
      return userData;
    } catch (error) {
      console.error("Error refreshing user:", error);
      return null;
    }
  };
  
  // Logout function that can be called from anywhere
  const logout = async () => {
    try {
      setIsLoading(true);
      await logoutUser();
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Failed to log out, please try again");
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    // Set up Supabase auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session ? "User logged in" : "User logged out");
      
      if (event === 'SIGNED_IN' && session?.user) {
        // Use setTimeout to avoid potential deadlocks with Supabase client
        setTimeout(async () => {
          try {
            const userData = await getCurrentUser();
            console.log("onAuthStateChange - Current user data:", userData);
            setUser(userData);
            toast.success("Login successful");
          } catch (error) {
            console.error("Error fetching user after sign in:", error);
            toast.error("Failed to get user information");
          }
        }, 0);
      } else if (event === 'SIGNED_OUT') {
        console.log("User signed out, clearing user state");
        setUser(null);
        toast.success("Logged out successfully");
      } else if (event === 'PASSWORD_RECOVERY') {
        toast.info("Please follow the email instructions to reset your password");
      } else if (event === 'USER_UPDATED') {
        toast.success("User information updated");
        setTimeout(async () => {
          try {
            const userData = await getCurrentUser();
            setUser(userData);
          } catch (error) {
            console.error("Error fetching updated user:", error);
          }
        }, 0);
      }
      
      // Handle magic link email sent event through custom toast notification
      if (event && event.toString().includes('MAGIC_LINK_EMAIL_SENT')) {
        toast.success("Magic link has been sent to your email, please check");
      }
    });
    
    // Check for current session on mount or route change
    const checkSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          console.log("Existing session found");
          const userData = await getCurrentUser();
          setUser(userData);
        } else {
          console.log("No active session found");
          setUser(null);
        }
      } catch (error) {
        console.error("Session check failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
    
    // Clean up subscription when component unmounts
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    logout,
    refreshUser,
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
