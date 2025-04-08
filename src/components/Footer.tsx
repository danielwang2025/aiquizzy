
import React from "react";
import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { Github, Twitter, Facebook, Mail, Heart } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-16 px-4 bg-gradient-to-b from-background to-secondary/30 border-t">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div>
            <h3 className="font-bold text-2xl mb-4 gradient-text">AI Quizzy</h3>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Advanced AI quiz generation platform for education and professional development.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="Twitter" 
                className="w-10 h-10 flex items-center justify-center rounded-full bg-secondary hover:bg-primary/10 transition-colors text-muted-foreground hover:text-primary"
              >
                <Twitter size={18} />
              </a>
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="GitHub"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-secondary hover:bg-primary/10 transition-colors text-muted-foreground hover:text-primary"
              >
                <Github size={18} />
              </a>
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="Facebook"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-secondary hover:bg-primary/10 transition-colors text-muted-foreground hover:text-primary"
              >
                <Facebook size={18} />
              </a>
              <Link 
                to="/contact" 
                aria-label="Contact Us"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-secondary hover:bg-primary/10 transition-colors text-muted-foreground hover:text-primary"
              >
                <Mail size={18} />
              </Link>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-5 gradient-text">Platform</h3>
            <ul className="space-y-4">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary transition-colors inline-block">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/customize" className="text-muted-foreground hover:text-primary transition-colors inline-block">
                  Create Quiz
                </Link>
              </li>
              <li>
                <Link to="/review" className="text-muted-foreground hover:text-primary transition-colors inline-block">
                  Review Hub
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-muted-foreground hover:text-primary transition-colors inline-block">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-5 gradient-text">Resources</h3>
            <ul className="space-y-4">
              <li>
                <Link to="/dashboard" className="text-muted-foreground hover:text-primary transition-colors inline-block">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-muted-foreground hover:text-primary transition-colors inline-block">
                  Profile
                </Link>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors inline-block">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors inline-block">
                  Help Center
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-5 gradient-text">Legal</h3>
            <ul className="space-y-4">
              <li>
                <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors inline-block">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors inline-block">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors inline-block">
                  Cookie Policy
                </a>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors inline-block">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-10" />

        <div className="flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground">
          <p className="flex items-center">
            © {currentYear} AI Quizzy. All rights reserved. Made with <Heart className="h-4 w-4 mx-1 text-red-500" /> by our team.
          </p>
          <div className="flex gap-8 mt-6 md:mt-0">
            <Link to="/terms" className="hover:text-primary transition-colors">
              Terms
            </Link>
            <Link to="/privacy" className="hover:text-primary transition-colors">
              Privacy
            </Link>
            <a href="#" className="hover:text-primary transition-colors">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
