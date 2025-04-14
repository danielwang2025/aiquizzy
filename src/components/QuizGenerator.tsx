
// This is a wrapper component that adds functionality
// without modifying the original component

import React from 'react';
import OriginalQuizGenerator from './OriginalQuizGenerator';

interface QuizGeneratorProps {
  initialTopic?: string;
  onQuizGenerated?: (quizId: string) => void;
}

const QuizGenerator: React.FC<QuizGeneratorProps> = ({ initialTopic, onQuizGenerated }) => {
  // Handler for when a quiz is generated
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
