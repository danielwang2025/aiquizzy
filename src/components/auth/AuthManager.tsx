import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { User, UserPlus, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
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
import { User as UserType } from "@/types/quiz";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

const AuthManager: React.FC = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLoginView, setIsLoginView] = useState(true);
  const [user, setUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // 使用 useCallback 缓存函数以避免不必要的重新渲染
  const fetchUser = useCallback(async () => {
    try {
      setIsLoading(true);
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error("Failed to fetch user:", error);
      toast.error("Failed to load user data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 认证状态变化处理
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        switch (event) {
          case 'SIGNED_IN':
            await fetchUser();
            toast.success("Login successful");
            break;
          case 'SIGNED_OUT':
            setUser(null);
            toast.success("Logged out successfully");
            break;
          case 'TOKEN_REFRESHED':
            console.debug("Token refreshed");
            break;
          case 'USER_UPDATED':
            await fetchUser();
            break;
        }
      }
    );

    // 初始加载用户数据
    fetchUser();

    return () => {
      subscription?.unsubscribe();
    };
  }, [fetchUser]);

  const handleLoginClick = useCallback(() => {
    setIsLoginView(true);
    setIsAuthModalOpen(true);
  }, []);

  const handleAuthSuccess = useCallback(() => {
    setIsAuthModalOpen(false);
    navigate('/dashboard'); // 认证成功后重定向
  }, [navigate]);

  const handleLogout = useCallback(async () => {
    try {
      setIsLoading(true);
      await logoutUser();
      setUser(null);
      navigate('/'); // 登出后重定向到首页
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Failed to log out. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  // 加载状态组件
  if (isLoading) {
    return (
      <Button 
        variant="outline" 
        size="sm"
        className="glass-effect border-white/20 shadow-sm hover:shadow-md transition-all duration-300"
        aria-label="Loading authentication state"
        disabled
      >
        <div className="flex items-center">
          <Spinner size="sm" className="mr-2" />
          <span>Loading...</span>
        </div>
      </Button>
    );
  }

  // 已登录状态
  if (user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm"
            className="glass-effect border-white/20 shadow-sm hover:shadow-md transition-all duration-300"
            aria-label="User menu"
          >
            <div className="flex items-center">
              <UserAvatar user={user} className="mr-2" />
              <span className="max-w-[100px] truncate">
                {user.displayName || user.email?.split('@')[0]}
              </span>
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 animate-fade-in">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to="/profile" className="w-full cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={handleLogout} 
            disabled={isLoading}
            className="focus:bg-destructive/10 focus:text-destructive"
          >
            {isLoading ? (
              <div className="flex items-center">
                <Spinner size="sm" className="mr-2" />
                <span>Logging out...</span>
              </div>
            ) : (
              <>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </>
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // 未登录状态
  return (
    <>
      <Button 
        variant="outline" 
        size="sm"
        className="glass-effect border-white/20 shadow-sm hover:shadow-md transition-all duration-300"
        onClick={handleLoginClick}
        aria-label="Login or register"
      >
        <div className="flex items-center">
          <User className="h-4 w-4 mr-2" />
          <span>Login / Register</span>
        </div>
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
    </>
  );
};

// 提取的 Spinner 组件
const Spinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  return (
    <svg
      className={`animate-spin ${sizes[size]}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
};

// 提取的 UserAvatar 组件
const UserAvatar: React.FC<{ user: UserType; className?: string }> = ({ 
  user, 
  className 
}) => (
  <Avatar className={`h-6 w-6 ${className}`}>
    <AvatarFallback className="text-xs bg-primary/20">
      {user.displayName?.substring(0, 2).toUpperCase() || 'U'}
    </AvatarFallback>
  </Avatar>
);

export default React.memo(AuthManager);
