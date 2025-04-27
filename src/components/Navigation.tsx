import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Home, Book, BarChart, Atom, Mail, Play, FlaskConical } from "lucide-react";
import AuthManager from "@/components/auth/AuthManager";
import { useIsMobile } from "@/hooks/use-mobile";
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

  const handleAuthRequiredClick = async (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    navigate(path);
  };

  return (
    <nav 
      className={cn(
        "fixed top-0 w-full z-50 transition-colors",
        scrolled 
          ? "bg-background/95 shadow-sm border-b backdrop-blur supports-[backdrop-filter]:bg-background/60" 
          : "bg-transparent"
      )}
    >
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 md:h-20">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold flex items-center gap-2">
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
                    "px-3 py-2 mx-1 rounded-md text-sm font-medium",
                    location.pathname === item.path
                      ? "bg-primary/20 text-primary-foreground"
                      : "text-muted-foreground"
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
          
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <AuthManager />
            {isMobile && <MobileDrawer handleAuthRequiredClick={handleAuthRequiredClick} />}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
