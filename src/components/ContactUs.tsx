
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Send, Mail, Loader2 } from "lucide-react";
import { escapeHtml } from "@/utils/securityUtils";
import { detectPromptInjection } from "@/utils/moderationService";

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
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // HTML escape for XSS protection
    const sanitizedValue = escapeHtml(value);
    setFormData((prev) => ({ ...prev, [name]: sanitizedValue }));
    
    // Clear error when user starts typing again
    if (submitError) {
      setSubmitError(null);
    }
  };
  
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    
    // Basic form validation
    if (!formData.name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    
    if (!validateEmail(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    
    if (!formData.subject.trim()) {
      toast.error("Please enter a subject");
      return;
    }
    
    if (!formData.message.trim() || formData.message.length < 10) {
      toast.error("Please enter a message with at least 10 characters");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log("Preparing to send contact form data");
      
      // Check for prompt injection or harmful content in the message
      if (detectPromptInjection(formData.message)) {
        toast.error("Your message contains potentially harmful content. Please rephrase.");
        setIsSubmitting(false);
        return;
      }

      // Show toast for sending
      const loadingToast = toast.loading("Sending your message...");

      // Send the message to our API with a timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 seconds timeout
      
      console.log("Sending form data to API", formData);
      
      try {
        const response = await fetch('/api/send-message', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            subject: formData.subject,
            message: formData.message
          }),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        console.log("API response received", { status: response.status });
        
        // Dismiss the loading toast
        toast.dismiss(loadingToast);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: "Failed to send message" }));
          console.error("Error response from API:", errorData);
          throw new Error(errorData.error || "Failed to send message");
        }
        
        toast.success("Message sent successfully!");
        
        // Reset form
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: "",
        });
      } catch (fetchError: any) {
        console.error("Fetch error:", fetchError);
        
        // Dismiss the loading toast
        toast.dismiss(loadingToast);
        
        if (fetchError.name === 'AbortError') {
          toast.error("Request timed out. Please try again later.");
        } else {
          toast.error(`Failed to send message: ${fetchError.message}`);
        }
        
        setSubmitError(fetchError.message || "Failed to send message. Please try again later.");
      }
    } catch (error: any) {
      console.error("Overall error in contact form:", error);
      toast.error(`Error: ${error.message || "Unknown error occurred"}`);
      setSubmitError(error.message || "An unexpected error occurred. Please try again.");
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
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-border">
            <h3 className="text-xl font-semibold mb-4">Get in touch</h3>
            <p className="text-muted-foreground mb-6">
              Our team is here to help with any questions you may have.
            </p>
            
            <div className="flex items-center mb-4">
              <Mail className="h-5 w-5 mr-3 text-primary" />
              <a href="mailto:dickbusiness@163.com" className="text-primary hover:underline">
                dickbusiness@163.com
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
          <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-border space-y-4">
            {submitError && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-md mb-4">
                <p className="text-sm">{submitError}</p>
              </div>
            )}
            
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
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
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
                disabled={isSubmitting}
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
                disabled={isSubmitting}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
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
