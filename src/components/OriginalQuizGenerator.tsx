
// This is a placeholder for the original quiz generator component
// In a real app, this would be the actual component that we don't want to modify directly

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface OriginalQuizGeneratorProps {
  initialTopic?: string;
  onQuizGenerated?: (quizId: string) => void;
}

const OriginalQuizGenerator: React.FC<OriginalQuizGeneratorProps> = ({ 
  initialTopic = "", 
  onQuizGenerated 
}) => {
  const [topic, setTopic] = useState(initialTopic);
  const [generating, setGenerating] = useState(false);
  
  const handleGenerate = async () => {
    if (!topic.trim()) {
      return;
    }
    
    setGenerating(true);
    
    // Simulate quiz generation with a timeout
    setTimeout(() => {
      // Generate a mock quiz ID
      const mockQuizId = `quiz_${Math.random().toString(36).substring(2, 15)}`;
      
      // Call the callback if provided
      if (onQuizGenerated) {
        onQuizGenerated(mockQuizId);
      }
      
      setGenerating(false);
    }, 2000);
  };
  
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Generate Quiz</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Quiz Topic</label>
          <Input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter a topic for your quiz"
            className="w-full"
          />
        </div>
        
        <div>
          <Button 
            onClick={handleGenerate} 
            disabled={!topic.trim() || generating}
            className="w-full"
          >
            {generating ? "Generating..." : "Generate Quiz"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OriginalQuizGenerator;
