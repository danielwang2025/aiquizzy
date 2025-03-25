
import React, { useState, useEffect } from "react";
import { getCurrentUser, logoutUser, getProfile } from "@/utils/authService";
import { User, Profile } from "@/types/supabase";
import { supabase } from "@/integrations/supabase/client";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { User as UserIcon, LogOut } from "lucide-react";
import { toast } from "sonner";

const AuthManager: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showRegister, setShowRegister] = useState(false);
  const [showAuthSheet, setShowAuthSheet] = useState(false);
  
  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user as User || null);
        
        if (session?.user) {
          const userProfile = await getProfile(session.user.id);
          setProfile(userProfile);
        } else {
          setProfile(null);
        }
        
        setIsLoading(false);
      }
    );
    
    // Check for existing session
    const initializeAuth = async () => {
      setIsLoading(true);
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      
      if (currentUser) {
        const userProfile = await getProfile(currentUser.id);
        setProfile(userProfile);
      }
      
      setIsLoading(false);
    };
    
    initializeAuth();
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  const handleAuthSuccess = () => {
    setShowAuthSheet(false);
    // Reset auth sheet to login view for next time
    setShowRegister(false);
    toast.success("Authentication successful");
  };
  
  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
    setProfile(null);
    toast.success("You have been logged out");
  };
  
  const toggleRegisterLogin = () => {
    setShowRegister(!showRegister);
  };
  
  if (isLoading) {
    return <div className="h-5"></div>; // Small placeholder while loading
  }
  
  return (
    <div>
      {user ? (
        <div className="flex items-center gap-2">
          <div className="text-sm">
            <span className="font-medium">{profile?.display_name || user.email}</span>
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
              <UserIcon className="h-4 w-4 mr-2" />
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
