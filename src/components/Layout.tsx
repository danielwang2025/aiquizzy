
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
      <main className={`flex-grow ${isMobile ? 'pb-20' : ''}`}>
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
