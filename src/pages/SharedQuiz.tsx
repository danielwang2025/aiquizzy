
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getQuizById } from "@/utils/databaseService";
import QuizQuestionComponent from "@/components/QuizQuestion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import LoadingSpinner from "@/components/LoadingSpinner";
import { QuizQuestion } from "@/types/quiz";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { 
  ArrowLeft, ArrowRight, Medal, 
  Clock, Share, User, Users, Trophy
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import LeaderboardComponent from "@/components/LeaderboardComponent";
import Footer from "@/components/Footer";

const SharedQuiz = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState<any>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<(string | number | null)[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [completionTime, setCompletionTime] = useState<number | null>(null);
  const [submittingScore, setSubmittingScore] = useState(false);
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  
  useEffect(() => {
    let isMounted = true;
    
    const fetchQuizData = async () => {
      try {
        if (!quizId) {
          if (isMounted) navigate("/");
          return;
        }
        
        const quizData = getQuizById(quizId);
        if (quizData && isMounted) {
          setQuiz(quizData);
          setUserAnswers(Array(quizData.questions.length).fill(null));
          setStartTime(Date.now());
        } else if (isMounted) {
          setLoadingError("Quiz not found. The link may be invalid or the quiz has been removed.");
          toast.error("Quiz not found");
        }
      } catch (error) {
        console.error("Error fetching quiz:", error);
        if (isMounted) {
          setLoadingError("Failed to load quiz data. Please try again.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    fetchQuizData();
    
    return () => {
      isMounted = false;
    };
  }, [quizId, navigate]);
  
  const handleAnswer = (answer: string | number) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = answer;
    setUserAnswers(newAnswers);
  };
  
  const goToNextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      if (startTime) {
        const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
        setCompletionTime(elapsedSeconds);
      }
      setShowResults(true);
    }
  };
  
  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };
  
  const calculateResults = () => {
    let correctCount = 0;
    
    quiz.questions.forEach((question: QuizQuestion, index: number) => {
      const userAnswer = userAnswers[index];
      
      if (question.type === "fill_in") {
        if (String(userAnswer).toLowerCase().trim() === String(question.correctAnswer).toLowerCase().trim()) {
          correctCount++;
        }
      } else if (userAnswer === question.correctAnswer) {
        correctCount++;
      }
    });
    
    const score = Math.round((correctCount / quiz.questions.length) * 100);
    
    return {
      totalQuestions: quiz.questions.length,
      correctCount,
      incorrectCount: quiz.questions.length - correctCount,
      score
    };
  };
  
  const handleRetryQuiz = () => {
    setCurrentQuestionIndex(0);
    setUserAnswers(Array(quiz.questions.length).fill(null));
    setShowResults(false);
    setStartTime(Date.now());
    setCompletionTime(null);
    setScoreSubmitted(false);
  };
  
  const handleSubmitScore = async () => {
    if (!userName.trim()) {
      toast.error("Please enter your name");
      return;
    }
    
    try {
      setSubmittingScore(true);
      const results = calculateResults();
      
      const { data, error } = await supabase.functions.invoke("leaderboard", {
        method: "POST",
        body: {
          quiz_id: quizId,
          user_name: userName,
          score: results.score,
          completion_time: completionTime
        }
      });
      
      if (error) {
        console.error("Error submitting score:", error);
        toast.error("Failed to submit your score. Please try again.");
        return;
      }
      
      setScoreSubmitted(true);
      toast.success("Your score has been added to the leaderboard!");
    } catch (error) {
      console.error("Error submitting score:", error);
      toast.error("Failed to submit your score. Please try again.");
    } finally {
      setSubmittingScore(false);
    }
  };
  
  const handleCopyShareLink = () => {
    const shareUrl = window.location.href;
    navigator.clipboard.writeText(shareUrl)
      .then(() => toast.success("Share link copied to clipboard!"))
      .catch(() => toast.error("Failed to copy link"));
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col">
        <div className="flex-grow flex items-center justify-center mt-16">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-muted-foreground">Loading quiz...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  if (loadingError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col">
        <div className="flex-grow flex items-center justify-center mt-16">
          <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-sm border border-border text-center">
            <svg className="h-12 w-12 text-red-500 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h1 className="text-xl font-bold mb-2">Error Loading Quiz</h1>
            <p className="text-muted-foreground mb-6">{loadingError}</p>
            <Button onClick={() => navigate("/")}>Back to Home</Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  const currentQuestion = quiz?.questions[currentQuestionIndex];
  const progressPercentage = quiz ? (currentQuestionIndex / (quiz.questions.length - 1)) * 100 : 0;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col">      
      <main className="py-8 px-4 flex-grow mt-16">
        <div className="max-w-4xl mx-auto">
          <Card className="mb-6 bg-blue-500 text-white">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-xl font-bold">Shared Quiz</h1>
                  <p className="text-sm text-blue-100">{quiz?.title}</p>
                </div>
                <Button variant="secondary" size="sm" onClick={handleCopyShareLink}>
                  <Share className="h-4 w-4 mr-1" /> Share
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {!showResults ? (
            <div>
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Progress</span>
                  <span className="text-sm font-medium">{currentQuestionIndex + 1} / {quiz?.questions.length}</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-border">
                <div className="mb-6 flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-medium text-sm">
                      {currentQuestionIndex + 1}
                    </span>
                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md capitalize text-sm font-medium">
                      {currentQuestion?.difficulty}
                    </span>
                    <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded-md text-sm font-medium">
                      {currentQuestion?.type === "multiple_choice" ? "Multiple Choice" : "Fill in the Blank"}
                    </span>
                  </div>
                </div>
                
                <div className="mb-8">
                  <QuizQuestionComponent 
                    question={currentQuestion}
                    userAnswer={userAnswers[currentQuestionIndex]}
                    onAnswer={handleAnswer}
                    showResult={false}
                    index={currentQuestionIndex}
                  />
                </div>
                
                <div className="flex justify-between mt-6">
                  <Button
                    variant="outline"
                    onClick={goToPreviousQuestion}
                    disabled={currentQuestionIndex === 0}
                    className="flex items-center"
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  
                  <Button
                    onClick={goToNextQuestion}
                    disabled={userAnswers[currentQuestionIndex] === null}
                    className="flex items-center bg-blue-600 hover:bg-blue-700"
                  >
                    {currentQuestionIndex === quiz?.questions.length - 1 ? (
                      <>Complete Quiz<Medal className="h-4 w-4 ml-1" /></>
                    ) : (
                      <>Next<ArrowRight className="h-4 w-4 ml-1" /></>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-border">
              <h2 className="text-2xl font-bold mb-4 text-center">Quiz Results</h2>
              
              {(() => {
                const results = calculateResults();
                
                return (
                  <div>
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="p-4 rounded-lg bg-secondary/50 text-center">
                        <p className="text-sm text-muted-foreground">Total Questions</p>
                        <p className="text-2xl font-semibold">{results.totalQuestions}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-green-500/10 text-center">
                        <p className="text-sm text-green-800">Correct</p>
                        <p className="text-2xl font-semibold text-green-700">{results.correctCount}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-red-500/10 text-center">
                        <p className="text-sm text-red-800">Incorrect</p>
                        <p className="text-2xl font-semibold text-red-700">{results.incorrectCount}</p>
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Score</span>
                        <span className="font-semibold">{results.score}%</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2.5">
                        <div 
                          className={`h-2.5 rounded-full transition-all duration-1000 ${
                            results.score >= 80 ? 'bg-green-500' : 
                            results.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${results.score}%` }}
                        ></div>
                      </div>
                      
                      {completionTime && (
                        <div className="flex items-center justify-between mt-4">
                          <span className="font-medium flex items-center">
                            <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                            Completion Time
                          </span>
                          <span className="font-semibold">
                            {Math.floor(completionTime / 60)}m {completionTime % 60}s
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {!scoreSubmitted ? (
                      <div className="mb-8 p-4 border border-dashed border-primary/50 rounded-lg bg-primary/5">
                        <h3 className="font-semibold text-center mb-4 flex items-center justify-center">
                          <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
                          Join the Leaderboard
                        </h3>
                        
                        <div className="space-y-4">
                          <div className="flex flex-col sm:flex-row gap-2">
                            <div className="flex-1">
                              <Input 
                                placeholder="Enter your name" 
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                className="w-full"
                                maxLength={30}
                              />
                            </div>
                            <Button 
                              onClick={handleSubmitScore}
                              disabled={submittingScore || !userName.trim()} 
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <Users className="h-4 w-4 mr-1" />
                              Submit Score
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : null}
                    
                    <div className="mb-8">
                      <h3 className="font-semibold mb-4 flex items-center">
                        <Award className="h-5 w-5 mr-2 text-yellow-500" />
                        Leaderboard
                      </h3>
                      <LeaderboardComponent quizId={quizId as string} />
                    </div>
                    
                    <div className="space-y-3">
                      <h3 className="font-semibold">Question Summary</h3>
                      
                      {quiz.questions.map((question: QuizQuestion, index: number) => {
                        const userAnswer = userAnswers[index];
                        let isCorrect;
                        
                        if (question.type === "fill_in") {
                          isCorrect = String(userAnswer).toLowerCase().trim() === String(question.correctAnswer).toLowerCase().trim();
                        } else {
                          isCorrect = userAnswer === question.correctAnswer;
                        }
                        
                        return (
                          <div 
                            key={question.id} 
                            className={`p-3 rounded-lg ${isCorrect ? 'bg-green-500/10' : 'bg-red-500/10'}`}
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-medium">{index + 1}. {question.question}</p>
                                <p className="text-sm mt-1">
                                  {isCorrect 
                                    ? <span className="text-green-700">Correct</span> 
                                    : <span className="text-red-700">
                                        Incorrect. Correct answer: {
                                          question.type === "multiple_choice" 
                                            ? question.options[question.correctAnswer as number] 
                                            : question.correctAnswer
                                        }
                                      </span>
                                  }
                                </p>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="ml-2 text-xs"
                                onClick={() => {
                                  setShowResults(false);
                                  setCurrentQuestionIndex(index);
                                }}
                              >
                                Review
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    <div className="flex justify-between mt-8">
                      <Button 
                        variant="outline"
                        onClick={() => navigate("/")}
                      >
                        Back to Home
                      </Button>
                      <Button 
                        onClick={handleRetryQuiz}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Retry Quiz
                      </Button>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default SharedQuiz;
