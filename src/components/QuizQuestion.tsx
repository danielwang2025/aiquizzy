
import React, { useState, useEffect } from "react";
import { QuizQuestion as QuizQuestionType } from "@/types/quiz";
import { cn } from "@/lib/utils";
import DisputeForm from "./DisputeForm";
import { isQuestionDisputed } from "@/utils/historyService";
import { motion } from "framer-motion";

interface QuizQuestionProps {
  question: QuizQuestionType;
  userAnswer: string | number | null;
  onAnswer: (answer: string | number) => void;
  showResult: boolean;
  index: number;
  onDisputeQuestion?: (questionId: string) => void;
  nightMode?: boolean;
}

const QuizQuestion: React.FC<QuizQuestionProps> = ({
  question,
  userAnswer,
  onAnswer,
  showResult,
  index,
  onDisputeQuestion,
  nightMode = false,
}) => {
  const [animatedIn, setAnimatedIn] = useState(false);
  const [isDisputeOpen, setIsDisputeOpen] = useState(false);
  const [isAlreadyDisputed, setIsAlreadyDisputed] = useState(false);
  const [showCorrectAnimation, setShowCorrectAnimation] = useState(false);
  const [showIncorrectAnimation, setShowIncorrectAnimation] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedIn(true);
    }, 50 * index);

    // Check if this question is already disputed
    setIsAlreadyDisputed(isQuestionDisputed(question.id));

    return () => clearTimeout(timer);
  }, [index, question.id]);

  useEffect(() => {
    if (showResult) {
      const isCorrect = userAnswer === question.correctAnswer;
      if (isCorrect) {
        setShowCorrectAnimation(true);
        setTimeout(() => setShowCorrectAnimation(false), 1000);
      } else if (userAnswer !== null) {
        setShowIncorrectAnimation(true);
        setTimeout(() => setShowIncorrectAnimation(false), 1000);
      }
    }
  }, [showResult, userAnswer, question.correctAnswer]);

  const isCorrect = showResult && userAnswer === question.correctAnswer;
  const isIncorrect = showResult && userAnswer !== null && userAnswer !== question.correctAnswer;

  const handleOpenDispute = () => {
    setIsDisputeOpen(true);
  };

  const handleCloseDispute = () => {
    setIsDisputeOpen(false);
  };

  const handleDisputed = (questionId: string) => {
    setIsAlreadyDisputed(true);
    if (onDisputeQuestion) {
      onDisputeQuestion(questionId);
    }
  };

  return (
    <div 
      className={cn(
        "rounded-xl p-6 shadow-sm border transition-all duration-300 mb-6",
        "transform opacity-0 translate-y-4",
        animatedIn && "opacity-100 translate-y-0",
        showResult && isCorrect && "border-l-4 border-l-green-500",
        showResult && isIncorrect && "border-l-4 border-l-red-500",
        isAlreadyDisputed && "opacity-50",
        showCorrectAnimation && "animate-pulse border-green-500",
        showIncorrectAnimation && "animate-pulse border-red-500",
        nightMode 
          ? "bg-gray-800 border-gray-700 text-white" 
          : "bg-white border-border"
      )}
    >
      <div className="flex items-center gap-3 mb-3">
        <span className={cn(
          "flex items-center justify-center w-8 h-8 rounded-full font-medium text-sm",
          nightMode ? "bg-gray-700 text-white" : "bg-primary/10 text-primary"
        )}>
          {index + 1}
        </span>
        <h3 className="text-lg font-medium">{question.question}</h3>
      </div>

      {question.type === "multiple_choice" && question.options && (
        <div className="space-y-3 mt-4 pl-11">
          {question.options.map((option, i) => (
            <div key={i} className="flex items-start gap-2">
              <button
                className={cn(
                  "relative w-5 h-5 rounded-full border flex-shrink-0 mt-0.5",
                  "transition-all duration-300",
                  userAnswer === i && "bg-primary border-primary",
                  showResult && question.correctAnswer === i && "border-green-500 bg-green-500/20",
                  showResult && userAnswer === i && userAnswer !== question.correctAnswer && "border-red-500 bg-red-500/20",
                  nightMode 
                    ? "border-gray-500 hover:border-gray-400" 
                    : "border-primary/30 hover:border-primary/70"
                )}
                onClick={() => !showResult && onAnswer(i)}
                disabled={showResult || isAlreadyDisputed}
              >
                {userAnswer === i && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="w-2 h-2 rounded-full bg-white" />
                  </span>
                )}
              </button>
              <span className={nightMode ? "text-gray-200" : "text-foreground"}>{option}</span>
            </div>
          ))}
        </div>
      )}

      {question.type === "fill_in" && (
        <div className="mt-4 pl-11">
          <input
            type="text"
            className={cn(
              "w-full p-2 border rounded-md focus:outline-none focus:ring-2",
              showResult && isCorrect && "border-green-500 ring-green-500/30",
              showResult && isIncorrect && "border-red-500 ring-red-500/30",
              nightMode 
                ? "bg-gray-700 border-gray-600 text-white focus:ring-blue-500/30" 
                : "border-border focus:ring-primary/30"
            )}
            placeholder="Type your answer here..."
            value={userAnswer !== null ? String(userAnswer) : ""}
            onChange={(e) => !showResult && onAnswer(e.target.value)}
            disabled={showResult || isAlreadyDisputed}
          />
        </div>
      )}

      {showResult && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={cn(
            "mt-4 p-3 rounded-md transition-all duration-300",
            isCorrect 
              ? nightMode ? "bg-green-900/30 text-green-300" : "bg-green-500/10 text-green-800"
              : nightMode ? "bg-red-900/30 text-red-300" : "bg-red-500/10 text-red-800"
          )}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="font-medium mb-1">
                {isCorrect ? "Correct!" : "Incorrect!"}
              </p>
              <p className="text-sm">
                {isCorrect 
                  ? question.explanation 
                  : `The correct answer is: ${
                      question.type === "multiple_choice" && question.options
                        ? question.options[question.correctAnswer as number]
                        : question.correctAnswer
                    }. ${question.explanation || ""}`
                }
              </p>
            </div>
            
            {!isAlreadyDisputed && onDisputeQuestion && (
              <button
                onClick={handleOpenDispute}
                className={cn(
                  "text-xs px-2 py-1 rounded text-current ml-2 transition-colors",
                  nightMode ? "bg-gray-700/50 hover:bg-gray-700" : "bg-white/30 hover:bg-white/50"
                )}
              >
                Dispute
              </button>
            )}
            
            {isAlreadyDisputed && (
              <span className={cn(
                "text-xs px-2 py-1 rounded ml-2",
                nightMode ? "bg-gray-700/50" : "bg-white/30"
              )}>
                Disputed
              </span>
            )}
          </div>
        </motion.div>
      )}

      {/* Dispute Form Dialog */}
      {showResult && onDisputeQuestion && (
        <DisputeForm
          question={question}
          userAnswer={userAnswer}
          isOpen={isDisputeOpen}
          onClose={handleCloseDispute}
          onDisputed={handleDisputed}
        />
      )}
    </div>
  );
};

export default QuizQuestion;
