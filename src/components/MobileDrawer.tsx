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
  PlusCircle, 
  BarChart, 
  Book, 
  Mail, 
  User,
  X,
  ScanText,
  Calculator,
  Atom,
  FlaskConical,
  MessageCircle,
  Play
} from 'lucide-react';

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
      <DrawerContent className="h-[80vh] max-h-[80vh] overflow-auto">
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader className="flex flex-row items-center justify-between">
            <DrawerTitle>STEM AI Quizzy</DrawerTitle>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon">
                <X className="h-4 w-4" />
              </Button>
            </DrawerClose>
          </DrawerHeader>
          <div className="px-4 py-2 space-y-2">
            {visibleNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={(e) => {
                  setOpen(false);
                }}
                className={cn(
                  "flex items-center gap-3 py-3 px-4 rounded-lg w-full transition-colors",
                  location.pathname === item.path
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:bg-secondary"
                )}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default MobileDrawer;
