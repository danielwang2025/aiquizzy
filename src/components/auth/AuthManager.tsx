
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import UserMenu from "./UserMenu";
import AuthModal from "./AuthModal";
import LoadingButton from "./LoadingButton";

const AuthManager: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  const handleLoginClick = () => {
    setIsAuthModalOpen(true);
  };
  
  if (isLoading) {
    return (
      <LoadingButton 
        variant="outline" 
        size="sm"
        className="glass-effect border-white/20 shadow-sm hover:shadow-md transition-all duration-300"
        isLoading={true}
        loadingText="Loading..."
      >
        Loading...
      </LoadingButton>
    );
  }
  
  if (user) {
    return <UserMenu />;
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
      
      <AuthModal isOpen={isAuthModalOpen} onOpenChange={setIsAuthModalOpen} />
    </div>
  );
};

export default AuthManager;
