
import React, { useState, useEffect } from "react";
import { QuizQuestion as QuizQuestionType } from "@/types/quiz";
import { cn } from "@/lib/utils";
import DisputeForm from "./DisputeForm";
import { isQuestionDisputed } from "@/utils/historyService";
import { CheckCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface QuizQuestionProps {
  question: QuizQuestionType;
  userAnswer: string | number | null;
  onAnswer: (answer: string | number) => void;
  showResult: boolean;
  index: number;
  onDisputeQuestion?: (questionId: string) => void;
}

const QuizQuestion: React.FC<QuizQuestionProps> = ({
  question,
  userAnswer,
  onAnswer,
  showResult,
  index,
  onDisputeQuestion,
}) => {
  const [animatedIn, setAnimatedIn] = useState(false);
  const [isDisputeOpen, setIsDisputeOpen] = useState(false);
  const [isAlreadyDisputed, setIsAlreadyDisputed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedIn(true);
    }, 50 * index);

    setIsAlreadyDisputed(isQuestionDisputed(question.id));

    return () => clearTimeout(timer);
  }, [index, question.id]);

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

  const formatFeedback = () => {
    if (!showResult) return null;
    
    if (isCorrect) {
      return (
        <div>
          <p className="font-medium mb-2 text-lg">Correct!</p>
          <p className="text-base leading-relaxed">
            {question.explanation || "Great job! You've selected the correct answer."}
          </p>
        </div>
      );
    } else {
      let correctAnswerText = "";
      
      if (question.type === "multiple_choice" && question.options) {
        correctAnswerText = "The correct option was one of the choices provided.";
      } else {
        const answer = String(question.correctAnswer);
        correctAnswerText = `The correct answer is a term with ${answer.length} characters.`;
      }
      
      return (
        <div>
          <p className="font-medium mb-2 text-lg">Incorrect</p>
          <p className="text-base leading-relaxed">
            {correctAnswerText} {question.explanation || "Review the related concepts to understand this better."}
          </p>
        </div>
      );
    }
  };

  return (
    <motion.div 
      className={cn(
        "bg-card rounded-xl p-6 shadow-sm border border-border transition-all duration-300 mb-6",
        "transform text-foreground",
        animatedIn && "opacity-100 translate-y-0",
        showResult && isCorrect && "border-l-4 border-l-green-500",
        showResult && isIncorrect && "border-l-4 border-l-red-500",
        isAlreadyDisputed && "opacity-50"
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: animatedIn ? 1 : 0, y: animatedIn ? 0 : 20 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-medium">
            {index + 1}
          </span>
          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
            {question.type === "multiple_choice" ? "Multiple Choice" : "Fill in the Blank"}
          </span>
        </div>
      </div>

      <h3 className="text-xl font-medium mb-5 leading-relaxed tracking-wide pl-11">
        {question.question}
      </h3>

      {question.type === "multiple_choice" && question.options && (
        <div className="space-y-3 mt-4 pl-11">
          {question.options.map((option, i) => (
            <motion.div 
              key={i} 
              className="flex items-start gap-2"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <button
                className={cn(
                  "relative w-6 h-6 rounded-full border-2 border-primary/30 flex-shrink-0 mt-0.5",
                  "transition-all duration-300 hover:border-primary/70",
                  userAnswer === i && "bg-primary border-primary",
                  showResult && question.correctAnswer === i && "border-green-500 bg-green-500/20",
                  showResult && userAnswer === i && userAnswer !== question.correctAnswer && "border-red-500 bg-red-500/20"
                )}
                onClick={() => !showResult && onAnswer(i)}
                disabled={showResult || isAlreadyDisputed}
              >
                {userAnswer === i && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="w-2.5 h-2.5 rounded-full bg-white" />
                  </span>
                )}
                {showResult && question.correctAnswer === i && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  </span>
                )}
              </button>
              <motion.button
                className={cn(
                  "text-foreground p-2 rounded-md w-full text-left transition-colors",
                  "hover:bg-blue-50/50",
                  showResult && question.correctAnswer === i && "font-medium text-green-700",
                  showResult && userAnswer === i && userAnswer !== question.correctAnswer && "text-red-700"
                )}
                onClick={() => !showResult && !isAlreadyDisputed && onAnswer(i)}
                disabled={showResult || isAlreadyDisputed}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <span className="leading-relaxed">{option}</span>
              </motion.button>
            </motion.div>
          ))}
        </div>
      )}

      {question.type === "fill_in" && (
        <div className="mt-4 pl-11">
          <input
            type="text"
            className={cn(
              "w-full p-3 border-2 border-border rounded-md",
              "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary",
              "text-lg font-medium transition-all",
              showResult && isCorrect && "border-green-500 ring-green-500/30",
              showResult && isIncorrect && "border-red-500 ring-red-500/30"
            )}
            placeholder="Type your answer here..."
            value={userAnswer !== null ? String(userAnswer) : ""}
            onChange={(e) => !showResult && onAnswer(e.target.value)}
            disabled={showResult || isAlreadyDisputed}
          />
        </div>
      )}

      <AnimatePresence>
        {showResult && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className={cn(
              "mt-5 p-4 rounded-md ml-11",
              isCorrect ? "bg-green-50 border border-green-100" : "bg-red-50 border border-red-100"
            )}
          >
            <div className="flex justify-between items-start">
              {formatFeedback()}
              
              {!isAlreadyDisputed && onDisputeQuestion && (
                <Button
                  onClick={handleOpenDispute}
                  variant="outline"
                  size="sm"
                  className={cn(
                    "text-xs ml-2 transition-colors",
                    isCorrect ? "bg-white/30 hover:bg-white/50 text-green-800" : "bg-white/30 hover:bg-white/50 text-red-800"
                  )}
                >
                  Dispute
                </Button>
              )}
              
              {isAlreadyDisputed && (
                <span className="text-xs bg-white/30 px-2 py-1 rounded ml-2">
                  Disputed
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {showResult && onDisputeQuestion && (
        <DisputeForm
          question={question}
          userAnswer={userAnswer}
          isOpen={isDisputeOpen}
          onClose={handleCloseDispute}
          onDisputed={handleDisputed}
        />
      )}
    </motion.div>
  );
};

export default QuizQuestion;
