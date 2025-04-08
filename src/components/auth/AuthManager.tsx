
import React, { useState, useEffect } from "react";
import { isAuthenticated, getCurrentUser, logoutUser } from "@/utils/authService";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { User, LogOut, UserCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { User as UserType } from "@/types/quiz";
import { motion } from "framer-motion";
import LoadingSpinner from "@/components/LoadingSpinner";

const AuthManager: React.FC = () => {
  const [isAuth, setIsAuth] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [showRegister, setShowRegister] = useState(false);
  const [showAuthSheet, setShowAuthSheet] = useState(false);
  const [loading, setLoading] = useState(true); // 初始设为 true
  
  useEffect(() => {
    // 设置身份验证状态变化监听器
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setLoading(true); // 状态改变时设置加载中
        try {
          if (session) {
            setIsAuth(true);
            const user = await getCurrentUser();
            if (user) {
              setCurrentUser(user);
              // 同时保存到 localStorage 供 historyService 使用
              localStorage.setItem('current_user', JSON.stringify(user));
            }
          } else {
            setIsAuth(false);
            setCurrentUser(null);
            localStorage.removeItem('current_user');
          }
        } catch (error) {
          console.error("Auth state change error:", error);
        } finally {
          setLoading(false); // 确保状态更新后取消加载状态
        }
      }
    );

    // 初始检查身份验证状态
    const checkAuth = async () => {
      try {
        setLoading(true); // 检查前设置加载中
        const isAuthResult = await isAuthenticated();
        setIsAuth(isAuthResult);
        
        if (isAuthResult) {
          const user = await getCurrentUser();
          if (user) {
            setCurrentUser(user);
            // 同时保存到 localStorage 供 historyService 使用
            localStorage.setItem('current_user', JSON.stringify(user));
          }
        }
      } catch (error) {
        console.error("Failed to check authentication status:", error);
      } finally {
        setLoading(false); // 确保检查完成后取消加载状态，无论成功与否
      }
    };
    
    checkAuth();
    
    // 清理订阅
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  const handleAuthSuccess = () => {
    setShowAuthSheet(false);
    // 重置为登录视图
    setShowRegister(false);
    // 身份验证状态将通过 onAuthStateChange 更新
  };
  
  const handleLogout = async () => {
    try {
      setLoading(true); // 登出前设置加载中
      await logoutUser();
      toast.success("成功登出");
      localStorage.removeItem('current_user');
      // 身份验证状态将通过 onAuthStateChange 更新
    } catch (error) {
      toast.error("登出失败");
      console.error("Logout error:", error);
    } finally {
      setLoading(false); // 确保登出操作完成后取消加载状态
    }
  };
  
  const toggleRegisterLogin = () => {
    setShowRegister(!showRegister);
  };
  
  if (loading) {
    return (
      <Button variant="ghost" size="sm" disabled className="flex items-center">
        <LoadingSpinner size="sm" className="mr-2" />
        <span className="opacity-70">加载中...</span>
      </Button>
    );
  }
  
  return (
    <div>
      {isAuth ? (
        <motion.div 
          className="flex items-center gap-2"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <div className="text-sm hidden sm:block">
            <span className="font-medium bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-400">
              {currentUser?.displayName || currentUser?.email?.split('@')[0]}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="glass-effect border-white/20"
          >
            <LogOut className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">登出</span>
          </Button>
        </motion.div>
      ) : (
        <Sheet open={showAuthSheet} onOpenChange={setShowAuthSheet}>
          <SheetTrigger asChild>
            <Button 
              variant="outline" 
              size="sm"
              className="glass-effect border-white/20 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <User className="h-4 w-4 mr-2" />
              登录 / 注册
            </Button>
          </SheetTrigger>
          <SheetContent className="glass-effect border-l border-white/20">
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
