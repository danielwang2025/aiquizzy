
import React, { useState } from "react";
import { loginUser, requestPasswordReset } from "@/utils/authService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { escapeHtml } from "@/utils/securityUtils";
import { Eye, EyeOff, LogIn, Mail, Key, HelpCircle } from "lucide-react";
import { motion } from "framer-motion";
import LoadingSpinner from "@/components/LoadingSpinner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface LoginFormProps {
  onSuccess: () => void;
  onRegisterClick: () => void;
}

const ERROR_MESSAGES: Record<string, string> = {
  "Invalid login credentials": "邮箱或密码不正确，请重试",
  "Email not confirmed": "请先验证您的邮箱，然后再登录",
  "Invalid email": "请输入有效的邮箱地址",
};

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onRegisterClick }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  
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
      setError("请填写所有必填字段");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("提交登录表单，邮箱:", email);
      await loginUser(email, password);
      console.log("登录成功");
      onSuccess();
    } catch (error) {
      console.error("登录失败:", error);
      
      // 提供更友好的错误信息
      let errorMessage = error instanceof Error ? error.message : "登录失败";
      
      // 映射已知错误消息到中文提示
      const friendlyMessage = ERROR_MESSAGES[errorMessage] || errorMessage;
      setError(friendlyMessage);
      toast.error(friendlyMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleForgotPassword = async () => {
    if (!resetEmail) {
      toast.error("请输入您的邮箱地址");
      return;
    }
    
    setResetLoading(true);
    try {
      await requestPasswordReset(resetEmail);
      toast.success("重置密码链接已发送至您的邮箱");
      setShowForgotPassword(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "发送重置链接失败";
      toast.error(errorMessage);
    } finally {
      setResetLoading(false);
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
          欢迎回来
        </h1>
        <p className="text-muted-foreground">请输入您的凭据登录账号</p>
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
            邮箱
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
            密码
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
        
        <div className="text-right">
          <Button 
            type="button" 
            variant="link" 
            size="sm" 
            className="text-primary p-0 h-auto text-xs"
            onClick={() => setShowForgotPassword(true)}
          >
            忘记密码?
          </Button>
        </div>
        
        <Button
          type="submit"
          className="w-full h-11 bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-600 transition-all shadow-md hover:shadow-lg hover:shadow-primary/20"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <LoadingSpinner size="sm" color="white" className="mr-2" />
              登录中...
            </>
          ) : (
            <>
              <LogIn className="mr-2 h-4 w-4" />
              登录
            </>
          )}
        </Button>
      </form>
      
      <div className="relative py-3">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-muted"></div>
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-background px-2 text-muted-foreground">
            还没有账号？
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
          创建新账号
        </Button>
      </div>
      
      {/* 忘记密码对话框 */}
      <Dialog open={showForgotPassword} onOpenChange={setShowForgotPassword}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>重置密码</DialogTitle>
            <DialogDescription>
              请输入您的邮箱地址，我们将发送重置密码的链接给您
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="reset-email" className="text-sm font-medium">
                邮箱地址
              </label>
              <Input
                id="reset-email"
                type="email"
                placeholder="your@email.com"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowForgotPassword(false)}
              disabled={resetLoading}
            >
              取消
            </Button>
            <Button 
              onClick={handleForgotPassword}
              disabled={resetLoading || !resetEmail}
            >
              {resetLoading ? (
                <>
                  <LoadingSpinner size="sm" color="white" className="mr-2" />
                  发送中...
                </>
              ) : (
                "发送重置链接"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default LoginForm;
