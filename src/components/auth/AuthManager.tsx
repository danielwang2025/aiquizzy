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
import LoadingSpinner from "@/components/LoadingSpinner";
import { useNavigate } from "react-router-dom";

const AuthManager: React.FC = () => {
  const [isAuth, setIsAuth] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [showRegister, setShowRegister] = useState(false);
  const [showAuthSheet, setShowAuthSheet] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Set up authentication state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setLoading(true);
        try {
          if (session) {
            setIsAuth(true);
            const user = await getCurrentUser();
            if (user) {
              setCurrentUser(user);
              localStorage.setItem('current_user', JSON.stringify(user));
            }
          } else {
            setIsAuth(false);
            setCurrentUser(null);
            localStorage.removeItem('current_user');
          }
        } catch (error) {
          console.error("Auth state change error:", error);
        } finally {
          setLoading(false);
        }
      }
    );

    // Initial authentication status check
    const checkAuth = async () => {
      try {
        const isAuthResult = await isAuthenticated();
        setIsAuth(isAuthResult);
        
        if (isAuthResult) {
          const user = await getCurrentUser();
          if (user) {
            setCurrentUser(user);
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
    setShowRegister(false);
    toast.success("Login successful");
  };
  
  const handleLogout = async () => {
    try {
      setLoading(true);
      await logoutUser();
      toast.success("Logged out successfully");
      localStorage.removeItem('current_user');
    } catch (error) {
      toast.error("Logout failed");
      console.error("Logout error:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const toggleRegisterLogin = () => {
    setShowRegister(!showRegister);
  };

  const handleProfileClick = () => {
    navigate("/profile");
  };
  
  // Show loading state, but ensure button is visible
  if (loading) {
    return (
      <Button variant="outline" size="sm" className="flex items-center glass-effect border-white/20 shadow-sm">
        <LoadingSpinner size="sm" className="mr-2" />
        <span>Loading...</span>
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
            onClick={handleProfileClick}
            className="glass-effect border-white/20 mr-2"
          >
            <UserCircle className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Profile</span>
          </Button>
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
              className="glass-effect border-white/20 shadow-sm hover:shadow-md transition-all duration-300 flex items-center"
            >
              <User className="h-4 w-4 mr-2" />
              <span>Login / Register</span>
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
