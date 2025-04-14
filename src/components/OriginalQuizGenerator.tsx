
// This is a read-only file, so we'll create a wrapper component that adds our functionality
// without modifying the original file

import React from 'react';
import { default as OriginalQuizGenerator } from './OriginalQuizGenerator';

interface QuizGeneratorWrapperProps {
  initialTopic?: string;
  onQuizGenerated?: (quizId: string) => void;
}

// This is a wrapper component that adds the onQuizGenerated functionality
const QuizGenerator: React.FC<QuizGeneratorWrapperProps> = ({ initialTopic, onQuizGenerated }) => {
  // We'll use a ref to store the original handleGenerate function
  const handleQuizGenerated = (quizId: string) => {
    if (onQuizGenerated) {
      onQuizGenerated(quizId);
    }
  };
  
  // Pass our wrapper functions to the original component
  return (
    <OriginalQuizGenerator 
      initialTopic={initialTopic} 
      onQuizGenerated={handleQuizGenerated} 
    />
  );
};

export default QuizGenerator;
