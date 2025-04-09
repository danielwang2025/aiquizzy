import React, { useState } from "react";
import { loginUser } from "@/utils/authService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { escapeHtml } from "@/utils/securityUtils";
import { Eye, EyeOff, LogIn, Mail, Key } from "lucide-react";
import { motion } from "framer-motion";

interface LoginFormProps {
  onSuccess: () => void;
  onRegisterClick: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onRegisterClick }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>) => 
    (e: React.ChangeEvent<HTMLInputElement>) => {
      // Apply HTML escaping to prevent XSS attacks
      const sanitizedValue = escapeHtml(e.target.value);
      setter(sanitizedValue);
      setError(null); // Clear error when input changes
    };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError("Please fill in all required fields");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      await loginUser(email, password);
      toast.success("Login successful");
      onSuccess();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Login failed";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-400">
          Welcome Back
        </h1>
        <p className="text-muted-foreground">Please enter your credentials to access your account</p>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-md p-3 text-sm">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
            <Mail className="h-4 w-4 text-primary" />
            Email
          </label>
          <div className="relative">
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={handleInputChange(setEmail)}
              required
              className="pl-3 pr-3 py-2 h-11 bg-white dark:bg-black/20 backdrop-blur-sm border-muted"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium flex items-center gap-2">
            <Key className="h-4 w-4 text-primary" />
            Password
          </label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={handleInputChange(setPassword)}
              required
              className="pl-3 pr-10 py-2 h-11 bg-white dark:bg-black/20 backdrop-blur-sm border-muted"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        
        <Button
          type="submit"
          className="w-full h-11 bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-600 transition-all shadow-md hover:shadow-lg hover:shadow-primary/20"
          disabled={isLoading}
        >
          <LogIn className="mr-2 h-4 w-4" />
          {isLoading ? "Logging in..." : "Login"}
        </Button>
      </form>
      
      <div className="relative py-3">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-muted"></div>
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-background px-2 text-muted-foreground">
            Don't have an account?
          </span>
        </div>
      </div>
      
      <div className="text-center">
        <Button
          type="button"
          variant="outline"
          onClick={onRegisterClick}
          className="w-full neo-card border-white/20 hover:shadow-md"
        >
          Create a new account
        </Button>
      </div>
    </motion.div>
  );
};

export default LoginForm;
