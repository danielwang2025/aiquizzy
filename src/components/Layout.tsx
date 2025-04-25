
import React from 'react';
import Navigation from './Navigation';
import Footer from './Footer';
import { useIsMobile } from '@/hooks/use-mobile';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex min-h-screen flex-col">
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
