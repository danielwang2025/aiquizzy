
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
    // Force dark mode
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
    
    // Add cyber theme effects
    document.documentElement.classList.add('cyber-theme');
    
    // Add glitch effect randomly
    const randomGlitch = () => {
      const elements = document.querySelectorAll('.cyber-glitch-random');
      elements.forEach(el => {
        if (Math.random() > 0.95) {
          el.classList.add('cyber-glitch');
          setTimeout(() => {
            el.classList.remove('cyber-glitch');
          }, 500);
        }
      });
      
      setTimeout(randomGlitch, Math.random() * 5000 + 2000);
    };
    
    randomGlitch();
    
    return () => {
      document.documentElement.classList.remove('cyber-theme');
    };
  }, []);
  
  return (
    <div className="flex min-h-screen flex-col bg-black text-white transition-colors duration-300 circuit-bg">
      {/* Scanlines overlay */}
      <div className="fixed inset-0 pointer-events-none cyber-scanline opacity-10"></div>
      
      {/* Glowing corner accents */}
      <div className="fixed top-0 left-0 w-32 h-32 bg-gradient-to-br from-primary/40 to-transparent blur-2xl opacity-20 pointer-events-none"></div>
      <div className="fixed bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-accent/40 to-transparent blur-2xl opacity-20 pointer-events-none"></div>
      
      <Navigation />
      <main className={cn(
        "flex-grow z-10",
        isMobile && "pb-24" // More padding for mobile to account for the bottom bar
      )}>
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
