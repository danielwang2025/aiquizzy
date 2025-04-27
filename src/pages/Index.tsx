
import React from "react";
import Navigation from "@/components/Navigation";
import HeroSection from "@/components/home/HeroSection";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-black text-white transition-colors duration-300">
      <Navigation />
      <main className="flex-grow">
        <HeroSection />
      </main>
    </div>
  );
};

export default Index;
