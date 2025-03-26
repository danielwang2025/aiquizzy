
import React, { useState, useEffect } from "react";
import { registerUser } from "@/utils/authService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { validateStrongPassword, escapeHtml } from "@/utils/securityUtils";
import { AlertCircle } from "lucide-react";

interface RegisterFormProps {
  onSuccess: () => void;
  onLoginClick: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess, onLoginClick }) => {
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | undefined>();
  const [passwordStrength, setPasswordStrength] = useState<number>(0);
  
  // Update password strength whenever password changes
  useEffect(() => {
    if (!password) {
      setPasswordStrength(0);
      setPasswordError(undefined);
      return;
    }
    
    // Calculate password strength (simple version)
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    setPasswordStrength(strength);
    
    // Validate password
    const validation = validateStrongPassword(password);
    setPasswordError(validation.message);
  }, [password]);
  
  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>) => 
    (e: React.ChangeEvent<HTMLInputElement>) => {
      // Apply HTML escaping for XSS protection
      const sanitizedValue = escapeHtml(e.target.value);
      setter(sanitizedValue);
    };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !confirmPassword) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    // Validate password strength
    const passwordValidation = validateStrongPassword(password);
    if (!passwordValidation.isValid) {
      toast.error(passwordValidation.message);
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    setIsLoading(true);
    
    try {
      await registerUser(email, password, displayName);
      toast.success("Registration successful");
      onSuccess();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">Create an Account</h1>
        <p className="text-muted-foreground">Enter your information to create an account</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email <span className="text-red-500">*</span>
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
          <label htmlFor="displayName" className="text-sm font-medium">
            Display Name (optional)
          </label>
          <Input
            id="displayName"
            type="text"
            placeholder="Your Name"
            value={displayName}
            onChange={handleInputChange(setDisplayName)}
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">
            Password <span className="text-red-500">*</span>
          </label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={handleInputChange(setPassword)}
            required
          />
          
          {/* Password strength indicator */}
          <div className="mt-1">
            <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full ${
                  passwordStrength === 0 ? 'w-0' :
                  passwordStrength === 1 ? 'w-1/5 bg-red-500' :
                  passwordStrength === 2 ? 'w-2/5 bg-orange-500' :
                  passwordStrength === 3 ? 'w-3/5 bg-yellow-500' :
                  passwordStrength === 4 ? 'w-4/5 bg-lime-500' :
                  'w-full bg-green-500'
                }`}
              ></div>
            </div>
            
            {passwordError && (
              <div className="text-xs text-red-500 flex items-center mt-1">
                <AlertCircle className="h-3 w-3 mr-1" />
                {passwordError}
              </div>
            )}
            
            {!passwordError && password && (
              <div className="text-xs text-muted-foreground mt-1">
                Password must be 8-12 characters with uppercase, lowercase, number, and special character.
              </div>
            )}
          </div>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="text-sm font-medium">
            Confirm Password <span className="text-red-500">*</span>
          </label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={handleInputChange(setConfirmPassword)}
            required
          />
        </div>
        
        <Button
          type="submit"
          className="w-full"
          disabled={isLoading || !!passwordError}
        >
          {isLoading ? "Creating account..." : "Register"}
        </Button>
      </form>
      
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <button
            type="button"
            className="text-primary hover:underline"
            onClick={onLoginClick}
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;
