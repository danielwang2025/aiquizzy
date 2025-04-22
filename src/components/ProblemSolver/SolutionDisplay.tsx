
import React from 'react';
import { Button } from "@/components/ui/button";
import { Calculator } from "lucide-react";
import LoadingSpinner from '@/components/LoadingSpinner';

interface SolutionDisplayProps {
  selectedImage: string | null;
  recognizedText: string | null;
  solution: string | null;
  isLoading: boolean;
  onBackClick: () => void;
}

const SolutionDisplay: React.FC<SolutionDisplayProps> = ({ 
  selectedImage, 
  recognizedText, 
  solution, 
  isLoading, 
  onBackClick 
}) => {
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
              />
              <Button>Ask</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SolutionDisplay;
