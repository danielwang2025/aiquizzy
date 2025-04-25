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
  User,
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
    { path: "/profile", label: "Profile", icon: <User className="h-5 w-5" /> },
  ];

  const visibleNavItems = navItems.filter(
    item => !HIDDEN_MENU_ITEMS.includes(item.path.substring(1))
  );

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-[85vh] max-h-[85vh] overflow-auto">
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader className="flex flex-row items-center justify-between px-4 py-6 border-b">
            <DrawerTitle className="text-xl font-bold">STEM AI Quizzy</DrawerTitle>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-secondary">
                <X className="h-5 w-5" />
              </Button>
            </DrawerClose>
          </DrawerHeader>
          <div className="p-4 space-y-1">
            {visibleNavItems.map((item) => (
              <motion.div
                key={item.path}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  to={item.path}
                  onClick={(e) => {
                    setOpen(false);
                  }}
                  className={cn(
                    "flex items-center gap-4 py-3.5 px-4 rounded-lg w-full transition-all duration-200",
                    location.pathname === item.path
                      ? "bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-foreground font-medium"
                      : "text-foreground/80 hover:bg-secondary dark:hover:bg-secondary/20 hover:text-foreground dark:hover:text-primary-foreground"
                  )}
                >
                  {item.icon}
                  <span className="text-base">{item.label}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default MobileDrawer;
