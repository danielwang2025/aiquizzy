
import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, SendHorizonal, Bot } from "lucide-react";
import { motion } from "framer-motion";
import LoadingSpinner from "@/components/LoadingSpinner";

interface AIFollowupChatProps {
  context: string;
  solution: {
    steps: Array<{
      text: string;
      explanation: string;
    }>;
  };
}

interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
}

const AIFollowupChat: React.FC<AIFollowupChatProps> = ({ context, solution }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "initial",
      content: "I can answer questions about this solution. What would you like to know?",
      sender: "ai",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: input,
      sender: "user",
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    
    try {
      // In a real implementation, this would make an API call to an AI service
      // with the context compression of the problem and solution
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock AI response based on user question keywords
      let aiResponse = "I'm not sure about that. Could you clarify your question?";
      
      const userQuestion = input.toLowerCase();
      
      if (userQuestion.includes("why") || userQuestion.includes("how")) {
        aiResponse = "This approach uses the fundamental theorem of calculus, which says that if F is an antiderivative of f, then the definite integral of f from a to b is F(b) - F(a). In this case, the antiderivative of sin(x) is -cos(x).";
      } else if (userQuestion.includes("different") || userQuestion.includes("another way")) {
        aiResponse = "Yes! Another approach would be to use the fact that sin(x) is an odd function on the interval [0,π], which means that ∫₀^π sin(x)dx = 2∫₀^(π/2) sin(x)dx";
      } else if (userQuestion.includes("application") || userQuestion.includes("use")) {
        aiResponse = "This integral has applications in physics when calculating work done by a periodic force, as well as in signal processing for analyzing sine waves.";
      } else if (userQuestion.includes("explain") || userQuestion.includes("step")) {
        aiResponse = "The key insight is recognizing that -cos(π) = -(-1) = 1 and -cos(0) = -(1) = -1. So when we calculate [-cos(x)]₀^π, we get 1-(-1) = 2.";
      }
      
      // Add AI response
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        content: aiResponse,
        sender: "ai",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="bg-white/70 backdrop-blur-md shadow-lg border-dashed">
      <CardHeader>
        <CardTitle className="flex items-center">
          <MessageCircle className="h-5 w-5 mr-2 text-purple-600" />
          Ask Follow-up Questions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-slate-50 rounded-lg p-4 h-64 overflow-y-auto">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex mb-3 ${message.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.sender === "user"
                    ? "bg-purple-100 text-purple-900 rounded-br-none"
                    : "bg-slate-200 text-slate-900 rounded-bl-none"
                }`}
              >
                {message.sender === "ai" && (
                  <div className="flex items-center mb-1 text-xs font-medium text-slate-500">
                    <Bot className="h-3 w-3 mr-1" /> AI Assistant
                  </div>
                )}
                <p className="text-sm">{message.content}</p>
              </div>
            </motion.div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start mb-3">
              <div className="bg-slate-200 text-slate-900 p-3 rounded-lg rounded-bl-none">
                <LoadingSpinner size="sm" />
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </CardContent>
      <CardFooter>
        <form onSubmit={handleSubmit} className="w-full flex items-center space-x-2">
          <Input
            type="text"
            placeholder="Ask about this solution..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="flex-grow"
          />
          <Button 
            type="submit" 
            disabled={isLoading || !input.trim()}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <SendHorizonal className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
};

export default AIFollowupChat;
