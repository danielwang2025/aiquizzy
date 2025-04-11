
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { User, UserPlus, LogOut } from "lucide-react";
import { getCurrentUser, logoutUser } from "@/utils/authService";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import { Link, useNavigate } from "react-router-dom";
import { User as UserType } from "@/types/quiz";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";

const AuthManager: React.FC = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLoginView, setIsLoginView] = useState(true);
  const [user, setUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const navigate = useNavigate();
  
  // Handle initial auth state check and subscription
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    
    // Set up Supabase auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session ? "User logged in" : "User logged out");
      
      if (!isMounted) return;
      
      if (event === 'SIGNED_IN' && session?.user) {
        // For sign in event, fetch the user data
        getCurrentUser()
          .then(userData => {
            if (!isMounted) return;
            setUser(userData);
            toast.success("Login successful");
            setIsAuthModalOpen(false);
          })
          .catch(error => {
            console.error("Error fetching user after sign in:", error);
            if (isMounted) toast.error("Failed to get user information");
          });
      } 
      else if (event === 'SIGNED_OUT') {
        if (isMounted) {
          setUser(null);
          toast.success("Logged out successfully");
        }
      } 
      else if (event === 'PASSWORD_RECOVERY') {
        if (isMounted) toast.info("Please follow the email instructions to reset your password");
      } 
      else if (event === 'USER_UPDATED') {
        if (isMounted) {
          getCurrentUser()
            .then(userData => {
              if (!isMounted) return;
              setUser(userData);
              toast.success("User information updated");
            })
            .catch(error => console.error("Error fetching updated user:", error));
        }
      }
      
      // Handle magic link email sent event
      if (event && event.toString().includes('MAGIC_LINK_EMAIL_SENT') && isMounted) {
        toast.success("Magic link has been sent to your email, please check");
      }
    });
    
    // Check for existing session
    const checkSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session && isMounted) {
          console.log("Existing session found");
          const userData = await getCurrentUser();
          if (isMounted) setUser(userData);
        } else {
          console.log("No active session found");
          if (isMounted) setUser(null);
        }
      } catch (error) {
        console.error("Session check failed:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
          setInitialLoadComplete(true);
        }
      }
    };

    checkSession();
    
    // Clean up subscription and prevent state updates after unmount
    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);
  
  const handleLoginClick = () => {
    setIsLoginView(true);
    setIsAuthModalOpen(true);
  };
  
  const handleAuthSuccess = () => {
    console.log("Authentication successful, closing modal");
    setIsAuthModalOpen(false);
  };
  
  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await logoutUser();
      // State will be updated by the auth listener
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Failed to log out, please try again");
      setIsLoading(false);
    }
  };
  
  // Show loading indicator only during initial load
  if (!initialLoadComplete) {
    return (
      <Button 
        variant="outline" 
        size="sm"
        className="glass-effect border-white/20 shadow-sm transition-all duration-300"
      >
        <span className="flex items-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading...
        </span>
      </Button>
    );
  }
  
  if (user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm"
            className="glass-effect border-white/20 shadow-sm hover:shadow-md transition-all duration-300 flex items-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading...
              </span>
            ) : (
              <>
                <Avatar className="h-6 w-6 mr-2">
                  <AvatarFallback className="text-xs bg-primary/20">
                    {user.displayName?.substring(0, 2).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="max-w-[100px] truncate">{user.displayName || user.email?.split('@')[0]}</span>
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 animate-fade-in">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to="/profile" className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleLogout} disabled={isLoading}>
            {isLoading ? (
              <>
                <svg className="animate-spin mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Logging out...
              </>
            ) : (
              <>
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </>
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
  
  return (
    <div>
      <Button 
        variant="outline" 
        size="sm"
        className="glass-effect border-white/20 shadow-sm hover:shadow-md transition-all duration-300 flex items-center"
        onClick={handleLoginClick}
        aria-label="Login / Register"
      >
        <User className="h-4 w-4 mr-2" />
        <span>Login / Register</span>
      </Button>
      
      <Dialog open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen}>
        <DialogContent className="sm:max-w-md animate-scale-in">
          {isLoginView ? (
            <LoginForm
              onSuccess={handleAuthSuccess}
              onRegisterClick={() => setIsLoginView(false)}
            />
          ) : (
            <RegisterForm
              onSuccess={handleAuthSuccess}
              onLoginClick={() => setIsLoginView(true)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AuthManager;
