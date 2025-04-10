
import React, { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

interface AuthModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  initialView?: "login" | "register";
}

const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onOpenChange,
  initialView = "login" 
}) => {
  const [isLoginView, setIsLoginView] = useState(initialView === "login");

  const handleSuccess = () => {
    console.log("Authentication successful, closing modal");
    onOpenChange(false);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md animate-scale-in">
        {isLoginView ? (
          <LoginForm
            onSuccess={handleSuccess}
            onRegisterClick={() => setIsLoginView(false)}
          />
        ) : (
          <RegisterForm
            onSuccess={handleSuccess}
            onLoginClick={() => setIsLoginView(true)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
