
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
  
  // 密码强度更新
  useEffect(() => {
    if (!password) {
      setPasswordStrength(0);
      setPasswordError(undefined);
      return;
    }
    
    // 计算密码强度
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    setPasswordStrength(strength);
    
    // 验证密码
    const validation = validateStrongPassword(password);
    setPasswordError(validation.isValid ? undefined : validation.message);
  }, [password]);
  
  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>) => 
    (e: React.ChangeEvent<HTMLInputElement>) => {
      // 应用HTML转义以防XSS攻击
      const sanitizedValue = escapeHtml(e.target.value);
      setter(sanitizedValue);
    };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !confirmPassword) {
      toast.error("请填写所有必填字段");
      return;
    }
    
    // 验证密码强度
    const passwordValidation = validateStrongPassword(password);
    if (!passwordValidation.isValid) {
      toast.error(passwordValidation.message);
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error("密码不匹配");
      return;
    }
    
    setIsLoading(true);
    
    try {
      await registerUser(email, password, displayName);
      toast.success("注册成功");
      onSuccess();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "注册失败");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">创建账户</h1>
        <p className="text-muted-foreground">请输入您的信息创建账户</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            邮箱 <span className="text-red-500">*</span>
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
            显示名称 (可选)
          </label>
          <Input
            id="displayName"
            type="text"
            placeholder="您的名称"
            value={displayName}
            onChange={handleInputChange(setDisplayName)}
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">
            密码 <span className="text-red-500">*</span>
          </label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={handleInputChange(setPassword)}
            required
          />
          
          {/* 密码强度指示器 */}
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
                密码必须是8-12个字符，包含大写字母、小写字母、数字和特殊字符。
              </div>
            )}
          </div>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="text-sm font-medium">
            确认密码 <span className="text-red-500">*</span>
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
          {isLoading ? "创建账户中..." : "注册"}
        </Button>
      </form>
      
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          已有账户？{" "}
          <button
            type="button"
            className="text-primary hover:underline"
            onClick={onLoginClick}
          >
            登录
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;
