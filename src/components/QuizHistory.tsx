
import React from "react";
import { QuizAttempt } from "@/types/quiz";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, BarChart2, Calendar, Clock, Eye } from "lucide-react";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

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
      <motion.div 
        className="text-center py-12 glass-effect bg-white/10 backdrop-blur-md border border-dashed rounded-lg"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Calendar className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
        <p className="text-muted-foreground mb-2">No quiz history yet.</p>
        <p className="text-xs text-muted-foreground/70">Complete quizzes to build your history</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-400">
            Quiz History
          </span>
        </h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onClearHistory}
          className="flex items-center gap-1.5 text-xs glass-effect bg-white/10 backdrop-blur-sm border-white/20"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Clear History
        </Button>
      </div>

      <ScrollArea className="h-[350px] pr-4">
        <motion.div 
          className="space-y-3"
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.05 } }
          }}
        >
          {attempts.map((attempt) => (
            <motion.div 
              key={attempt.id} 
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
              }}
            >
              <Card 
                className="overflow-hidden hover:border-primary/50 transition-colors cursor-pointer glass hover"
                onClick={() => onViewAttempt(attempt)}
              >
                <div className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-sm font-medium truncate max-w-[70%] flex items-start gap-1.5">
                      <BarChart2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>{attempt.objectives}</span>
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {formatDistanceToNow(new Date(attempt.date), { addSuffix: true })}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <div className="bg-blue-50/70 px-2 py-1 rounded-full text-xs text-blue-700 flex items-center gap-1">
                      <Eye className="h-3.5 w-3.5" />
                      {attempt.questions.length} questions
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 ${
                      attempt.result.score >= 70 
                        ? "bg-green-50/70 text-green-700" 
                        : "bg-red-50/70 text-red-700"
                    }`}>
                      <BarChart2 className="h-3.5 w-3.5" />
                      Score: {attempt.result.score}%
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </ScrollArea>
    </div>
  );
};

export default QuizHistory;
