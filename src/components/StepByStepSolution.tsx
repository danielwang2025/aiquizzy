
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";

interface Step {
  text: string;
  explanation: string;
}

interface StepByStepSolutionProps {
  solution: {
    steps: Step[];
  };
}

const StepByStepSolution: React.FC<StepByStepSolutionProps> = ({ solution }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [expandedSteps, setExpandedSteps] = useState<number[]>([0]); // Start with first step expanded
  
  const toggleStepExpansion = (index: number) => {
    setExpandedSteps(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index) 
        : [...prev, index]
    );
  };
  
  const isStepExpanded = (index: number) => expandedSteps.includes(index);
  
  const showNextStep = () => {
    if (currentStepIndex < solution.steps.length - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      setExpandedSteps(prev => [...prev, nextIndex]);
    }
  };
  
  const showAllSteps = () => {
    setCurrentStepIndex(solution.steps.length - 1);
    setExpandedSteps(Array.from({ length: solution.steps.length }, (_, i) => i));
  };
  
  return (
    <Card className="bg-white/70 backdrop-blur-md shadow-lg border-dashed">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Step-by-Step Solution</span>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={showAllSteps}
              disabled={currentStepIndex === solution.steps.length - 1}
            >
              Show All Steps
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {solution.steps.slice(0, currentStepIndex + 1).map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="border rounded-lg overflow-hidden"
          >
            <div 
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50"
              onClick={() => toggleStepExpansion(index)}
            >
              <div className="flex items-center">
                <div className="h-6 w-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-medium mr-3">
                  {index + 1}
                </div>
                <div 
                  className="text-sm font-medium"
                  dangerouslySetInnerHTML={{ __html: step.text }}
                />
              </div>
              {isStepExpanded(index) ? (
                <ChevronDown className="h-5 w-5 text-slate-400" />
              ) : (
                <ChevronRight className="h-5 w-5 text-slate-400" />
              )}
            </div>
            
            {isStepExpanded(index) && (
              <div className="p-4 pt-0 border-t">
                <div 
                  className="bg-slate-50 p-3 rounded-md text-sm"
                  dangerouslySetInnerHTML={{ __html: step.explanation }}
                />
              </div>
            )}
          </motion.div>
        ))}
        
        {currentStepIndex < solution.steps.length - 1 && (
          <Button 
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
            onClick={showNextStep}
          >
            Next Step
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default StepByStepSolution;
