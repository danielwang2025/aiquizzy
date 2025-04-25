
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { 
  Menu, 
  Home, 
  Atom, 
  BarChart, 
  Book, 
  Mail, 
  X,
  FlaskConical,
  Play
} from 'lucide-react';
import { motion } from 'framer-motion';

interface MobileDrawerProps {
  handleAuthRequiredClick: (e: React.MouseEvent<HTMLAnchorElement>, path: string) => Promise<void>;
}

const HIDDEN_MENU_ITEMS = ["dashboard", "review"];

const MobileDrawer: React.FC<MobileDrawerProps> = ({ handleAuthRequiredClick }) => {
  const location = useLocation();
  const [open, setOpen] = React.useState(false);

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
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden cyber-glass cyber-pulse rounded-full">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-[85vh] max-h-[85vh] overflow-auto cyber-glass">
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader className="flex flex-row items-center justify-between px-4 py-6 border-b border-primary/20">
            <DrawerTitle className="text-xl font-bold gradient-text cyber-glitch-random" data-text="STEM AI Quizzy">
              <span className="flex items-center gap-2">
                <FlaskConical className="h-5 w-5 cyber-pulse" />
                STEM AI Quizzy
              </span>
            </DrawerTitle>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-secondary/30 cyber-glass">
                <X className="h-5 w-5" />
              </Button>
            </DrawerClose>
          </DrawerHeader>
          <div className="p-4 space-y-1">
            {visibleNavItems.map((item, index) => (
              <motion.div
                key={item.path}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ 
                  opacity: 1, 
                  y: 0,
                  transition: { 
                    delay: index * 0.05,
                    duration: 0.3
                  }
                }}
              >
                <Link
                  to={item.path}
                  onClick={(e) => {
                    handleAuthRequiredClick(e, item.path);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex items-center gap-4 py-3.5 px-4 rounded-lg w-full transition-all duration-200",
                    location.pathname === item.path
                      ? "cyber-glass bg-primary/20 text-primary gradient-border"
                      : "text-foreground/80 hover:cyber-glass hover:text-primary-foreground"
                  )}
                >
                  <span className={cn(
                    "p-2 rounded-md",
                    location.pathname === item.path ? "cyber-pulse" : ""
                  )}>
                    {item.icon}
                  </span>
                  <span className="text-base">{item.label}</span>
                </Link>
              </motion.div>
            ))}
          </div>
          
          {/* Decorative cyber elements */}
          <div className="absolute bottom-6 left-0 w-full flex justify-center">
            <div className="w-2/3 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
          </div>
          <div className="absolute bottom-10 left-0 w-full overflow-hidden h-16 opacity-20 pointer-events-none">
            <div className="terminal-cursor w-full text-center text-xs">
              SYSTEM.INITIALIZED // NEURAL.NETWORK.ACTIVE // AI.MODEL.LOADED
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default MobileDrawer;
