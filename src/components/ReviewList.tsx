
import React from "react";
import { QuizQuestion } from "@/types/quiz";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ReviewListProps {
  questions: QuizQuestion[];
  onRemoveQuestion: (id: string) => void;
  onClearAll: () => void;
  onPracticeQuestions: (questions: QuizQuestion[]) => void;
}

const ReviewList: React.FC<ReviewListProps> = ({ 
  questions, 
  onRemoveQuestion,
  onClearAll,
  onPracticeQuestions
}) => {
  const navigate = useNavigate();

  const handlePracticeQuestions = () => {
    onPracticeQuestions(questions);
    navigate('/practice');
  };

  const handlePracticeSingleQuestion = (question: QuizQuestion) => {
    onPracticeQuestions([question]);
    navigate('/practice');
  };

  if (questions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No questions in your review list yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Review List ({questions.length})</h3>
        <div className="space-x-2">
          <Button 
            variant="default" 
            size="sm" 
            onClick={handlePracticeQuestions}
            className="text-xs"
          >
            Practice All
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onClearAll}
            className="text-xs"
          >
            Clear All
          </Button>
        </div>
      </div>

      <ScrollArea className="h-[300px] pr-4">
        <div className="space-y-3">
          {questions.map((question) => (
            <div 
              key={question.id} 
              className="border border-border rounded-lg p-4 bg-white"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 mr-4">
                  <p className="text-sm font-medium mb-2">{question.question}</p>
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      {question.type === "multiple_choice" ? "Multiple Choice" : "Fill in the Blank"}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePracticeSingleQuestion(question)}
                      className="h-6 text-xs text-blue-600 hover:text-blue-800"
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Practice
                    </Button>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveQuestion(question.id);
                  }}
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ReviewList;
