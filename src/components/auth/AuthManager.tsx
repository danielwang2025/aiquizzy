
import React, { useState, useEffect } from "react";
import { isAuthenticated, getCurrentUser, logoutUser } from "@/utils/authService";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { User, LogOut } from "lucide-react";
import { toast } from "sonner";

const AuthManager: React.FC = () => {
  const [isAuth, setIsAuth] = useState(false);
  const [currentUser, setCurrentUser] = useState(getCurrentUser());
  const [showRegister, setShowRegister] = useState(false);
  const [showAuthSheet, setShowAuthSheet] = useState(false);
  
  useEffect(() => {
    // Check authentication status
    setIsAuth(isAuthenticated());
    setCurrentUser(getCurrentUser());
  }, []);
  
  const handleAuthSuccess = () => {
    setIsAuth(true);
    setCurrentUser(getCurrentUser());
    setShowAuthSheet(false);
    // Reset auth sheet to login view for next time
    setShowRegister(false);
  };
  
  const handleLogout = () => {
    logoutUser();
    setIsAuth(false);
    setCurrentUser(null);
    toast.success("You have been logged out");
  };
  
  const toggleRegisterLogin = () => {
    setShowRegister(!showRegister);
  };
  
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
