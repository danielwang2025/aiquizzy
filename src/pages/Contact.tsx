
import React, { useEffect } from "react";
import Navigation from "@/components/Navigation";
import ContactUs from "@/components/ContactUs";
import { generateCsrfToken, storeCsrfToken } from "@/utils/securityUtils";

const Contact = () => {
  // Generate CSRF token when page loads
  useEffect(() => {
    const token = generateCsrfToken();
    storeCsrfToken(token);
    
    // Add Content Security Policy as a meta tag
    // In a real app, this would be set server-side
    const metaCSP = document.createElement('meta');
    metaCSP.httpEquiv = 'Content-Security-Policy';
    metaCSP.content = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' https://api.brevo.com;";
    document.head.appendChild(metaCSP);
    
    // Add X-Frame-Options meta tag
    const metaXFrame = document.createElement('meta');
    metaXFrame.httpEquiv = 'X-Frame-Options';
    metaXFrame.content = 'DENY';
    document.head.appendChild(metaXFrame);
    
    // Cleanup
    return () => {
      document.head.removeChild(metaCSP);
      document.head.removeChild(metaXFrame);
    };
  }, []);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <Navigation />
      <main className="py-8 px-4">
        <ContactUs />
      </main>
    </div>
  );
};

export default Contact;
