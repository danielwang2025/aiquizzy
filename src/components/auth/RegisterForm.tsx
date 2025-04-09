
import React, { useState, useEffect } from "react";
import { registerUser, sendEmailOTP } from "@/utils/authService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { validateStrongPassword, escapeHtml } from "@/utils/securityUtils";
import { AlertCircle, Eye, EyeOff, UserPlus, Mail, User, Key } from "lucide-react";
import { motion } from "framer-motion";
import OTPVerification from "./OTPVerification";

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  
  // Update password strength
  useEffect(() => {
    if (!password) {
      setPasswordStrength(0);
      setPasswordError(undefined);
      return;
    }
    
    // Calculate password strength
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    setPasswordStrength(strength);
    
    // Validate password
    const validation = validateStrongPassword(password);
    setPasswordError(validation.isValid ? undefined : validation.message);
  }, [password]);
  
  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>) => 
    (e: React.ChangeEvent<HTMLInputElement>) => {
      // Sanitize HTML to prevent XSS attacks
      const sanitizedValue = escapeHtml(e.target.value);
      setter(sanitizedValue);
      setError(null); // Clear error when input changes
    };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !confirmPassword) {
      setError("请填写所有必填字段");
      return;
    }
    
    const passwordValidation = validateStrongPassword(password);
    if (!passwordValidation.isValid) {
      setError(passwordValidation.message);
      return;
    }
    
    if (password !== confirmPassword) {
      setError("两次输入的密码不一致");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // 发送邮箱验证码
      await sendEmailOTP(email);
      toast.success("验证码已发送到您的邮箱");
      setShowOTPVerification(true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "发送验证码失败";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleOTPSuccess = async () => {
    try {
      setIsLoading(true);
      await registerUser(email, password, displayName);
      toast.success("注册成功");
      onSuccess();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "注册失败";
      setError(errorMessage);
      toast.error(errorMessage);
      setShowOTPVerification(false); // 返回注册表单
    } finally {
      setIsLoading(false);
    }
  };
  
  if (showOTPVerification) {
    return (
      <OTPVerification 
        email={email} 
        onSuccess={handleOTPSuccess}
        onBack={() => setShowOTPVerification(false)}
      />
    );
  }
  
  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-400">
          创建账户
        </h1>
        <p className="text-muted-foreground">请填写信息创建新账户</p>
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
            邮箱 <span className="text-red-500">*</span>
          </label>
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
        
        <div className="space-y-2">
          <label htmlFor="displayName" className="text-sm font-medium flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            显示名称（可选）
          </label>
          <Input
            id="displayName"
            type="text"
            placeholder="您的昵称"
            value={displayName}
            onChange={handleInputChange(setDisplayName)}
            className="pl-3 pr-3 py-2 h-11 bg-white dark:bg-black/20 backdrop-blur-sm border-muted"
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium flex items-center gap-2">
            <Key className="h-4 w-4 text-primary" />
            密码 <span className="text-red-500">*</span>
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
          
          {/* Password Strength Indicator */}
          <div className="mt-1">
            <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${
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
                <AlertCircle className="h-3 w-3 mr-1 flex-shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}
            
            {!passwordError && password && (
              <div className="text-xs text-muted-foreground mt-1">
                密码必须是8-12个字符长度，并包含大写字母、小写字母、数字和特殊字符。
              </div>
            )}
          </div>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="text-sm font-medium flex items-center gap-2">
            <Key className="h-4 w-4 text-primary" />
            确认密码 <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={handleInputChange(setConfirmPassword)}
              required
              className="pl-3 pr-10 py-2 h-11 bg-white dark:bg-black/20 backdrop-blur-sm border-muted"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              tabIndex={-1}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        
        <Button
          type="submit"
          className="w-full h-11 bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-600 transition-all shadow-md hover:shadow-lg hover:shadow-primary/20"
          disabled={isLoading || !!passwordError}
        >
          <UserPlus className="mr-2 h-4 w-4" />
          {isLoading ? "处理中..." : "注册"}
        </Button>
      </form>
      
      <div className="relative py-3">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-muted"></div>
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-background px-2 text-muted-foreground">
            已有账号?
          </span>
        </div>
      </div>
      
      <div className="text-center">
        <Button
          type="button"
          variant="outline"
          onClick={onLoginClick}
          className="w-full neo-card border-white/20 hover:shadow-md"
        >
          登录您的账号
        </Button>
      </div>
    </motion.div>
  );
};

export default RegisterForm;
