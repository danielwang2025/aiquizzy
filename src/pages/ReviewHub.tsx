import React, { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { loadQuizHistory, removeFromReviewList, clearReviewList, addToReviewList } from "@/utils/historyService";
import { QuizAttempt, QuizQuestion } from "@/types/quiz";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { saveQuizToDatabase } from "@/utils/databaseService";
import { 
  Search, 
  BookOpen, 
  List, 
  Clock, 
  Repeat, 
  Trash2, 
  Play, 
  Plus, 
  Check, 
  ArrowRight,
  Filter
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const ReviewHub: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<string>("review-list");
  const [history, setHistory] = useState(() => loadQuizHistory());
  const [filteredAttempts, setFilteredAttempts] = useState<QuizAttempt[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [topicFilter, setTopicFilter] = useState<string>("all");
  const [selectedAttempt, setSelectedAttempt] = useState<string | null>(null);
  
  useEffect(() => {
    // Update filtered attempts based on search term
    const filtered = history.attempts.filter(attempt => 
      attempt.objectives.toLowerCase().includes(searchTerm.toLowerCase()) ||
      new Date(attempt.date).toLocaleDateString().includes(searchTerm)
    );
    
    setFilteredAttempts(filtered);
  }, [searchTerm, history.attempts]);
  
  // Function to extract topics from all attempts
  const extractTopics = () => {
    const topicsSet = new Set<string>();
    
    history.attempts.forEach(attempt => {
      const topics = attempt.objectives.split(',').map(t => t.trim());
      topics.forEach(topic => {
        if (topic) topicsSet.add(topic);
      });
    });
    
    return Array.from(topicsSet);
  };
  
  const topics = extractTopics();
  
  // Update filtered attempts when topic filter changes
  useEffect(() => {
    if (topicFilter === "all") {
      setFilteredAttempts(history.attempts);
    } else {
      const filtered = history.attempts.filter(attempt => 
        attempt.objectives.split(',').some(t => t.trim() === topicFilter)
      );
      setFilteredAttempts(filtered);
    }
  }, [topicFilter, history.attempts]);
  
  // Function to get filtered review list based on topic
  const getFilteredReviewList = () => {
    if (topicFilter === "all") {
      return history.reviewList;
    }
    
    return history.reviewList.filter(question => {
      // For now, use the question text to infer the topic
      // In a more sophisticated app, each question would have topic metadata
      return question.question.toLowerCase().includes(topicFilter.toLowerCase());
    });
  };
  
  // Handle adding questions from a past quiz to review list
  const handleAddToReviewList = (questions: QuizQuestion[]) => {
    questions.forEach(question => {
      addToReviewList(question);
    });
    
    setHistory(loadQuizHistory());
    toast.success(`Added ${questions.length} questions to review list`);
  };
  
  // Handle removing a question from review list
  const handleRemoveFromReviewList = (questionId: string) => {
    removeFromReviewList(questionId);
    setHistory(loadQuizHistory());
  };
  
  // Handle clearing the review list
  const handleClearReviewList = () => {
    clearReviewList();
    setHistory(loadQuizHistory());
    toast.success("Review list cleared");
  };
  
  // Handle practicing selected questions
  const handlePracticeSelected = () => {
    if (selectedQuestions.length === 0) {
      toast.error("Please select questions to practice");
      return;
    }
    
    const questionsToReview = history.reviewList.filter(q => 
      selectedQuestions.includes(q.id)
    );
    
    // Save selected questions as a quiz in the database
    const quizId = saveQuizToDatabase(
      questionsToReview,
      "Review Practice - " + new Date().toLocaleString()
    );
    
    // Navigate to practice with the saved quiz
    toast.success(`Starting practice with ${questionsToReview.length} questions`);
    navigate(`/practice/${quizId}`);
  };
  
  // Handle selecting a question
  const handleSelectQuestion = (questionId: string) => {
    setSelectedQuestions(prev => 
      prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };
  
  // Handle selecting all questions
  const handleSelectAllQuestions = () => {
    const filteredList = getFilteredReviewList();
    if (selectedQuestions.length === filteredList.length) {
      setSelectedQuestions([]);
    } else {
      setSelectedQuestions(filteredList.map(q => q.id));
    }
  };
  
  // Generate data for wrong answers by topic chart
  const generateWrongAnswersByTopic = () => {
    const topicData: Record<string, { total: number; wrong: number }> = {};
    
    history.attempts.forEach(attempt => {
      const topics = attempt.objectives.split(',').map(t => t.trim());
      
      topics.forEach(topic => {
        if (!topic) return;
        
        if (!topicData[topic]) {
          topicData[topic] = { total: 0, wrong: 0 };
        }
        
        topicData[topic].total += attempt.questions.length;
        topicData[topic].wrong += attempt.result.incorrectAnswers;
      });
    });
    
    return Object.entries(topicData)
      .map(([topic, data]) => ({
        topic,
        wrongAnswers: data.wrong,
        wrongRate: Math.round((data.wrong / data.total) * 100)
      }))
      .sort((a, b) => b.wrongRate - a.wrongRate)
      .slice(0, 8);
  };
  
  const wrongAnswersByTopic = generateWrongAnswersByTopic();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <Navigation />
      
      <main className="py-8 px-4 max-w-screen-xl mx-auto">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center">Review & Practice Hub</h1>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="review-list" className="flex items-center gap-2">
                <List className="h-4 w-4" />
                <span>Review List</span>
              </TabsTrigger>
              <TabsTrigger value="past-quizzes" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Past Quizzes</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart className="h-4 w-4" />
                <span>Review Analytics</span>
              </TabsTrigger>
            </TabsList>
            
            <div className="mt-6 mb-4 flex items-center justify-between">
              <div className="flex items-center">
                <h2 className="text-xl font-semibold">
                  {activeTab === "review-list" && "Your Review List"}
                  {activeTab === "past-quizzes" && "Your Quiz History"}
                  {activeTab === "analytics" && "Review Analytics"}
                </h2>
              </div>
              
              <div className="flex items-center gap-3">
                <Select value={topicFilter} onValueChange={setTopicFilter}>
                  <SelectTrigger className="w-[180px]">
                    <div className="flex items-center">
                      <Filter className="h-4 w-4 mr-2" />
                      <span>Filter by Topic</span>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Topics</SelectItem>
                    {topics.map((topic, index) => (
                      <SelectItem key={index} value={topic}>{topic}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {activeTab !== "analytics" && (
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 w-[250px]"
                    />
                  </div>
                )}
              </div>
            </div>
            
            <TabsContent value="review-list">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleSelectAllQuestions}
                  >
                    {selectedQuestions.length === getFilteredReviewList().length && getFilteredReviewList().length > 0
                      ? "Deselect All"
                      : "Select All"}
                  </Button>
                  
                  {selectedQuestions.length > 0 && (
                    <Button
                      size="sm"
                      onClick={handlePracticeSelected}
                      className="flex items-center gap-2"
                    >
                      <Play className="h-4 w-4" />
                      Practice Selected ({selectedQuestions.length})
                    </Button>
                  )}
                </div>
                
                {history.reviewList.length > 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleClearReviewList}
                    className="flex items-center gap-2 text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
                  >
                    <Trash2 className="h-4 w-4" />
                    Clear List
                  </Button>
                )}
              </div>
              
              {getFilteredReviewList().length > 0 ? (
                <div className="space-y-4">
                  {getFilteredReviewList().map((question, index) => (
                    <Card key={question.id} className="overflow-hidden">
                      <CardContent className="p-0">
                        <div className="flex items-start p-4">
                          <div className="flex items-center h-5 mr-4">
                            <input
                              type="checkbox"
                              id={`question-${question.id}`}
                              checked={selectedQuestions.includes(question.id)}
                              onChange={() => handleSelectQuestion(question.id)}
                              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                          </div>
                          
                          <div className="flex-1">
                            <h3 className="text-base font-medium mb-2">
                              {index + 1}. {question.question}
                            </h3>
                            
                            {question.type === "multiple_choice" && question.options && (
                              <div className="ml-6 mb-3 space-y-1">
                                {question.options.map((option, i) => (
                                  <div 
                                    key={i} 
                                    className={`flex items-start gap-2 text-sm ${i === question.correctAnswer ? "text-green-700 font-medium" : ""}`}
                                  >
                                    <span className="inline-block w-5">{String.fromCharCode(65 + i)}.</span>
                                    <span>{option}</span>
                                    {i === question.correctAnswer && (
                                      <Check className="h-4 w-4 ml-1 text-green-600" />
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {question.type === "fill_in" && (
                              <div className="ml-6 mb-3 text-sm">
                                <span className="font-medium text-green-700">Answer: </span>
                                <span>{question.correctAnswer}</span>
                              </div>
                            )}
                            
                            {question.explanation && (
                              <div className="ml-6 text-sm text-muted-foreground">
                                <span className="font-medium">Explanation: </span>
                                <span>{question.explanation}</span>
                              </div>
                            )}
                          </div>
                          
                          <div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveFromReviewList(question.id)}
                              className="text-muted-foreground hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border border-dashed border-border rounded-lg bg-background">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Your review list is empty</h3>
                  <p className="text-muted-foreground mb-6">
                    Add questions from your past quizzes to review them later
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => setActiveTab("past-quizzes")}
                    className="flex items-center gap-2 mx-auto"
                  >
                    <Clock className="h-4 w-4" />
                    Browse Past Quizzes
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="past-quizzes">
              {filteredAttempts.length > 0 ? (
                <div className="space-y-4">
                  {filteredAttempts.map((attempt) => (
                    <Card 
                      key={attempt.id} 
                      className={`overflow-hidden ${selectedAttempt === attempt.id ? "ring-2 ring-primary" : ""}`}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{attempt.objectives}</CardTitle>
                          <div className="text-sm text-muted-foreground">
                            {new Date(attempt.date).toLocaleDateString()}, {new Date(attempt.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-6">
                            <div>
                              <p className="text-sm text-muted-foreground">Questions</p>
                              <p className="font-medium">{attempt.questions.length}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Score</p>
                              <p className="font-medium">{attempt.result.score}%</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Correct</p>
                              <p className="font-medium">{attempt.result.correctAnswers} / {attempt.questions.length}</p>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant={selectedAttempt === attempt.id ? "default" : "outline"}
                              onClick={() => setSelectedAttempt(selectedAttempt === attempt.id ? null : attempt.id)}
                              className="flex items-center gap-2"
                            >
                              {selectedAttempt === attempt.id ? (
                                <>
                                  <Check className="h-4 w-4" />
                                  <span>Viewing</span>
                                </>
                              ) : (
                                <>
                                  <BookOpen className="h-4 w-4" />
                                  <span>View Questions</span>
                                </>
                              )}
                            </Button>
                            
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAddToReviewList(attempt.questions.filter(
                                (_, index) => attempt.userAnswers[index] !== attempt.questions[index].correctAnswer
                              ))}
                              className="flex items-center gap-2"
                            >
                              <Plus className="h-4 w-4" />
                              <span>Add Incorrect to Review</span>
                            </Button>
                            
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(`/practice/${attempt.id}`)}
                              className="flex items-center gap-2"
                            >
                              <Repeat className="h-4 w-4" />
                              <span>Retry</span>
                            </Button>
                          </div>
                        </div>
                        
                        {selectedAttempt === attempt.id && (
                          <div className="space-y-4 mt-6 border-t pt-4">
                            <h3 className="font-medium">Quiz Questions</h3>
                            
                            {attempt.questions.map((question, index) => {
                              const userAnswer = attempt.userAnswers[index];
                              const isCorrect = userAnswer === question.correctAnswer;
                              
                              return (
                                <div key={index} className={`p-3 rounded-lg ${isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
                                  <h4 className="font-medium mb-2 flex items-start">
                                    <span className="flex-shrink-0 w-5">{index + 1}.</span>
                                    <span>{question.question}</span>
                                  </h4>
                                  
                                  {question.type === "multiple_choice" && question.options && (
                                    <div className="ml-5 space-y-1 mb-2">
                                      {question.options.map((option, i) => (
                                        <div 
                                          key={i} 
                                          className={`text-sm flex items-start ${
                                            i === question.correctAnswer 
                                              ? "text-green-700 font-medium" 
                                              : i === userAnswer && i !== question.correctAnswer
                                                ? "text-red-700 line-through"
                                                : ""
                                          }`}
                                        >
                                          <span className="inline-block w-5">{String.fromCharCode(65 + i)}.</span>
                                          <span>{option}</span>
                                          {i === question.correctAnswer && (
                                            <Check className="h-4 w-4 ml-1 text-green-600" />
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                  
                                  {question.type === "fill_in" && (
                                    <div className="ml-5 mb-2 space-y-2">
                                      <div className="text-sm">
                                        <span className="font-medium">Your answer: </span>
                                        <span className={isCorrect ? "text-green-700" : "text-red-700 line-through"}>
                                          {userAnswer !== null ? String(userAnswer) : "Not answered"}
                                        </span>
                                      </div>
                                      
                                      {!isCorrect && (
                                        <div className="text-sm">
                                          <span className="font-medium text-green-700">Correct answer: </span>
                                          <span>{question.correctAnswer}</span>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                  
                                  {question.explanation && (
                                    <div className="ml-5 text-sm text-slate-700 bg-white/50 p-2 rounded">
                                      <span className="font-medium">Explanation: </span>
                                      <span>{question.explanation}</span>
                                    </div>
                                  )}
                                  
                                  <div className="mt-2 ml-5">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => {
                                        addToReviewList(question);
                                        setHistory(loadQuizHistory());
                                        toast.success("Added to review list");
                                      }}
                                      className="h-8 text-xs"
                                    >
                                      <Plus className="h-3 w-3 mr-1" />
                                      Add to Review List
                                    </Button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border border-dashed border-border rounded-lg bg-background">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No quiz history found</h3>
                  <p className="text-muted-foreground mb-6">
                    {searchTerm || topicFilter !== "all" 
                      ? "No quizzes match your search criteria"
                      : "Take a quiz to see your history here"}
                  </p>
                  <Button 
                    onClick={() => navigate("/customize")}
                    className="flex items-center gap-2 mx-auto"
                  >
                    <Play className="h-4 w-4" />
                    Start a New Quiz
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="analytics">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BarChart className="h-5 w-5 mr-2" />
                      Topics Needing Review
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px]">
                      {wrongAnswersByTopic.length > 0 ? (
                        <ChartContainer config={{}}>
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={wrongAnswersByTopic}
                              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                              <XAxis 
                                dataKey="topic" 
                                stroke="#6b7280" 
                                fontSize={12} 
                                angle={-45} 
                                textAnchor="end" 
                                height={80} 
                              />
                              <YAxis 
                                domain={[0, 100]} 
                                stroke="#6b7280" 
                                fontSize={12} 
                                tickFormatter={(value) => `${value}%`}
                              />
                              <ChartTooltip />
                              <Bar 
                                dataKey="wrongRate" 
                                name="Error Rate" 
                                fill="#ef4444" 
                                radius={[4, 4, 0, 0]}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </ChartContainer>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full">
                          <BarChart className="h-12 w-12 text-muted-foreground mb-4" />
                          <p className="text-center text-muted-foreground">
                            Complete more quizzes to see analytics
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Spaced Repetition Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-6">
                      Based on your performance, we recommend reviewing these topics:
                    </p>
                    
                    {wrongAnswersByTopic.length > 0 ? (
                      <div className="space-y-4">
                        {wrongAnswersByTopic.slice(0, 3).map((topic, index) => (
                          <div key={index} className="flex items-center justify-between border-b pb-4">
                            <div>
                              <h3 className="font-medium">{topic.topic}</h3>
                              <p className="text-sm text-muted-foreground">
                                {topic.wrongRate}% error rate in quizzes
                              </p>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => {
                                navigate("/customize");
                                toast.success(`Starting practice on ${topic.topic}`);
                              }}
                              className="flex items-center gap-1"
                            >
                              Practice <ArrowRight className="h-3 w-3 ml-1" />
                            </Button>
                          </div>
                        ))}
                        
                        <div className="pt-4">
                          <h3 className="font-medium mb-2">Review Schedule</h3>
                          <p className="text-sm text-muted-foreground mb-6">
                            For optimal learning, follow this spaced repetition schedule:
                          </p>
                          
                          <div className="space-y-3">
                            {[
                              { time: "Today", reason: "Initial review of new material" },
                              { time: "Tomorrow", reason: "First reinforcement" },
                              { time: "In 3 days", reason: "Second reinforcement" },
                              { time: "In 1 week", reason: "Third reinforcement" },
                              { time: "In 2 weeks", reason: "Long-term memory consolidation" }
                            ].map((item, index) => (
                              <div key={index} className="flex items-center gap-3">
                                <div className="w-24 flex-shrink-0 font-medium">{item.time}</div>
                                <div className="text-sm text-muted-foreground">{item.reason}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 border border-dashed border-border rounded-lg">
                        <p className="text-muted-foreground mb-4">
                          No recommendations available yet
                        </p>
                        <Button
                          onClick={() => navigate("/customize")}
                          size="sm"
                        >
                          Take More Quizzes
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default ReviewHub;
