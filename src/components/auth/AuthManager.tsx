
import React, { useState } from "react";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { User, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const AuthManager: React.FC = () => {
  const { user, signOut, loading } = useAuth();
  const [showRegister, setShowRegister] = useState(false);
  const [showAuthSheet, setShowAuthSheet] = useState(false);
  
  const handleAuthSuccess = () => {
    setShowAuthSheet(false);
    // Reset auth sheet to login view for next time
    setShowRegister(false);
  };
  
  const handleLogout = async () => {
    await signOut();
  };
  
  const toggleRegisterLogin = () => {
    setShowRegister(!showRegister);
  };
  
  return (
    <div>
      {user ? (
        <div className="flex items-center gap-2">
          <div className="text-sm">
            <span className="font-medium">{user.displayName || user.email}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            disabled={loading}
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
