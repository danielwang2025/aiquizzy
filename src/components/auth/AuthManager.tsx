
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { User, UserPlus, LogOut } from "lucide-react";
import { getCurrentUser, logoutUser, sendMagicLink } from "@/utils/authService";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import { Link, useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  
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
            // Redirect to home page on successful login
            navigate('/');
            // Close auth modal if open
            setIsAuthModalOpen(false);
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
      
      // Handle magic link email sent event through custom toast notification
      // instead of direct event comparison since it's not in the type definition
      if (event && event.toString().includes('MAGIC_LINK_EMAIL_SENT')) {
        toast.success("魔术链接已发送至您的邮箱，请查收");
      }
    });
    
    // Check for current session on mount or route change
    const checkSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          console.log("Existing session found");
          const userData = await getCurrentUser();
          setUser(userData);
        } else {
          console.log("No active session found");
          setUser(null);
        }
      } catch (error) {
        console.error("Session check failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
    
    // Clean up subscription when component unmounts
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);
  
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
      setIsLoading(true); // Show loading state during logout
      await logoutUser();
    } catch (error) {
      console.error("登出失败:", error);
      toast.error("退出登录失败，请稍后再试");
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isLoading) {
    return (
      <Button 
        variant="outline" 
        size="sm"
        className="glass-effect border-white/20 shadow-sm hover:shadow-md transition-all duration-300 animate-pulse"
      >
        <span className="flex items-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          加载中...
        </span>
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
        <DropdownMenuContent align="end" className="w-56 animate-fade-in">
          <DropdownMenuLabel>我的账户</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to="/profile" className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              个人资料
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleLogout} disabled={isLoading}>
            {isLoading ? (
              <>
                <svg className="animate-spin mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                退出中...
              </>
            ) : (
              <>
                <LogOut className="mr-2 h-4 w-4" />
                退出登录
              </>
            )}
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
        <DialogContent className="sm:max-w-md animate-scale-in">
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
