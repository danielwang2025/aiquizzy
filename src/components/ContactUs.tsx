
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Send, Mail } from "lucide-react";
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
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // HTML escape for XSS protection
    const sanitizedValue = escapeHtml(value);
    setFormData((prev) => ({ ...prev, [name]: sanitizedValue }));
  };
  
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic form validation
    if (!formData.name.trim()) {
      toast.error("请输入您的姓名");
      return;
    }
    
    if (!validateEmail(formData.email)) {
      toast.error("请输入有效的电子邮件地址");
      return;
    }
    
    if (!formData.subject.trim()) {
      toast.error("请输入主题");
      return;
    }
    
    if (!formData.message.trim() || formData.message.length < 10) {
      toast.error("请输入至少10个字符的消息");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Check for prompt injection or harmful content in the message
      if (detectPromptInjection(formData.message)) {
        toast.error("您的消息包含潜在有害内容。请重新表述。");
        setIsSubmitting(false);
        return;
      }

      // Send the message to our API
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
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "发送消息失败" }));
        throw new Error(errorData.error || "Failed to send message");
      }
      
      toast.success("消息发送成功！");
      
      // Reset form
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("发送消息失败。请稍后再试。");
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
