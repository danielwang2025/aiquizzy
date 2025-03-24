
import React, { useState } from 'react';
import { CheckCircle, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { motion } from 'framer-motion';

type QuizExampleCardProps = {
  type: string;
  question: string;
} & (
  | { type: "Multiple Choice"; options: string[]; correctAnswer: string }
  | { type: "Fill in the Blank"; answer: string }
);

export const QuizExampleCard: React.FC<QuizExampleCardProps> = (props) => {
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [showHint, setShowHint] = useState(false);

  const toggleAnswer = () => {
    setShowAnswer(!showAnswer);
    setShowHint(false);
  };

  const handleOptionSelect = (option: string) => {
    if (showAnswer) return;
    setSelectedOption(option);
    if (props.type === "Multiple Choice" && option === props.correctAnswer) {
      setTimeout(() => setShowAnswer(true), 500);
    }
  };

  const handleFillInSubmit = () => {
    if (props.type === "Fill in the Blank") {
      setTimeout(() => setShowAnswer(true), 300);
    }
  };

  const isCorrectOption = (option: string) => {
    return props.type === "Multiple Choice" && option === props.correctAnswer;
  };

  const isSelectedWrong = (option: string) => {
    return props.type === "Multiple Choice" && selectedOption === option && !isCorrectOption(option);
  };

  const showNotSureHint = () => {
    setShowHint(true);
  };

  const getHint = () => {
    if (props.type === "Multiple Choice") {
      return "Try to think about the most logical option based on the context...";
    } else {
      return `The answer starts with "${props.answer.charAt(0)}" and has ${props.answer.length} characters...`;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl p-6 shadow-md border border-border h-full"
    >
      <div className="mb-5 flex justify-between items-center">
        <span className="px-3 py-1.5 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
          {props.type}
        </span>
        <div className="flex space-x-2">
          {!showAnswer && !showHint && (
            <Button 
              onClick={showNotSureHint} 
              variant="outline"
              size="sm"
              className="text-muted-foreground"
            >
              <HelpCircle className="mr-1 h-3.5 w-3.5" />
              Not Sure
            </Button>
          )}
          {!showAnswer && (
            <Button 
              onClick={toggleAnswer}
              variant="ghost"
              size="sm"
              className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
            >
              Show Answer
            </Button>
          )}
        </div>
      </div>

      <h3 className="text-xl font-medium mb-6 leading-relaxed tracking-wide">
        {props.question}
      </h3>

      {showHint && !showAnswer && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.3 }}
          className="mb-4 p-3 border border-amber-200 bg-amber-50 rounded-lg"
        >
          <p className="text-amber-800">
            <strong>Hint:</strong> {getHint()}
          </p>
        </motion.div>
      )}

      {props.type === "Multiple Choice" && (
        <div className="space-y-3 mt-5">
          {props.options.map((option, i) => (
            <motion.button
              key={i}
              className={cn(
                "w-full text-left p-4 rounded-lg border-2 transition-all duration-300",
                "hover:border-blue-300 hover:bg-blue-50/50",
                showAnswer && isCorrectOption(option) && "border-green-500 bg-green-50",
                showAnswer && isSelectedWrong(option) && "border-red-300 bg-red-50",
                selectedOption === option && !showAnswer && "border-blue-500 bg-blue-50",
                !selectedOption && !showAnswer && "hover:border-blue-300 hover:bg-blue-50 border-gray-200"
              )}
              onClick={() => handleOptionSelect(option)}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="flex items-start">
                <div className={cn(
                  "w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center mr-3 border-2 transition-colors",
                  selectedOption === option ? "bg-blue-500 border-blue-500 text-white" : "border-gray-300",
                  showAnswer && isCorrectOption(option) && "bg-green-500 border-green-500 text-white",
                  showAnswer && isSelectedWrong(option) && "bg-red-400 border-red-400 text-white"
                )}>
                  {showAnswer && isCorrectOption(option) ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <span className="text-sm font-medium">{String.fromCharCode(65 + i)}</span>
                  )}
                </div>
                <span className="font-medium leading-relaxed">{option}</span>
              </div>
            </motion.button>
          ))}
        </div>
      )}

      {props.type === "Fill in the Blank" && (
        <div className="space-y-4 mt-5">
          <div className="relative">
            <input
              type="text"
              className={cn(
                "w-full p-4 border-2 rounded-lg transition-all",
                "focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none",
                "text-lg font-medium",
                showAnswer && userAnswer.toLowerCase() === props.answer.toLowerCase() ? "border-green-500 ring-green-500/50" : "",
                showAnswer && userAnswer.toLowerCase() !== props.answer.toLowerCase() ? "border-red-500 ring-red-500/50" : ""
              )}
              placeholder="Type your answer..."
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              disabled={showAnswer}
            />
            <Button
              onClick={handleFillInSubmit}
              className={cn(
                "absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-md",
                "bg-blue-100 text-blue-700 hover:bg-blue-200 font-medium"
              )}
              disabled={!userAnswer || showAnswer}
            >
              Submit
            </Button>
          </div>
        </div>
      )}

      {showAnswer && (
        <motion.div 
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className={cn(
            "mt-5 p-4 rounded-lg animate-fade-in",
            "bg-blue-50 border border-blue-100"
          )}
        >
          <p className="font-medium text-blue-800 mb-2">Answer Explanation:</p>
          <p className="text-blue-700 leading-relaxed">
            {props.type === "Multiple Choice" ? 
              `The correct answer is: ${props.correctAnswer}. This is because...` : 
              `The correct answer is: ${props.answer}. For fill-in questions, precision is important...`}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};
