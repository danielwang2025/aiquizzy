
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { User, UserPlus, LogOut } from "lucide-react";
import { getCurrentUser, logoutUser } from "@/utils/authService";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import { Link } from "react-router-dom";
import { User as UserType } from "@/types/quiz";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";

const AuthManager: React.FC = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLoginView, setIsLoginView] = useState(true);
  const [user, setUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getCurrentUser();
        console.log("fetchUser - Current user data:", userData);
        setUser(userData);
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUser();
    
    // Set up Supabase auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session ? "User logged in" : "User logged out");
      
      if (event === 'SIGNED_IN' && session?.user) {
        // Use setTimeout to avoid potential deadlocks with Supabase client
        setTimeout(async () => {
          try {
            const userData = await getCurrentUser();
            console.log("onAuthStateChange - Current user data:", userData);
            setUser(userData);
            toast.success("登录成功");
          } catch (error) {
            console.error("Error fetching user after sign in:", error);
            toast.error("获取用户信息失败");
          }
        }, 0);
      } else if (event === 'SIGNED_OUT') {
        console.log("User signed out, clearing user state");
        setUser(null);
        toast.success("已退出登录");
      } else if (event === 'PASSWORD_RECOVERY') {
        toast.info("请按照邮件指引重置密码");
      } else if (event === 'USER_UPDATED') {
        toast.success("用户信息已更新");
        setTimeout(async () => {
          try {
            const userData = await getCurrentUser();
            setUser(userData);
          } catch (error) {
            console.error("Error fetching updated user:", error);
          }
        }, 0);
      }
    });
    
    // Clean up subscription when component unmounts
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  const handleLoginClick = () => {
    setIsLoginView(true);
    setIsAuthModalOpen(true);
  };
  
  const handleAuthSuccess = () => {
    console.log("Authentication successful, closing modal");
    setIsAuthModalOpen(false);
  };
  
  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error("登出失败:", error);
      toast.error("退出登录失败，请稍后再试");
    }
  };
  
  if (isLoading) {
    return (
      <Button 
        variant="outline" 
        size="sm"
        className="glass-effect border-white/20 shadow-sm hover:shadow-md transition-all duration-300"
        disabled
      >
        <span className="animate-pulse">加载中...</span>
      </Button>
    );
  }
  
  if (user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm"
            className="glass-effect border-white/20 shadow-sm hover:shadow-md transition-all duration-300 flex items-center"
          >
            <Avatar className="h-6 w-6 mr-2">
              <AvatarFallback className="text-xs bg-primary/20">
                {user.displayName?.substring(0, 2).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <span className="max-w-[100px] truncate">{user.displayName || user.email?.split('@')[0]}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>我的账户</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to="/profile" className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              个人资料
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            退出登录
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
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
        <span>登录 / 注册</span>
      </Button>
      
      <Dialog open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen}>
        <DialogContent className="sm:max-w-md">
          {isLoginView ? (
            <LoginForm
              onSuccess={handleAuthSuccess}
              onRegisterClick={() => setIsLoginView(false)}
            />
          ) : (
            <RegisterForm
              onSuccess={handleAuthSuccess}
              onLoginClick={() => setIsLoginView(true)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AuthManager;
