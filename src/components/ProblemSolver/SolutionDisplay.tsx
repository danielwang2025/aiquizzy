
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Calculator, Send } from "lucide-react";
import LoadingSpinner from '@/components/LoadingSpinner';
import { generateSolution } from '@/utils/aiSolver';
import { toast } from 'sonner';

interface SolutionDisplayProps {
  selectedImage: string | null;
  recognizedText: string | null;
  solution: string | null;
  isLoading: boolean;
  onBackClick: () => void;
  subject: string;
}

const SolutionDisplay: React.FC<SolutionDisplayProps> = ({ 
  selectedImage, 
  recognizedText, 
  solution, 
  isLoading, 
  onBackClick,
  subject 
}) => {
  const [assistantQuestion, setAssistantQuestion] = useState<string>("");
  const [assistantResponse, setAssistantResponse] = useState<string | null>(null);
  const [isAssistantLoading, setIsAssistantLoading] = useState(false);

  const handleAskAssistant = async () => {
    if (!assistantQuestion.trim() || !recognizedText) {
      toast.error("Please enter a question");
      return;
    }

    setIsAssistantLoading(true);
    try {
      // Combine the original problem with the user's question
      const combinedQuestion = `Original problem: ${recognizedText}\n\nMy question: ${assistantQuestion}`;
      
      // Use the aiSolver to generate a response
      const response = await generateSolution(combinedQuestion, subject);
      setAssistantResponse(response);
    } catch (error) {
      console.error("Error asking assistant:", error);
      toast.error("Failed to get a response from the assistant");
    } finally {
      setIsAssistantLoading(false);
    }
  };

  return (
    <div>
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-muted-foreground">Analyzing your problem...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {selectedImage && (
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-muted p-2 text-sm font-medium">Original Problem</div>
              <div className="p-4">
                <img 
                  src={selectedImage} 
                  alt="Original problem" 
                  className="object-contain max-h-40 mx-auto"
                />
              </div>
            </div>
          )}
          
          {recognizedText && (
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-muted p-2 text-sm font-medium">Recognized Text</div>
              <div className="p-4 font-mono text-sm">
                {recognizedText}
              </div>
            </div>
          )}
          
          {solution && (
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-muted p-2 text-sm font-medium">Step-by-Step Solution</div>
              <div className="p-4 whitespace-pre-line">
                {solution}
              </div>
            </div>
          )}
          
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Ask the Solution Assistant
            </h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Need more detailed explanation? Ask our AI assistant
            </p>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Enter your question..." 
                className="flex-1 px-3 py-2 rounded-md border"
                value={assistantQuestion}
                onChange={(e) => setAssistantQuestion(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAskAssistant()}
              />
              <Button 
                onClick={handleAskAssistant}
                disabled={isAssistantLoading}
              >
                {isAssistantLoading ? (
                  <>
                    <LoadingSpinner size="sm" /> 
                    <span className="ml-2">Processing...</span>
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Ask
                  </>
                )}
              </Button>
            </div>
            
            {assistantResponse && (
              <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg border">
                <h4 className="font-medium mb-2">Assistant Response:</h4>
                <div className="whitespace-pre-line text-sm">
                  {assistantResponse}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SolutionDisplay;
