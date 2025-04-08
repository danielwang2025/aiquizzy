
import React, { useState, useEffect } from "react";
import { isAuthenticated, getCurrentUser, logoutUser } from "@/utils/authService";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { User, LogOut, UserCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { User as UserType } from "@/types/quiz";
import { motion } from "framer-motion";

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
    return (
      <Button variant="ghost" size="sm" disabled className="animate-pulse">
        <UserCircle className="h-5 w-5 mr-2 opacity-70" />
        <span className="opacity-70">Loading...</span>
      </Button>
    );
  }
  
  return (
    <div>
      {isAuth ? (
        <motion.div 
          className="flex items-center gap-2"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <div className="text-sm hidden sm:block">
            <span className="font-medium bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-400">
              {currentUser?.displayName || currentUser?.email?.split('@')[0]}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="glass-effect border-white/20"
          >
            <LogOut className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </motion.div>
      ) : (
        <Sheet open={showAuthSheet} onOpenChange={setShowAuthSheet}>
          <SheetTrigger asChild>
            <Button 
              variant="outline" 
              size="sm"
              className="glass-effect border-white/20 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <User className="h-4 w-4 mr-2" />
              Login / Register
            </Button>
          </SheetTrigger>
          <SheetContent className="glass-effect border-l border-white/20">
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
