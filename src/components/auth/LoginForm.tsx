
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { escapeHtml, generateCsrfToken, storeCsrfToken } from "@/utils/securityUtils";
import { useAuth } from "@/contexts/AuthContext";

interface LoginFormProps {
  onSuccess: () => void;
  onRegisterClick: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onRegisterClick }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signIn, sendMagicLink, loading } = useAuth();
  const [isMagicLinkLoading, setIsMagicLinkLoading] = useState(false);
  
  // Generate and store CSRF token on component mount
  useEffect(() => {
    const token = generateCsrfToken();
    storeCsrfToken(token);
  }, []);
  
  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>) => 
    (e: React.ChangeEvent<HTMLInputElement>) => {
      // Apply HTML escaping for XSS protection
      const sanitizedValue = escapeHtml(e.target.value);
      setter(sanitizedValue);
    };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    
    try {
      await signIn(email, password);
      onSuccess();
    } catch (error) {
      // Error is already handled by the Auth context
    }
  };

  const handleMagicLink = async () => {
    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    setIsMagicLinkLoading(true);

    try {
      await sendMagicLink(email);
    } catch (error) {
      // Error is already handled by the Auth context
    } finally {
      setIsMagicLinkLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">Login</h1>
        <p className="text-muted-foreground">Enter your credentials to access your account</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <Input
            id="email"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={handleInputChange(setEmail)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={handleInputChange(setPassword)}
            required
          />
        </div>
        
        <Button
          type="submit"
          className="w-full"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t"></span>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-muted-foreground">Or</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleMagicLink}
          disabled={isMagicLinkLoading}
        >
          {isMagicLinkLoading ? "Sending..." : "Login with Magic Link"}
        </Button>
      </form>
      
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Don't have an account?{" "}
          <button
            type="button"
            className="text-primary hover:underline"
            onClick={onRegisterClick}
          >
            Register
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
