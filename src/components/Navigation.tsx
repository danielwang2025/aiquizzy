import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Home, Book, BarChart, User, Atom, Mail, Play, FlaskConical } from "lucide-react";
import AuthManager from "@/components/auth/AuthManager";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion } from "framer-motion";
import ThemeToggle from "./ThemeToggle";
import MobileDrawer from "./MobileDrawer";

const HIDDEN_MENU_ITEMS = ["dashboard", "review"];

const Navigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [scrolled, setScrolled] = useState(false);
  const isHomePage = location.pathname === "/";
  
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
  
  const handleAuthRequiredClick = async (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    navigate(path);
  };
  
  const navItems = [
    { path: "/", label: "Home", icon: <Home className="h-5 w-5" /> },
    { path: "/customize", label: "Create STEM Quiz", icon: <Atom className="h-5 w-5" /> },
    { path: "/game", label: "Game", icon: <Play className="h-5 w-5" /> },
    { path: "/dashboard", label: "Dashboard", icon: <BarChart className="h-5 w-5" /> },
    { path: "/review", label: "Review", icon: <Book className="h-5 w-5" /> },
    { path: "/contact", label: "Contact", icon: <Mail className="h-5 w-5" /> },
  ];

  const visibleNavItems = navItems.filter(
    item => !HIDDEN_MENU_ITEMS.includes(item.path.substring(1))
  );

  return (
    <nav 
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-300",
        scrolled 
          ? "cyber-glass shadow-lg border-b border-primary/30 backdrop-blur-xl" 
          : "bg-transparent"
      )}
    >
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 md:h-20">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <motion.span 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "text-xl font-bold flex items-center gap-2 cyber-glitch-random",
                  isHomePage && !scrolled ? "text-white neon-text" : "gradient-text"
                )}
                data-text="STEM AI Quizzy"
              >
                <FlaskConical className="h-5 w-5 cyber-pulse" />
                STEM AI Quizzy
              </motion.span>
            </Link>
          </div>
          
          {!isMobile && (
            <div className="hidden md:ml-6 md:flex md:items-center md:space-x-1">
              {visibleNavItems.map((item) => (
                <motion.div
                  key={item.path}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to={item.path}
                    className={cn(
                      "px-3 py-2 mx-1 rounded-md text-sm font-medium transition-all duration-200",
                      location.pathname === item.path
                        ? isHomePage && !scrolled 
                          ? "bg-primary/30 cyber-glass text-white neon-text" 
                          : "bg-primary/20 cyber-glass neon-border text-primary-foreground"
                        : isHomePage && !scrolled
                          ? "text-white hover:bg-white/10 hover:cyber-glass"
                          : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground hover:cyber-glass"
                    )}
                  >
                    <span className="flex items-center gap-2">
                      {item.icon}
                      {item.label}
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <AuthManager />
            {isMobile && <MobileDrawer handleAuthRequiredClick={handleAuthRequiredClick} />}
          </div>
        </div>
      </div>
      
      {isMobile && (
        <motion.div 
          initial={false}
          animate={{ y: 0 }}
          className="fixed bottom-0 left-0 right-0 cyber-glass backdrop-blur-lg border-t border-primary/30 shadow-lg z-50"
        >
          <div className="grid grid-cols-5 h-16">
            {visibleNavItems.slice(0, 5).map((item) => (
              <motion.div
                key={item.path}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to={item.path}
                  className={cn(
                    "flex flex-col items-center justify-center py-2 transition-colors duration-200",
                    location.pathname === item.path
                      ? "text-primary cyber-flicker"
                      : "text-muted-foreground hover:text-primary-foreground"
                  )}
                >
                  {item.icon}
                  <span className="mt-1 text-xs font-medium">{item.label}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </nav>
  );
};

export default Navigation;
