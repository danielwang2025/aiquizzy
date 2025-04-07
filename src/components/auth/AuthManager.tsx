import React, { useState, useEffect } from "react";
import { isAuthenticated, getCurrentUser, logoutUser } from "@/utils/authService";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { User, LogOut } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { User as UserType } from "@/types/quiz";

const AuthManager: React.FC = () => {
  const [isAuth, setIsAuth] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [showRegister, setShowRegister] = useState(false);
  const [showAuthSheet, setShowAuthSheet] = useState(false);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          setIsAuth(true);
          const user = await getCurrentUser();
          if (user) {
            setCurrentUser(user);
            // Also save to localStorage for historyService to use
            localStorage.setItem('current_user', JSON.stringify(user));
          }
        } else {
          setIsAuth(false);
          setCurrentUser(null);
          localStorage.removeItem('current_user');
        }
      }
    );

    // Initial check of auth status
    const checkAuth = async () => {
      try {
        setLoading(true);
        const isAuthResult = await isAuthenticated();
        setIsAuth(isAuthResult);
        
        if (isAuthResult) {
          const user = await getCurrentUser();
          if (user) {
            setCurrentUser(user);
            // Also save to localStorage for historyService to use
            localStorage.setItem('current_user', JSON.stringify(user));
          }
        }
      } catch (error) {
        console.error("Failed to check authentication status:", error);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
    
    // Clean up subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  const handleAuthSuccess = () => {
    setShowAuthSheet(false);
    // Reset to login view
    setShowRegister(false);
    // Auth state will be updated via onAuthStateChange
  };
  
  const handleLogout = async () => {
    try {
      await logoutUser();
      toast.success("Successfully logged out");
      localStorage.removeItem('current_user');
      // Auth state will be updated via onAuthStateChange
    } catch (error) {
      toast.error("Logout failed");
      console.error("Logout error:", error);
    }
  };
  
  const toggleRegisterLogin = () => {
    setShowRegister(!showRegister);
  };
  
  if (loading) {
    return <div className="flex items-center gap-2 opacity-50">Loading...</div>;
  }
  
  return (
    <div>
      {isAuth ? (
        <div className="flex items-center gap-2">
          <div className="text-sm">
            <span className="font-medium">{currentUser?.displayName || currentUser?.email}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      ) : (
        <Sheet open={showAuthSheet} onOpenChange={setShowAuthSheet}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm">
              <User className="h-4 w-4 mr-2" />
              Login / Register
            </Button>
          </SheetTrigger>
          <SheetContent>
            {showRegister ? (
              <RegisterForm
                onSuccess={handleAuthSuccess}
                onLoginClick={toggleRegisterLogin}
              />
            ) : (
              <LoginForm
                onSuccess={handleAuthSuccess}
                onRegisterClick={toggleRegisterLogin}
              />
            )}
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
};

export default AuthManager;
