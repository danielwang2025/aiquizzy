
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Send, Mail } from "lucide-react";

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const ContactUs: React.FC = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Brevo API configuration
    const BREVO_API_KEY = "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";
    
    try {
      // In a production app, this would be done through a server-side API
      // For demo purposes, we're simulating the email sending
      console.log("Sending email via Brevo:");
      console.log("SMTP Server: smtp-relay.brevo.com");
      console.log("Port: 587");
      console.log("Login: 88a748001@smtp-brevo.com");
      console.log("To: dickbussiness@163.com");
      console.log("From:", formData.email);
      console.log("Subject:", formData.subject);
      console.log("Message:", formData.message);
      
      // Simulate API call with a delay
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      toast.success("Message sent successfully!");
      
      // Reset form
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold mb-2">Contact Us</h2>
        <p className="text-muted-foreground">
          Have questions or feedback? We'd love to hear from you!
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-border">
            <h3 className="text-xl font-semibold mb-4">Get in touch</h3>
            <p className="text-muted-foreground mb-6">
              Our team is here to help with any questions you may have.
            </p>
            
            <div className="flex items-center mb-4">
              <Mail className="h-5 w-5 mr-3 text-primary" />
              <a href="mailto:dickbussiness@163.com" className="text-primary hover:underline">
                dickbussiness@163.com
              </a>
            </div>
            
            <div className="mt-8 pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground">
                We typically respond within 24-48 hours during business days.
              </p>
            </div>
          </div>
        </div>
        
        <div className="md:col-span-3">
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm border border-border space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">Name</label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Your name"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">Email</label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="your@email.com"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="subject" className="text-sm font-medium">Subject</label>
              <Input
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                placeholder="How can we help?"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="message" className="text-sm font-medium">Message</label>
              <Textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                placeholder="Your message here..."
                className="min-h-[150px]"
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                "Sending..."
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
