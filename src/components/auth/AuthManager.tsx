
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthState, initialAuthState, getCurrentUser } from "@/utils/authService";

// Create Auth Context
const AuthContext = createContext<{
  authState: AuthState;
  refreshUser: () => Promise<void>;
}>({
  authState: initialAuthState,
  refreshUser: async () => {},
});

// Export hook for using auth context
export const useAuth = () => useContext(AuthContext);

// Auth Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>(initialAuthState);

  const refreshUser = async () => {
    try {
      const user = await getCurrentUser();
      
      setAuthState({
        user,
        isAuthenticated: !!user,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error("Error refreshing user:", error);
      setAuthState({
        ...authState,
        isLoading: false,
        error: "Failed to load user data",
      });
    }
  };

  useEffect(() => {
    // Initial auth state setup
    const initializeAuth = async () => {
      try {
        // Get current user and profile
        await refreshUser();
        
        // Set up auth state listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log("Auth state changed:", event);
            
            if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
              await refreshUser();
            } else if (event === "SIGNED_OUT") {
              setAuthState({
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: null,
              });
            }
          }
        );

        // Clean up subscription on unmount
        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error("Error initializing auth:", error);
        setAuthState({
          ...authState,
          isLoading: false,
          error: "Failed to initialize authentication",
        });
      }
    };

    initializeAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ authState, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
