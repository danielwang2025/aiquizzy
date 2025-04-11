
import React from "react";
import { Mail, MapPin, Clock } from "lucide-react";

const ContactUs: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold mb-2">Contact Us</h2>
        <p className="text-muted-foreground">
          Have questions or feedback? We'd love to hear from you!
        </p>
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-sm border border-border">
        <div className="space-y-8">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Email Us</h3>
            <p className="text-muted-foreground mb-2">
              Send us an email and we'll get back to you as soon as possible.
            </p>
            <a 
              href="mailto:dickbussiness@163.com" 
              className="text-primary hover:underline font-medium"
            >
              dickbussiness@163.com
            </a>
          </div>

          <div className="border-t border-border my-8"></div>
          
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <MapPin className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Our Location</h3>
            <p className="text-muted-foreground">
              AI Quizzy Headquarters<br />
              123 Education Avenue<br />
              Learning District, ED 12345
            </p>
          </div>

          <div className="border-t border-border my-8"></div>
          
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Business Hours</h3>
            <p className="text-muted-foreground">
              Monday - Friday: 9:00 AM - 5:00 PM<br />
              Saturday: 10:00 AM - 2:00 PM<br />
              Sunday: Closed
            </p>
          </div>
        </div>
        
        <div className="mt-10 pt-6 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            We typically respond to emails within 24-48 hours during business days.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
