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
import { motion } from "framer-motion";
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
  Filter,
  BarChart,
  Calendar
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart";

const fadeIn = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5 }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const cardAnimation = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4 }
  }
};

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
    const filtered = history.attempts.filter(attempt => 
      attempt.objectives.toLowerCase().includes(searchTerm.toLowerCase()) ||
      new Date(attempt.date).toLocaleDateString().includes(searchTerm)
    );
    
    setFilteredAttempts(filtered);
  }, [searchTerm, history.attempts]);
  
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
  
  const getFilteredReviewList = () => {
    if (topicFilter === "all") {
      return history.reviewList;
    }
    
    return history.reviewList.filter(question => {
      return question.question.toLowerCase().includes(topicFilter.toLowerCase());
    });
  };
  
  const handleAddToReviewList = (questions: QuizQuestion[]) => {
    questions.forEach(question => {
      addToReviewList(question);
    });
    
    setHistory(loadQuizHistory());
    toast.success(`Added ${questions.length} questions to review list`);
  };
  
  const handleRemoveFromReviewList = (questionId: string) => {
    removeFromReviewList(questionId);
    setHistory(loadQuizHistory());
  };
  
  const handleClearReviewList = () => {
    clearReviewList();
    setHistory(loadQuizHistory());
    toast.success("Review list cleared");
  };
  
  const handlePracticeSelected = () => {
    if (selectedQuestions.length === 0) {
      toast.error("Please select questions to practice");
      return;
    }
    
    const questionsToReview = history.reviewList.filter(q => 
      selectedQuestions.includes(q.id)
    );
    
    const quizId = saveQuizToDatabase(
      questionsToReview,
      "Review Practice - " + new Date().toLocaleString()
    );
    
    toast.success(`Starting practice with ${questionsToReview.length} questions`);
    navigate(`/practice/${quizId}`);
  };
  
  const handleSelectQuestion = (questionId: string) => {
    setSelectedQuestions(prev => 
      prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };
  
  const handleSelectAllQuestions = () => {
    const filteredList = getFilteredReviewList();
    if (selectedQuestions.length === filteredList.length) {
      setSelectedQuestions([]);
    } else {
      setSelectedQuestions(filteredList.map(q => q.id));
    }
  };
  
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20">
      <Navigation />
      <main className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <span className="px-4 py-1.5 text-sm font-medium bg-blue-100 text-blue-700 rounded-full inline-block mb-4">Review Center</span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight gradient-text">Study Review Hub</h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Review your past quizzes and track your learning progress
            </p>
          </motion.div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="grid w-full grid-cols-3 bg-white/30 backdrop-blur-sm p-1 rounded-lg shadow-sm border border-white/50">
              <TabsTrigger 
                value="review-list" 
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/80 data-[state=active]:to-indigo-500/80 data-[state=active]:text-white"
              >
                <List className="h-4 w-4" />
                <span>Review List</span>
              </TabsTrigger>
              <TabsTrigger 
                value="past-quizzes" 
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/80 data-[state=active]:to-indigo-500/80 data-[state=active]:text-white"
              >
                <Clock className="h-4 w-4" />
                <span>History</span>
              </TabsTrigger>
              <TabsTrigger 
                value="analytics" 
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/80 data-[state=active]:to-indigo-500/80 data-[state=active]:text-white"
              >
                <BarChart className="h-4 w-4" />
                <span>Analytics</span>
              </TabsTrigger>
            </TabsList>
            
            <div className="mt-6 mb-4 flex items-center justify-between">
              <div className="flex items-center">
                <h2 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                  {activeTab === "review-list" && "Your Review List"}
                  {activeTab === "past-quizzes" && "Your Quiz History"}
                  {activeTab === "analytics" && "Review Analytics"}
                </h2>
              </div>
              
              <div className="flex items-center gap-3">
                <Select value={topicFilter} onValueChange={setTopicFilter}>
                  <SelectTrigger className="w-[180px] bg-white/30 backdrop-blur-sm border-white/30">
                    <div className="flex items-center">
                      <Filter className="h-4 w-4 mr-2" />
                      <span>Filter by Topic</span>
                    </div>
                  </SelectTrigger>
                  <SelectContent className="glass-effect bg-white/70 backdrop-blur-md border-white/30">
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
                      className="pl-9 w-[250px] bg-white/30 backdrop-blur-sm border-white/30"
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
                    className="glass-effect bg-white/20 backdrop-blur-sm border-white/30 hover:bg-white/30 transition-all shadow-sm hover:shadow-md"
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
                      className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-700 hover:to-indigo-600 shadow-md hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300"
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
                <motion.div 
                  className="space-y-4"
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                >
                  {getFilteredReviewList().map((question, index) => (
                    <motion.div key={question.id} variants={cardAnimation}>
                      <Card glass hover gradient className="overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
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
                                <div className="ml-6 mb-3 space-y-1 bg-white/40 p-3 rounded-lg">
                                  {question.options.map((option, i) => (
                                    <div 
                                      key={i} 
                                      className={`flex items-start gap-2 text-sm ${i === question.correctAnswer ? "text-green-700 font-medium" : ""}`}
                                    >
                                      <span className="inline-block w-5 h-5 flex-shrink-0 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium text-blue-800">{String.fromCharCode(65 + i)}</span>
                                      <span>{option}</span>
                                      {i === question.correctAnswer && (
                                        <Check className="h-4 w-4 ml-1 text-green-600" />
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                              
                              {question.type === "fill_in" && (
                                <div className="ml-6 mb-3 text-sm bg-white/40 p-3 rounded-lg">
                                  <span className="font-medium text-green-700">Answer: </span>
                                  <span>{question.correctAnswer}</span>
                                </div>
                              )}
                              
                              {question.explanation && (
                                <div className="ml-6 text-sm text-muted-foreground bg-white/20 p-3 rounded-lg border-l-4 border-blue-400">
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
                                className="text-muted-foreground hover:text-red-600 hover:bg-red-50/30 rounded-full h-9 w-9"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div 
                  className="text-center py-12 border border-dashed border-white/40 rounded-lg bg-white/10 backdrop-blur-md"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Your review list is empty</h3>
                  <p className="text-muted-foreground mb-6">
                    Please add questions from your history to review
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => setActiveTab("past-quizzes")}
                    className="flex items-center gap-2 mx-auto glass-effect bg-white/20 backdrop-blur-sm border-white/30 hover:bg-white/30"
                  >
                    <Clock className="h-4 w-4" />
                    View History
                  </Button>
                </motion.div>
              )}
            </TabsContent>
            
            <TabsContent value="past-quizzes">
              {filteredAttempts.length > 0 ? (
                <motion.div 
                  className="space-y-4"
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                >
                  {filteredAttempts.map((attempt) => (
                    <motion.div key={attempt.id} variants={cardAnimation}>
                      <Card 
                        glass hover gradient
                        className={`overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 ${selectedAttempt === attempt.id ? "ring-2 ring-primary" : ""}`}
                      >
                        <CardHeader className="pb-2 bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                              {attempt.objectives}
                            </CardTitle>
                            <div className="text-sm text-muted-foreground flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5" />
                              {new Date(attempt.date).toLocaleDateString()}, {new Date(attempt.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </div>
                          </div>
                        </CardHeader>
                        
                        <CardContent>
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-6">
                              <div className="p-2 rounded-lg bg-blue-50/70 text-center min-w-20">
                                <p className="text-xs text-muted-foreground">Questions</p>
                                <p className="font-medium text-blue-700">{attempt.questions.length}</p>
                              </div>
                              <div className="p-2 rounded-lg bg-green-50/70 text-center min-w-20">
                                <p className="text-xs text-muted-foreground">Score</p>
                                <p className="font-medium text-green-700">{attempt.result.score}%</p>
                              </div>
                              <div className="p-2 rounded-lg bg-amber-50/70 text-center min-w-20">
                                <p className="text-xs text-muted-foreground">Correct</p>
                                <p className="font-medium text-amber-700">{attempt.result.correctAnswers} / {attempt.questions.length}</p>
                              </div>
                            </div>
                            
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant={selectedAttempt === attempt.id ? "default" : "outline"}
                                onClick={() => setSelectedAttempt(selectedAttempt === attempt.id ? null : attempt.id)}
                                className={`flex items-center gap-2 ${
                                  selectedAttempt === attempt.id 
                                    ? "bg-gradient-to-r from-blue-600 to-indigo-500 shadow-md" 
                                    : "glass-effect bg-white/20 backdrop-blur-sm border-white/30 hover:bg-white/30"
                                }`}
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
                                className="flex items-center gap-2 glass-effect bg-white/20 backdrop-blur-sm border-white/30 hover:bg-white/30"
                              >
                                <Plus className="h-4 w-4" />
                                <span>Add Mistakes to Review</span>
                              </Button>
                              
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => navigate(`/practice/${attempt.id}`)}
                                className="flex items-center gap-2 glass-effect bg-white/20 backdrop-blur-sm border-white/30 hover:bg-white/30"
                              >
                                <Repeat className="h-4 w-4" />
                                <span>Retry</span>
                              </Button>
                            </div>
                          </div>
                          
                          {selectedAttempt === attempt.id && (
                            <motion.div 
                              className="space-y-4 mt-6 border-t pt-4"
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              transition={{ duration: 0.4 }}
                            >
                              <h3 className="font-medium text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Exam Questions</h3>
                              
                              {attempt.questions.map((question, index) => {
                                const userAnswer = attempt.userAnswers[index];
                                const isCorrect = userAnswer === question.correctAnswer;
                                
                                return (
                                  <div 
                                    key={index} 
                                    className={`p-3 rounded-lg ${isCorrect 
                                      ? 'bg-gradient-to-r from-green-50/70 to-green-100/50 border-l-4 border-green-400' 
                                      : 'bg-gradient-to-r from-red-50/70 to-red-100/50 border-l-4 border-red-400'}`}
                                  >
                                    <h4 className="font-medium mb-2 flex items-start">
                                      <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center bg-blue-100 rounded-full text-xs font-medium text-blue-800 mr-2">{index + 1}</span>
                                      <span>{question.question}</span>
                                    </h4>
                                    
                                    {question.type === "multiple_choice" && question.options && (
                                      <div className="ml-7 space-y-1 mb-2 bg-white/40 p-2 rounded-lg">
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
                                            <span className="inline-block w-5 h-5 flex-shrink-0 bg-blue-50 rounded-full flex items-center justify-center text-xs font-medium text-blue-800">{String.fromCharCode(65 + i)}</span>
                                            <span className="ml-2">{option}</span>
                                            {i === question.correctAnswer && (
                                              <Check className="h-4 w-4 ml-1 text-green-600" />
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                    
                                    {question.type === "fill_in" && (
                                      <div className="ml-7 mb-2 space-y-2">
                                        <div className="text-sm p-2 bg-white/40 rounded-lg">
                                          <span className="font-medium">Your Answer: </span>
                                          <span className={isCorrect ? "text-green-700" : "text-red-700 line-through"}>
                                            {userAnswer !== null ? String(userAnswer) : "Not Answered"}
                                          </span>
                                        </div>
                                        
                                        {!isCorrect && (
                                          <div className="text-sm p-2 bg-white/40 rounded-lg">
                                            <span className="font-medium text-green-700">Correct Answer: </span>
                                            <span>{question.correctAnswer}</span>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                    
                                    {question.explanation && (
                                      <div className="ml-7 text-sm text-slate-700 bg-white/40 p-2 rounded-lg border-l-4 border-blue-400">
                                        <span className="font-medium">Explanation: </span>
                                        <span>{question.explanation}</span>
                                      </div>
                                    )}
                                    
                                    <div className="mt-2 ml-7">
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => {
                                          addToReviewList(question);
                                          setHistory(loadQuizHistory());
                                          toast.success("Added to review list");
                                        }}
                                        className="h-8 text-xs bg-blue-50/50 hover:bg-blue-100/50"
                                      >
                                        <Plus className="h-3 w-3 mr-1" />
                                        Add to Review List
                                      </Button>
                                    </div>
                                  </div>
                                );
                              })}
                            </motion.div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div 
                  className="text-center py-12 border border-dashed border-white/40 rounded-lg bg-white/10 backdrop-blur-md"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No quiz history found</h3>
                  <p className="text-muted-foreground mb-6">
                    {searchTerm || topicFilter !== "all" 
                      ? "No quizzes matching the search criteria were found"
                      : "View your quiz history here"}
                  </p>
                  <Button 
                    onClick={() => navigate("/customize")}
                    className="flex items-center gap-2 mx-auto bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-700 hover:to-indigo-600 shadow-md hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300"
                  >
                    <Play className="h-4 w-4" />
                    Start a New Quiz
                  </Button>
                </motion.div>
              )}
            </TabsContent>
            
            <TabsContent value="analytics">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                >
                  <Card glass gradient hover glow bordered className="overflow-hidden">
                    <CardHeader>
                      <CardTitle className="flex items-center text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                        <BarChart className="h-5 w-5 mr-2 text-blue-500" />
                        Topics Needing Review
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[400px]">
                        {wrongAnswersByTopic.length > 0 ? (
                          <ChartContainer config={{}}>
                            <ResponsiveContainer width="100%" height="100%">
                              <RechartsBarChart
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
                                <ChartTooltip
                                  content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                      return (
                                        <div className="glass-effect bg-white/70 backdrop-blur-md p-3 border border-white/30 shadow-lg rounded-md">
                                          <p className="font-medium text-gray-900">{payload[0].payload.topic}</p>
                                          <p className="text-red-600">Error Rate: {payload[0].value}%</p>
                                          <p className="text-red-600">Incorrect Answers: {payload[0].payload.wrongAnswers}</p>
                                        </div>
                                      );
                                    }
                                    return null;
                                  }}
                                />
                                <defs>
                                  <linearGradient id="errorGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#ef4444" stopOpacity={0.8}/>
                                    <stop offset="100%" stopColor="#f87171" stopOpacity={0.8}/>
                                  </linearGradient>
                                </defs>
                                <Bar 
                                  dataKey="wrongRate" 
                                  name="Error Rate" 
                                  fill="url(#errorGradient)" 
                                  radius={[4, 4, 0, 0]}
                                />
                              </RechartsBarChart>
                            </ResponsiveContainer>
                          </ChartContainer>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full bg-white/20 backdrop-blur-sm rounded-lg">
                            <BarChart className="h-12 w-12 text-muted-foreground mb-4" />
                            <p className="text-center text-muted-foreground">
                              Complete more quizzes to view analysis
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                >
                  <Card glass gradient hover glow bordered className="overflow-hidden">
                    <CardHeader>
                      <CardTitle className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-teal-600">
                         Spaced Repetition Recommendations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-6">
                        Based on your performance, we recommend reviewing these topics:
                      </p>
                      
                      {wrongAnswersByTopic.length > 0 ? (
                        <div className="space-y-4">
                          {wrongAnswersByTopic.slice(0, 3).map((topic, index) => (
                            <div key={index} className="flex items-center justify-between border-b pb-4 border-white/20">
                              <div>
                                <h3 className="font-medium">{topic.topic}</h3>
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <div className="w-24 bg-gray-200 rounded-full h-1.5">
                                    <div 
                                      className="bg-red-500 h-1.5 rounded-full" 
                                      style={{ width: `${topic.wrongRate}%` }}
                                    ></div>
                                  </div>
                                  <span>{topic.wrongRate}% Error Rate</span>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                onClick={() => {
                                  navigate("/customize");
                                  toast.success(`Start practicing ${topic.topic}`);
                                }}
                                className="flex items-center gap-1 bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-700 hover:to-indigo-600 shadow-md hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300"
                              >
                                Practice <ArrowRight className="h-3 w-3 ml-1" />
                              </Button>
                            </div>
                          ))}
                          
                          <div className="pt-4">
                            <h3 className="font-medium mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                              Review Plan
                            </h3>
                            <p className="text-sm text-muted-foreground mb-6">
                              For optimal learning, follow this spaced repetition plan:
                            </p>
                            
                            <div className="space-y-3">
                              {[
                                { time: "Today", reason: "First review of new material" },
                                { time: "Tomorrow", reason: "First reinforcement" },
                                { time: "In three days", reason: "Second reinforcement" },
                                { time: "In one week", reason: "Third reinforcement" },
                                { time: "In two weeks", reason: "Long-term memory consolidation" }
                              ].map((item, index) => (
                                <div key={index} className="flex items-center gap-3 p-2 bg-white/20 rounded-lg">
                                  <div className="w-24 flex-shrink-0 font-medium text-blue-700">{item.time}</div>
                                  <div className="text-sm text-muted-foreground">{item.reason}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8 border border-dashed border-white/40 rounded-lg bg-white/10 backdrop-blur-md">
                          <p className="text-muted-foreground mb-4">
                            No recommendations available
                          </p>
                          <Button
                            onClick={() => navigate("/customize")}
                            size="sm"
                            className="bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-700 hover:to-indigo-600 shadow-md hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300"
                          >
                            Take More Quizzes
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default ReviewHub;
```
