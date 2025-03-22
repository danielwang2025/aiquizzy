
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Home, Settings, Book, BarChart, User, PlusCircle } from "lucide-react";
import AuthManager from "@/components/auth/AuthManager";
import { useMediaQuery } from "@/hooks/use-mobile";

const Navigation: React.FC = () => {
  const location = useLocation();
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  const navItems = [
    { path: "/", label: "Home", icon: <Home className="h-5 w-5" /> },
    { path: "/customize", label: "Create Quiz", icon: <PlusCircle className="h-5 w-5" /> },
    { path: "/dashboard", label: "Dashboard", icon: <BarChart className="h-5 w-5" /> },
    { path: "/review", label: "Review", icon: <Book className="h-5 w-5" /> },
    { path: "/profile", label: "Profile", icon: <User className="h-5 w-5" /> },
  ];

  return (
    <nav className="bg-background border-b border-border">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                AI Quizzy
              </span>
            </Link>
          </div>
          
          {!isMobile && (
            <div className="hidden md:ml-6 md:flex md:items-center md:space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    location.pathname === item.path
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <span className="flex items-center gap-2">
                    {item.icon}
                    {item.label}
                  </span>
                </Link>
              ))}
            </div>
          )}
          
          <div className="flex items-center">
            <AuthManager />
            
            {isMobile && (
              <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
                <div className="flex justify-around">
                  {navItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={cn(
                        "flex flex-col items-center py-2 px-3 text-xs font-medium",
                        location.pathname === item.path
                          ? "text-primary"
                          : "text-muted-foreground"
                      )}
                    >
                      {item.icon}
                      <span className="mt-1">{item.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
