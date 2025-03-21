
import React, { useState, useEffect } from "react";
import { QuizQuestion as QuizQuestionType } from "@/types/quiz";
import { cn } from "@/lib/utils";

interface QuizQuestionProps {
  question: QuizQuestionType;
  userAnswer: string | number | null;
  onAnswer: (answer: string | number) => void;
  showResult: boolean;
  index: number;
}

const QuizQuestion: React.FC<QuizQuestionProps> = ({
  question,
  userAnswer,
  onAnswer,
  showResult,
  index,
}) => {
  const [animatedIn, setAnimatedIn] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedIn(true);
    }, 50 * index);

    return () => clearTimeout(timer);
  }, [index]);

  const isCorrect = showResult && userAnswer === question.correctAnswer;
  const isIncorrect = showResult && userAnswer !== null && userAnswer !== question.correctAnswer;

  return (
    <div 
      className={cn(
        "bg-white rounded-xl p-6 shadow-sm border border-border transition-all duration-300 mb-6",
        "transform opacity-0 translate-y-4",
        animatedIn && "opacity-100 translate-y-0",
        showResult && isCorrect && "border-l-4 border-l-green-500",
        showResult && isIncorrect && "border-l-4 border-l-red-500"
      )}
    >
      <div className="flex items-center gap-3 mb-3">
        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-medium text-sm">
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
                  "relative w-5 h-5 rounded-full border border-primary/30 flex-shrink-0 mt-0.5",
                  "transition-all duration-300 hover:border-primary/70",
                  userAnswer === i && "bg-primary border-primary",
                  showResult && question.correctAnswer === i && "border-green-500 bg-green-500/20",
                  showResult && userAnswer === i && userAnswer !== question.correctAnswer && "border-red-500 bg-red-500/20"
                )}
                onClick={() => !showResult && onAnswer(i)}
                disabled={showResult}
              >
                {userAnswer === i && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="w-2 h-2 rounded-full bg-white" />
                  </span>
                )}
              </button>
              <span className="text-foreground">{option}</span>
            </div>
          ))}
        </div>
      )}

      {question.type === "fill_in" && (
        <div className="mt-4 pl-11">
          <input
            type="text"
            className={cn(
              "w-full p-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30",
              showResult && isCorrect && "border-green-500 ring-green-500/30",
              showResult && isIncorrect && "border-red-500 ring-red-500/30"
            )}
            placeholder="Type your answer here..."
            value={userAnswer !== null ? String(userAnswer) : ""}
            onChange={(e) => !showResult && onAnswer(e.target.value)}
            disabled={showResult}
          />
        </div>
      )}

      {showResult && (
        <div className={cn(
          "mt-4 p-3 rounded-md transition-all duration-300 animate-fade-in",
          isCorrect ? "bg-green-500/10 text-green-800" : "bg-red-500/10 text-red-800"
        )}>
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
      )}
    </div>
  );
};

export default QuizQuestion;
