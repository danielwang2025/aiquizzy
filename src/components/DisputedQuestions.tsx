
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
import { AlertTriangle, Trash2, Check, HelpCircle, Info } from "lucide-react";
import { motion } from "framer-motion";

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
      <motion.div 
        className="text-center py-12 glass-effect bg-white/10 backdrop-blur-md border border-dashed rounded-lg"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <HelpCircle className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
        <p className="text-muted-foreground mb-2">No disputed questions yet.</p>
        <p className="text-xs text-muted-foreground/70">Questions you dispute will appear here</p>
      </motion.div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-red-400 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          Disputed Questions ({questions.length})
        </h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleClearAll}
          disabled={questions.length === 0}
          className="flex items-center gap-1.5 text-xs glass-effect bg-white/10 backdrop-blur-sm border-white/20"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Clear All
        </Button>
      </div>
      
      <ScrollArea className="h-[calc(100vh-250px)]">
        <motion.div 
          className="space-y-4 pr-4"
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.07 } }
          }}
        >
          {questions.map((item) => (
            <motion.div
              key={item.questionId}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
              }}
            >
              <Card className="border-l-4 border-l-amber-500 glass hover">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base flex items-center gap-1.5">
                        <Info className="h-4 w-4 text-amber-500" />
                        {item.question.question}
                      </CardTitle>
                      <CardDescription className="text-xs mt-1 flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        Disputed on {new Date(item.dateDisputed).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <Badge variant={item.status === 'pending' ? "outline" : "secondary"} className={item.status === 'pending' ? "bg-amber-100/50 text-amber-800 border-amber-300" : "bg-blue-100/50 text-blue-800"}>
                      {item.status === 'pending' ? 'Pending' : 'Reviewed'}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="pb-2">
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-2">
                      <span className="font-medium min-w-[110px]">Your answer: </span>
                      <span className="bg-white/50 px-2 py-1 rounded flex-1">
                        {item.question.type === 'multiple_choice' && item.question.options
                          ? item.question.options[item.userAnswer as number] || 'Not answered'
                          : item.userAnswer !== null ? String(item.userAnswer) : 'Not answered'
                        }
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-medium min-w-[110px]">Correct answer: </span>
                      <span className="bg-white/50 px-2 py-1 rounded flex-1">
                        {item.question.type === 'multiple_choice' && item.question.options
                          ? item.question.options[item.question.correctAnswer as number]
                          : item.question.correctAnswer
                        }
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-medium min-w-[110px]">Dispute reason: </span>
                      <div className="mt-1 p-3 bg-amber-50/50 rounded-md text-sm flex-1 border border-amber-100">
                        {item.disputeReason}
                      </div>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="pt-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleRemoveDispute(item.questionId)}
                    className="ml-auto hover:bg-red-50 hover:text-red-600 flex items-center gap-1.5"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remove
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </ScrollArea>
    </div>
  );
};

export default DisputedQuestions;
