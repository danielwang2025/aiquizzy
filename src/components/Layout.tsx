
import React, { useEffect } from 'react';
import Navigation from './Navigation';
import Footer from './Footer';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const isMobile = useIsMobile();
  
  useEffect(() => {
    // Check for system dark mode preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }

    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }
  }, []);
  
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground transition-colors duration-300">
      <Navigation />
      <main className={cn(
        "flex-grow",
        isMobile && "pb-24" // More padding for mobile to account for the bottom bar
      )}>
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
