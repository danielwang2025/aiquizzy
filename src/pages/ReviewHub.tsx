import React, { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { loadQuizHistory, removeFromReviewList, clearReviewList } from "@/utils/historyService";
import { QuizHistory, QuizQuestion, QuizAttempt } from "@/types/quiz";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { format } from "date-fns";
import { saveQuizToDatabase } from "@/utils/databaseService";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Clock,
  CircleCheck,
  Check,
  Eye,
  ChevronRight,
  Trash2,
  Plus,
  GitBranch,
  CalendarDays,
  ArrowUpRight,
  BookOpen
} from "lucide-react";
import { cn } from "@/lib/utils";
import LoadingSpinner from "@/components/LoadingSpinner";

const ReviewHub: React.FC = () => {
  const [history, setHistory] = useState<QuizHistory>({ attempts: [], reviewList: [], disputedQuestions: [] });
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<"review" | "history">("review");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const quizHistory = await loadQuizHistory();
        setHistory(quizHistory);
      } catch (error) {
        console.error("Error loading quiz history:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHistory();
  }, []);

  const handlePracticeSelected = (selectedQuestions: QuizQuestion[]) => {
    if (selectedQuestions.length === 0) {
      toast.error("No questions selected for practice");
      return;
    }

    saveQuizToDatabase(selectedQuestions, "Review Practice - " + new Date().toLocaleString())
      .then(quizId => {
        navigate(`/practice/${quizId}`);
      })
      .catch(error => {
        console.error("Error creating review practice quiz:", error);
        toast.error("Failed to create practice quiz");
      });
  };

  const handleRemoveQuestion = async (id: string) => {
    try {
      await removeFromReviewList(id);
      const updatedHistory = await loadQuizHistory();
      setHistory(updatedHistory);
      toast.success("Question removed from review list");
    } catch (error) {
      console.error("Error removing question:", error);
      toast.error("Failed to remove question");
    }
  };

  const handleClearReviewList = async () => {
    try {
      await clearReviewList();
      const updatedHistory = await loadQuizHistory();
      setHistory(updatedHistory);
      toast.success("Review list cleared");
    } catch (error) {
      console.error("Error clearing review list:", error);
      toast.error("Failed to clear review list");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto p-6 flex justify-center items-center min-h-[50vh]">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto p-6 max-w-5xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Review Hub</h1>
          <p className="text-muted-foreground mt-2">
            Track your progress and review challenging questions
          </p>
        </header>
        
        <Tabs 
          value={selectedTab} 
          onValueChange={(value) => setSelectedTab(value as "review" | "history")}
          className="mb-6"
        >
          <TabsList className="mb-4">
            <TabsTrigger value="review" className="flex items-center">
              <BookOpen className="mr-2 h-4 w-4" />
              Review List ({history.reviewList.length})
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center">
              <CalendarDays className="mr-2 h-4 w-4" />
              Completed Quizzes ({history.attempts.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="review">
            <Card>
              <CardHeader>
                <CardTitle>Review List</CardTitle>
              </CardHeader>
              <CardContent>
                {history.reviewList.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No questions in your review list yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">Questions ({history.reviewList.length})</h3>
                      <div className="space-x-2">
                        <Button 
                          variant="default" 
                          size="sm" 
                          onClick={() => handlePracticeSelected(history.reviewList)}
                          className="text-xs"
                        >
                          Practice All
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={handleClearReviewList}
                          className="text-xs"
                        >
                          Clear All
                        </Button>
                      </div>
                    </div>

                    <ScrollArea className="h-[300px] pr-4">
                      <div className="space-y-3">
                        {history.reviewList.map((question) => (
                          <div 
                            key={question.id} 
                            className="border border-border rounded-lg p-4 bg-white"
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1 mr-4">
                                <p className="text-sm font-medium mb-2">{question.question}</p>
                                <div className="flex items-center">
                                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                    {question.type === "multiple_choice" ? "Multiple Choice" : "Fill in the Blank"}
                                  </span>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveQuestion(question.id);
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
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Completed Quizzes</CardTitle>
              </CardHeader>
              <CardContent>
                {history.attempts.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No quizzes completed yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Recent Quizzes</h3>
                    <ScrollArea className="h-[300px] pr-4">
                      <div className="space-y-3">
                        {history.attempts.map((attempt) => (
                          <div 
                            key={attempt.id} 
                            className="border border-border rounded-lg p-4 bg-white hover:border-primary/50 transition-colors cursor-pointer"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-sm font-medium truncate max-w-[70%]">
                                {attempt.objectives}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(attempt.date), "MMM dd, yyyy")}
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
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ReviewHub;
