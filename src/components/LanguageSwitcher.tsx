
import React from 'react';
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const LanguageSwitcher = () => {
  const [currentLang, setCurrentLang] = React.useState('中文');

  const handleLanguageChange = (lang: string) => {
    setCurrentLang(lang);
    // TODO: Implement actual language switching logic
    console.log(`Switching to ${lang}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="border border-primary/30 bg-black/30">
          <Globe className="h-4 w-4" />
          <span className="sr-only">Switch language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-black/90 border border-white/20">
        <DropdownMenuItem 
          className="text-white/90 focus:bg-white/20 focus:text-white cursor-pointer"
          onClick={() => handleLanguageChange('中文')}
        >
          中文
        </DropdownMenuItem>
        <DropdownMenuItem 
          className="text-white/90 focus:bg-white/20 focus:text-white cursor-pointer"
          onClick={() => handleLanguageChange('English')}
        >
          English
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
