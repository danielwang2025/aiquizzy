
import React from "react";
import { DisputedQuestion } from "@/types/quiz";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  removeDisputedQuestion, 
  clearDisputedQuestions 
} from "@/utils/historyService";
import { toast } from "sonner";

interface DisputedQuestionsProps {
  questions: DisputedQuestion[];
  onUpdate: () => void;
}

const DisputedQuestions: React.FC<DisputedQuestionsProps> = ({ 
  questions,
  onUpdate
}) => {
  const handleRemoveDispute = (id: string) => {
    removeDisputedQuestion(id);
    toast.success("Disputed question removed");
    onUpdate();
  };
  
  const handleClearAll = () => {
    if (confirm("Are you sure you want to clear all disputed questions?")) {
      clearDisputedQuestions();
      toast.success("All disputed questions cleared");
      onUpdate();
    }
  };
  
  if (questions.length === 0) {
    return (
      <div className="text-center p-6">
        <p className="text-muted-foreground">No disputed questions yet.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Disputed Questions ({questions.length})</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleClearAll}
          disabled={questions.length === 0}
        >
          Clear All
        </Button>
      </div>
      
      <ScrollArea className="h-[calc(100vh-250px)]">
        <div className="space-y-4 pr-4">
          {questions.map((item) => (
            <Card key={item.questionId} className="border-l-4 border-l-amber-500">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base">{item.question.question}</CardTitle>
                    <CardDescription className="text-xs mt-1">
                      Disputed on {new Date(item.dateDisputed).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <Badge variant={item.status === 'pending' ? "outline" : "secondary"}>
                    {item.status === 'pending' ? 'Pending' : 'Reviewed'}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="pb-2">
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Your answer: </span>
                    <span>
                      {item.question.type === 'multiple_choice' && item.question.options
                        ? item.question.options[item.userAnswer as number] || 'Not answered'
                        : item.userAnswer !== null ? String(item.userAnswer) : 'Not answered'
                      }
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Correct answer (disputed): </span>
                    <span>
                      {item.question.type === 'multiple_choice' && item.question.options
                        ? item.question.options[item.question.correctAnswer as number]
                        : item.question.correctAnswer
                      }
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Dispute reason: </span>
                    <p className="mt-1 p-2 bg-muted rounded-md text-sm">{item.disputeReason}</p>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="pt-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleRemoveDispute(item.questionId)}
                  className="ml-auto"
                >
                  Remove
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default DisputedQuestions;
