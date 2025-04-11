import React from "react";
import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { Github, Twitter, Facebook, Mail, Heart } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-16 px-6 bg-gradient-to-b from-background to-secondary/30 border-t text-sm">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">

          {/* Brand Section */}
          <div>
            <h3 className="font-extrabold text-2xl mb-4 gradient-text">AI Quizzy</h3>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Advanced AI quiz generation platform for education and professional development.
            </p>
            <div className="flex space-x-3">
              {[{ icon: Twitter, href: "https://twitter.com", label: "Twitter" },
                { icon: Github, href: "https://github.com", label: "GitHub" },
                { icon: Facebook, href: "https://facebook.com", label: "Facebook" },
              ].map(({ icon: Icon, href, label }, idx) => (
                <a
                  key={idx}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-secondary hover:bg-primary/10 transition-colors text-muted-foreground hover:text-primary"
                >
                  <Icon size={18} />
                </a>
              ))}
              <Link
                to="/contact"
                aria-label="Contact Us"
                className="w-9 h-9 flex items-center justify-center rounded-full bg-secondary hover:bg-primary/10 transition-colors text-muted-foreground hover:text-primary"
              >
                <Mail size={18} />
              </Link>
            </div>
          </div>

          {/* Navigation Columns */}
          {[
            {
              title: "Platform",
              links: [
                { to: "/", label: "Home" },
                { to: "/customize", label: "Create Quiz" },
                { to: "/review", label: "Review Hub" },
                { to: "/pricing", label: "Pricing" },
              ],
            },
            {
              title: "Resources",
              links: [
                { to: "/dashboard", label: "Dashboard" },
                { to: "/profile", label: "Profile" },
                { href: "#", label: "Blog" },
                { href: "#", label: "Help Center" },
              ],
            },
            {
              title: "Legal",
              links: [
                { to: "/terms", label: "Terms of Service" },
                { to: "/privacy", label: "Privacy Policy" },
                { href: "#", label: "Cookie Policy" },
                { to: "/contact", label: "Contact Us" },
              ],
            },
          ].map((section, idx) => (
            <div key={idx}>
              <h4 className="font-semibold text-lg mb-4 gradient-text">{section.title}</h4>
              <ul className="space-y-3">
                {section.links.map(({ to, href, label }, i) =>
                  to ? (
                    <li key={i}>
                      <Link
                        to={to}
                        className="text-muted-foreground hover:text-primary transition-colors inline-block"
                      >
                        {label}
                      </Link>
                    </li>
                  ) : (
                    <li key={i}>
                      <a
                        href={href}
                        className="text-muted-foreground hover:text-primary transition-colors inline-block"
                      >
                        {label}
                      </a>
                    </li>
                  )
                )}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-12" />

        <div className="flex flex-col md:flex-row items-center justify-between">
          <p className="text-muted-foreground flex items-center">
            © {currentYear} AI Quizzy. All rights reserved.
          </p>
          <div className="flex gap-6 mt-6 md:mt-0">
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
