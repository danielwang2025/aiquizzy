
import React, { useState, useEffect } from "react";
import { QuizQuestion } from "@/types/quiz";
import DisputeForm from "./DisputeForm";
import { Button } from "@/components/ui/button";
import { isQuestionDisputed } from "@/utils/historyService";

interface QuizQuestionProps {
  question: QuizQuestion;
  userAnswer: string | number | null;
  onAnswer: (answer: string | number) => void;
  showResult?: boolean;
  index?: number;
}

const QuizQuestionComponent: React.FC<QuizQuestionProps> = ({
  question,
  userAnswer,
  onAnswer,
  showResult = false,
  index = 0,
}) => {
  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const [isAlreadyDisputed, setIsAlreadyDisputed] = useState(false);
  
  useEffect(() => {
    // Check if question is already disputed
    const checkIfDisputed = async () => {
      try {
        const disputed = await isQuestionDisputed(question.id);
        setIsAlreadyDisputed(disputed);
      } catch (error) {
        console.error("Error checking if question is disputed:", error);
      }
    };
    
    checkIfDisputed();
  }, [question.id]);
  
  const handleDisputeClick = () => {
    setShowDisputeForm(true);
  };
  
  const handleCloseDispute = () => {
    setShowDisputeForm(false);
  };
  
  const handleDisputed = (questionId: string) => {
    setIsAlreadyDisputed(true);
  };
  
  return (
    <div className="space-y-4">
      {question.type === "multiple_choice" && (
        <div className="space-y-2">
          {question.options.map((option, optionIndex) => (
            <div key={optionIndex}>
              <Button
                variant={
                  showResult
                    ? Number(question.correctAnswer) === optionIndex
                      ? "default"
                      : Number(userAnswer) === optionIndex
                      ? "destructive"
                      : "outline"
                    : userAnswer === optionIndex
                    ? "default"
                    : "outline"
                }
                className="w-full justify-start text-left"
                onClick={() => !showResult && onAnswer(optionIndex)}
                disabled={showResult}
              >
                {option}
              </Button>
            </div>
          ))}
        </div>
      )}

      {question.type === "fill_in" && (
        <div>
          <input
            type="text"
            className="w-full p-2 border rounded"
            placeholder="Your answer"
            value={userAnswer !== null ? String(userAnswer) : ""}
            onChange={(e) => !showResult && onAnswer(e.target.value)}
            disabled={showResult}
          />
        </div>
      )}

      {showResult && question.explanation && (
        <div className="mt-4 p-4 bg-blue-50 rounded-md">
          <h4 className="font-semibold mb-2">Explanation:</h4>
          <p>{question.explanation}</p>
        </div>
      )}

      {showResult && !isAlreadyDisputed && (
        <div className="mt-2 flex justify-end">
          <Button 
            variant="outline"
            size="sm"
            onClick={handleDisputeClick}
          >
            Dispute Question
          </Button>
        </div>
      )}

      {showResult && isAlreadyDisputed && (
        <div className="mt-2 text-sm text-right text-muted-foreground">
          Question has been disputed
        </div>
      )}

      <DisputeForm
        question={question}
        userAnswer={userAnswer}
        isOpen={showDisputeForm}
        onClose={handleCloseDispute}
        onDisputed={handleDisputed}
      />
    </div>
  );
};

export default QuizQuestionComponent;
