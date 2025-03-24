
import React, { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type QuizExampleCardProps = {
  type: string;
  question: string;
} & (
  | { type: "选择题"; options: string[]; correctAnswer: string }
  | { type: "填空题"; answer: string }
);

export const QuizExampleCard: React.FC<QuizExampleCardProps> = (props) => {
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [userAnswer, setUserAnswer] = useState('');

  const toggleAnswer = () => {
    setShowAnswer(!showAnswer);
  };

  const handleOptionSelect = (option: string) => {
    if (showAnswer) return;
    setSelectedOption(option);
    if (props.type === "选择题" && option === props.correctAnswer) {
      setTimeout(() => setShowAnswer(true), 500);
    }
  };

  const handleFillInSubmit = () => {
    if (props.type === "填空题") {
      setTimeout(() => setShowAnswer(true), 300);
    }
  };

  const isCorrectOption = (option: string) => {
    return props.type === "选择题" && option === props.correctAnswer;
  };

  const isSelectedWrong = (option: string) => {
    return props.type === "选择题" && selectedOption === option && !isCorrectOption(option);
  };

  const getTypeLabel = () => {
    return props.type === "选择题" ? "Multiple Choice" : "Fill in the Blank";
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-md border border-border h-full">
      <div className="mb-4 flex justify-between items-center">
        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
          {getTypeLabel()}
        </span>
        {!showAnswer && (
          <button 
            onClick={toggleAnswer} 
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Show Answer
          </button>
        )}
      </div>

      <h3 className="text-lg font-medium mb-6">
        {props.question}
      </h3>

      {props.type === "选择题" && (
        <div className="space-y-3">
          {props.options.map((option, i) => (
            <button
              key={i}
              className={cn(
                "w-full text-left p-3 rounded-lg border transition-all",
                showAnswer && isCorrectOption(option) && "border-green-500 bg-green-50",
                showAnswer && isSelectedWrong(option) && "border-red-300 bg-red-50",
                selectedOption === option && !showAnswer && "border-blue-500 bg-blue-50",
                !selectedOption && !showAnswer && "hover:border-blue-300 hover:bg-blue-50 border-gray-200"
              )}
              onClick={() => handleOptionSelect(option)}
            >
              <div className="flex items-start">
                <div className={cn(
                  "w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center mr-2 border",
                  selectedOption === option ? "bg-blue-500 border-blue-500 text-white" : "border-gray-300",
                  showAnswer && isCorrectOption(option) && "bg-green-500 border-green-500 text-white",
                  showAnswer && isSelectedWrong(option) && "bg-red-400 border-red-400 text-white"
                )}>
                  {showAnswer && isCorrectOption(option) ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <span className="text-sm">{String.fromCharCode(65 + i)}</span>
                  )}
                </div>
                <span>{option}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {props.type === "填空题" && (
        <div className="space-y-4">
          <div className="relative">
            <input
              type="text"
              className={cn(
                "w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all",
                showAnswer && userAnswer.toLowerCase() === props.answer.toLowerCase() ? "border-green-500 ring-green-500/50" : "",
                showAnswer && userAnswer.toLowerCase() !== props.answer.toLowerCase() ? "border-red-500 ring-red-500/50" : ""
              )}
              placeholder="Type your answer..."
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              disabled={showAnswer}
            />
            <button
              onClick={handleFillInSubmit}
              className={cn(
                "absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 rounded-md text-sm font-medium",
                "bg-blue-100 text-blue-700 hover:bg-blue-200"
              )}
              disabled={!userAnswer || showAnswer}
            >
              Submit
            </button>
          </div>
        </div>
      )}

      {showAnswer && (
        <div className={cn(
          "mt-4 p-4 rounded-lg animate-fade-in",
          "bg-blue-50 border border-blue-100"
        )}>
          <p className="font-medium text-blue-800 mb-1">Answer Explanation:</p>
          <p className="text-blue-700">
            {props.type === "选择题" ? 
              `The correct answer is: ${props.correctAnswer}. This is because...` : 
              `The correct answer is: ${props.answer}. For fill-in questions, precision is important...`}
          </p>
        </div>
      )}
    </div>
  );
};
