
import React from "react";
import { QuizQuestion } from "@/types/quiz";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, Play, Filter, SortAsc, AlertCircle, Clock, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { saveQuizToDatabase } from "@/utils/databaseService";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils"; // Import cn utility

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

  const handlePracticeSelected = (selectedQuestions: QuizQuestion[]) => {
    if (selectedQuestions.length === 0) {
      toast.error("No questions selected for practice");
      return;
    }

    // Save selected questions as a new quiz in the database
    const quizId = saveQuizToDatabase(
      selectedQuestions,
      "Review Practice - " + new Date().toLocaleString()
    );

    // Navigate to practice page with the quiz ID
    navigate(`/practice/${quizId}`);
  };

  if (questions.length === 0) {
    return (
      <motion.div 
        className="text-center py-12 border border-dashed rounded-lg glass-effect bg-white/10 backdrop-blur-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <img src="/placeholder.svg" alt="Empty" className="w-24 h-24 mx-auto opacity-30 mb-4" />
        <p className="text-muted-foreground mb-2">No questions in your review list yet.</p>
        <p className="text-xs text-muted-foreground/70">Questions you mark for review will appear here</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-400 flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Review List ({questions.length})
        </h3>
        <div className="space-x-2">
          <Button 
            variant="default" 
            size="sm" 
            onClick={() => {
              handlePracticeSelected(questions);
              onPracticeQuestions(questions);
            }}
            className="bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-700 hover:to-indigo-600 shadow-md hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300"
          >
            <Play className="h-3.5 w-3.5 mr-1.5" />
            Practice All
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onClearAll}
            className="text-xs glass-effect bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-all"
          >
            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
            Clear All
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <Button variant="outline" size="sm" className="h-8 px-3 glass-effect bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20">
          <Filter className="h-3.5 w-3.5 mr-1.5" />
          <span className="text-xs">Filter</span>
        </Button>
        <Button variant="outline" size="sm" className="h-8 px-3 glass-effect bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20">
          <SortAsc className="h-3.5 w-3.5 mr-1.5" />
          <span className="text-xs">Sort</span>
        </Button>
      </div>

      <ScrollArea className="h-[400px] pr-4 relative">
        <motion.div 
          className="space-y-3"
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.07 } }
          }}
        >
          {questions.map((question) => (
            <motion.div
              key={question.id} 
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
              }}
            >
              <Card 
                glass 
                hover 
                className="p-4 bg-white/70 dark:bg-black/10 border-white/40 shadow-sm"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 mr-4">
                    <p className="text-sm font-medium mb-3">{question.question}</p>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={question.type === "multiple_choice" ? "default" : "outline"} className="bg-blue-100/70 text-blue-800 hover:bg-blue-200/70">
                        {question.type === "multiple_choice" ? "Multiple Choice" : "Fill in the Blank"}
                      </Badge>
                      
                      {question.difficulty && (
                        <Badge variant="outline" className={cn(
                          "border-none", 
                          question.difficulty === "easy" ? "bg-green-100/70 text-green-800" : 
                          question.difficulty === "medium" ? "bg-amber-100/70 text-amber-800" :
                          "bg-red-100/70 text-red-800"
                        )}>
                          {question.difficulty}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveQuestion(question.id);
                    }}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all rounded-full"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </ScrollArea>
    </div>
  );
};

export default ReviewList;
