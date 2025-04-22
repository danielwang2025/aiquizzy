
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
          <p className="mt-4 text-muted-foreground">正在分析您的问题...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {selectedImage && (
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-muted p-2 text-sm font-medium">原始题目</div>
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
              <div className="bg-muted p-2 text-sm font-medium">识别文本</div>
              <div className="p-4 font-mono text-sm">
                {recognizedText}
              </div>
            </div>
          )}
          
          {solution && (
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-muted p-2 text-sm font-medium">逐步解题过程</div>
              <div className="p-4 whitespace-pre-line">
                {solution}
              </div>
            </div>
          )}
          
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              提问解题助手
            </h3>
            <p className="mb-4 text-sm text-muted-foreground">
              需要更详细的解释？向我们的AI助手提问
            </p>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="请输入您的问题..." 
                className="flex-1 px-3 py-2 rounded-md border"
              />
              <Button>提问</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SolutionDisplay;
