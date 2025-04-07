
import React, { useState, useEffect } from "react";
import { isAuthenticated, getCurrentUser, logoutUser } from "@/utils/authService";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { User, LogOut } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { User as UserType } from "@/types/quiz";

const AuthManager: React.FC = () => {
  const [isAuth, setIsAuth] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [showRegister, setShowRegister] = useState(false);
  const [showAuthSheet, setShowAuthSheet] = useState(false);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // 设置认证状态监听器
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          setIsAuth(true);
          const user = await getCurrentUser();
          setCurrentUser(user);
        } else {
          setIsAuth(false);
          setCurrentUser(null);
        }
      }
    );

    // 初始检查认证状态
    const checkAuth = async () => {
      try {
        const isAuthResult = await isAuthenticated();
        setIsAuth(isAuthResult);
        
        if (isAuthResult) {
          const user = await getCurrentUser();
          setCurrentUser(user);
        }
      } catch (error) {
        console.error("认证状态检查失败:", error);
      } finally {
        setLoading(false);
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
    // 重置认证表单为登录视图
    setShowRegister(false);
    // 认证状态将通过onAuthStateChange更新
  };
  
  const handleLogout = async () => {
    try {
      await logoutUser();
      toast.success("您已成功登出");
      // 认证状态将通过onAuthStateChange更新
    } catch (error) {
      toast.error("登出失败");
      console.error("登出错误:", error);
    }
  };
  
  const toggleRegisterLogin = () => {
    setShowRegister(!showRegister);
  };
  
  if (loading) {
    return <div className="flex items-center gap-2 opacity-50">加载中...</div>;
  }
  
  return (
    <div>
      {isAuth ? (
        <div className="flex items-center gap-2">
          <div className="text-sm">
            <span className="font-medium">{currentUser?.displayName || currentUser?.email}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            登出
          </Button>
        </div>
      ) : (
        <Sheet open={showAuthSheet} onOpenChange={setShowAuthSheet}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm">
              <User className="h-4 w-4 mr-2" />
              登录 / 注册
            </Button>
          </SheetTrigger>
          <SheetContent>
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
