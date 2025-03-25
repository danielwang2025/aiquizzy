
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { getApiKey } from "@/utils/envVars";
import { AlertCircle, Settings } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const ApiKeysManager: React.FC = () => {
  const [open, setOpen] = useState(false);
  
  // Check if any of the API keys are missing
  const isDeepseekKeyMissing = !getApiKey('DEEPSEEK_API_KEY');
  const isBrevoKeyMissing = !getApiKey('BREVO_API_KEY');
  const isOpenAIKeyMissing = !getApiKey('OPENAI_API_KEY');
  
  const missingKeysCount = [
    isDeepseekKeyMissing,
    isBrevoKeyMissing,
    isOpenAIKeyMissing
  ].filter(Boolean).length;
  
  if (missingKeysCount === 0) {
    return null; // Don't show the component if all keys are present
  }
  
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-1.5">
          <AlertCircle className="h-4 w-4 text-amber-500" />
          <span>API Keys Setup ({missingKeysCount})</span>
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>API Keys Configuration</SheetTitle>
          <SheetDescription>
            This app requires API keys to function properly. Please set up your environment variables.
          </SheetDescription>
        </SheetHeader>
        
        <div className="py-6 space-y-6">
          <div className="space-y-4">
            <h3 className="font-medium">Required API Keys</h3>
            
            <div className="space-y-3 text-sm">
              <div className="p-3 border rounded-md bg-muted/50">
                <p className="font-medium mb-1">VITE_DEEPSEEK_API_KEY</p>
                <p className="text-muted-foreground">
                  {isDeepseekKeyMissing 
                    ? "Missing. Required for AI-generated quizzes." 
                    : "Configured ✓"}
                </p>
              </div>
              
              <div className="p-3 border rounded-md bg-muted/50">
                <p className="font-medium mb-1">VITE_BREVO_API_KEY</p>
                <p className="text-muted-foreground">
                  {isBrevoKeyMissing 
                    ? "Missing. Required for email notifications." 
                    : "Configured ✓"}
                </p>
              </div>
              
              <div className="p-3 border rounded-md bg-muted/50">
                <p className="font-medium mb-1">VITE_OPENAI_API_KEY</p>
                <p className="text-muted-foreground">
                  {isOpenAIKeyMissing 
                    ? "Missing. Required for content moderation." 
                    : "Configured ✓"}
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-medium">How to Configure</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>Create a <code>.env.local</code> file in the project root</li>
              <li>Add your API keys following the format in <code>.env.example</code></li>
              <li>Restart the application for changes to take effect</li>
            </ol>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ApiKeysManager;
