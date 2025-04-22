import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Home, Book, BarChart, User, Atom, Mail, Calculator, FlaskConical, MessageCircle } from "lucide-react";
import AuthManager from "@/components/auth/AuthManager";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { isAuthenticated } from "@/utils/authService";
import MobileDrawer from "./MobileDrawer";

// Define which menu items should be hidden
const HIDDEN_MENU_ITEMS = ["dashboard", "review"];

const Navigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [scrolled, setScrolled] = useState(false);
  const isHomePage = location.pathname === "/";
  
  // Listen for scroll events to control nav bar style
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [scrolled]);
  
  // Handle authenticated navigation
  const handleAuthRequiredClick = async (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    navigate(path);
  };
  
  // Define all navigation items, including the hidden ones
  const navItems = [
    { path: "/", label: "Home", icon: <Home className="h-5 w-5" /> },
    { path: "/customize", label: "Create STEM Quiz", icon: <Atom className="h-5 w-5" /> },
    { path: "/problem-solver", label: "Math Solver", icon: <Calculator className="h-5 w-5" /> },
    { path: "/forum", label: "STEM News", icon: <MessageCircle className="h-5 w-5" /> },
    { path: "/dashboard", label: "Dashboard", icon: <BarChart className="h-5 w-5" /> },
    { path: "/review", label: "Review", icon: <Book className="h-5 w-5" /> },
    { path: "/contact", label: "Contact", icon: <Mail className="h-5 w-5" /> },
    { path: "/profile", label: "Profile", icon: <User className="h-5 w-5" /> },
  ];

  // Filter navigation items to hide specified ones
  const visibleNavItems = navItems.filter(
    item => !HIDDEN_MENU_ITEMS.includes(item.path.substring(1))
  );

  return (
    <nav 
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-300",
        isHomePage ? (
          scrolled 
            ? "bg-white/90 dark:bg-background/90 backdrop-blur-lg shadow-sm" 
            : "bg-white/40 backdrop-blur-md border-b border-white/20 shadow-sm"
        ) : (
          scrolled 
            ? "bg-background/80 backdrop-blur-lg shadow-sm" 
            : "bg-transparent"
        )
      )}
    >
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 md:h-20">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className={cn(
                "text-xl font-bold flex items-center gap-2",
                isHomePage && !scrolled ? "text-white drop-shadow-md" : "gradient-text"
              )}>
                <FlaskConical className="h-5 w-5" />
                STEM AI Quizzy
              </span>
            </Link>
          </div>
          
          {!isMobile && (
            <div className="hidden md:ml-6 md:flex md:items-center md:space-x-1">
              {visibleNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "px-3 py-2 mx-1 rounded-md text-sm font-medium transition-all duration-200",
                    location.pathname === item.path
                      ? isHomePage && !scrolled 
                        ? "bg-white/30 text-white shadow-sm backdrop-blur-sm" 
                        : "bg-primary/10 text-primary"
                      : isHomePage && !scrolled
                        ? "text-white hover:bg-white/20 hover:text-white"
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
              <MobileDrawer handleAuthRequiredClick={handleAuthRequiredClick} />
            )}
          </div>
        </div>
      </div>
      
      {/* Mobile bottom navigation */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-t border-border shadow-lg z-50">
          <div className="grid grid-cols-5 h-16">
            {visibleNavItems.slice(0, 5).map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center justify-center py-2",
                  location.pathname === item.path
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                {item.icon}
                <span className="mt-1 text-xs">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
