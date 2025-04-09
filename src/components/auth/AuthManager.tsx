
import React from "react";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";

// Simplified AuthManager that doesn't use Supabase
const AuthManager: React.FC = () => {
  return (
    <div>
      <Button 
        variant="outline" 
        size="sm"
        className="glass-effect border-white/20 shadow-sm hover:shadow-md transition-all duration-300 flex items-center"
        aria-label="Login / Register"
      >
        <User className="h-4 w-4 mr-2" />
        <span>用户功能已禁用</span>
      </Button>
    </div>
  );
};

export default AuthManager;
