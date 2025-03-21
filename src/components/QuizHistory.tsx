
import React from "react";
import { QuizAttempt } from "@/types/quiz";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface QuizHistoryProps {
  attempts: QuizAttempt[];
  onViewAttempt: (attempt: QuizAttempt) => void;
  onClearHistory: () => void;
}

const QuizHistory: React.FC<QuizHistoryProps> = ({ 
  attempts, 
  onViewAttempt,
  onClearHistory
}) => {
  if (attempts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No quiz history yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Quiz History</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onClearHistory}
          className="text-xs"
        >
          Clear History
        </Button>
      </div>

      <ScrollArea className="h-[300px] pr-4">
        <div className="space-y-3">
          {attempts.map((attempt) => (
            <div 
              key={attempt.id} 
              className="border border-border rounded-lg p-4 bg-white hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => onViewAttempt(attempt)}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-medium truncate max-w-[70%]">
                  {attempt.objectives}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(attempt.date), { addSuffix: true })}
                </span>
              </div>
              <div className="flex items-center text-sm">
                <div className="bg-secondary/50 px-2 py-1 rounded text-xs mr-2">
                  {attempt.questions.length} questions
                </div>
                <div className={`px-2 py-1 rounded text-xs ${
                  attempt.result.score >= 70 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                }`}>
                  Score: {attempt.result.score}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default QuizHistory;
