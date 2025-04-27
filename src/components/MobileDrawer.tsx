
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
import LanguageSwitcher from "./LanguageSwitcher";
import { useTranslation } from 'react-i18next';

interface MobileDrawerProps {
  handleAuthRequiredClick: (e: React.MouseEvent<HTMLAnchorElement>, path: string) => Promise<void>;
}

const HIDDEN_MENU_ITEMS = ["dashboard", "review"];

const MobileDrawer: React.FC<MobileDrawerProps> = ({ handleAuthRequiredClick }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const [open, setOpen] = React.useState(false);

  const navItems = [
    { path: "/", label: t('nav.home'), icon: <Home className="h-5 w-5" /> },
    { path: "/customize", label: t('nav.createQuiz'), icon: <Atom className="h-5 w-5" /> },
    { path: "/game", label: t('nav.game'), icon: <Play className="h-5 w-5" /> },
    { path: "/dashboard", label: t('nav.dashboard'), icon: <BarChart className="h-5 w-5" /> },
    { path: "/review", label: t('nav.review'), icon: <Book className="h-5 w-5" /> },
    { path: "/contact", label: t('nav.contact'), icon: <Mail className="h-5 w-5" /> },
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
            <DrawerTitle className="text-xl font-bold">
              <span className="flex items-center gap-2">
                <FlaskConical className="h-5 w-5" />
                STEM AI Quizzy
              </span>
            </DrawerTitle>
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <DrawerClose asChild>
                <Button variant="ghost" size="icon">
                  <X className="h-5 w-5" />
                </Button>
              </DrawerClose>
            </div>
          </DrawerHeader>
          <div className="p-4 space-y-1">
            {visibleNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={(e) => {
                  setOpen(false);
                }}
                className={cn(
                  "flex items-center gap-4 py-3.5 px-4 rounded-lg w-full",
                  location.pathname === item.path
                    ? "bg-primary/20 text-primary-foreground"
                    : "text-foreground/80"
                )}
              >
                <span className="p-2 rounded-md">
                  {item.icon}
                </span>
                <span className="text-base">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default MobileDrawer;
