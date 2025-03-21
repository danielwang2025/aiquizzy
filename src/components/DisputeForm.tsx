
import React, { useState } from "react";
import { QuizQuestion } from "@/types/quiz";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { addDisputedQuestion } from "@/utils/historyService";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DisputeFormProps {
  question: QuizQuestion;
  userAnswer: string | number | null;
  isOpen: boolean;
  onClose: () => void;
  onDisputed: (questionId: string) => void;
}

const DisputeForm: React.FC<DisputeFormProps> = ({
  question,
  userAnswer,
  isOpen,
  onClose,
  onDisputed,
}) => {
  const [reason, setReason] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (reason.trim() === "") {
      toast.error("Please provide a reason for your dispute");
      return;
    }
    
    addDisputedQuestion(question, userAnswer, reason);
    toast.success("Question disputed successfully");
    onDisputed(question.id);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Dispute Question</DialogTitle>
          <DialogDescription>
            If you believe the answer is incorrect or the question is problematic, please explain why.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h4 className="font-medium">Question:</h4>
              <p className="text-sm">{question.question}</p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Your answer:</h4>
              <p className="text-sm">
                {question.type === 'multiple_choice' && question.options
                  ? userAnswer !== null 
                    ? question.options[userAnswer as number] 
                    : 'Not answered'
                  : userAnswer !== null 
                    ? String(userAnswer) 
                    : 'Not answered'
                }
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Correct answer (according to system):</h4>
              <p className="text-sm">
                {question.type === 'multiple_choice' && question.options
                  ? question.options[question.correctAnswer as number]
                  : question.correctAnswer
                }
              </p>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="dispute-reason" className="block text-sm font-medium">
                Reason for dispute:
              </label>
              <Textarea
                id="dispute-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain why you believe this answer is incorrect or why the question is problematic..."
                className="min-h-[100px]"
                required
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Submit Dispute
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DisputeForm;
