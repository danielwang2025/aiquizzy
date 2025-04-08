import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { getQuizById } from "@/utils/databaseService";
import QuizQuestionComponent from "@/components/QuizQuestion";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import LoadingSpinner from "@/components/LoadingSpinner";
import { QuizQuestion } from "@/types/quiz";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Medal, Clock, Zap, BarChart, BookOpen, Check, AlertCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const Practice = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState<any>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<(string | number | null)[]>([]);
  const [showResults, setShowResults] = useState(false);
  
  useEffect(() => {
    if (quizId) {
      if (quizId === "demo") {
        const demoQuiz = {
          id: "demo",
          title: "Demo Quiz",
          questions: [
            {
              id: "demo-q1",
              type: "multiple_choice",
              question: "What is React primarily used for?",
              options: ["Server-side scripting", "Building user interfaces", "Database management", "Network configuration"],
              correctAnswer: 1,
              explanation: "React is a JavaScript library for building user interfaces, particularly single-page applications.",
              difficulty: "easy"
            },
            {
              id: "demo-q2",
              type: "multiple_choice",
              question: "Which lifecycle method is called after a component is rendered for the first time?",
              options: ["componentWillMount", "componentDidMount", "componentWillUpdate", "componentDidUpdate"],
              correctAnswer: 1,
              explanation: "componentDidMount is called once the component has been rendered to the DOM for the first time.",
              difficulty: "medium"
            },
            {
              id: "demo-q3",
              type: "fill_in",
              question: "In React, the function that is used to update state variables is called ________.",
              correctAnswer: "setState",
              explanation: "setState is the method used to update state in class components in React.",
              difficulty: "easy"
            },
            {
              id: "demo-q4",
              type: "multiple_choice",
              question: "What does JSX stand for?",
              options: ["JavaScript XML", "Java Standard XML", "JavaScript Extension", "Java Syntax Extension"],
              correctAnswer: 0,
              explanation: "JSX stands for JavaScript XML. It allows us to write HTML in React.",
              difficulty: "easy"
            },
            {
              id: "demo-q5",
              type: "fill_in",
              question: "The React Hook used to perform side effects in function components is called ________.",
              correctAnswer: "useEffect",
              explanation: "useEffect is a Hook that lets you perform side effects in function components.",
              difficulty: "medium"
            }
          ]
        };
        
        setQuiz(demoQuiz);
        setUserAnswers(Array(demoQuiz.questions.length).fill(null));
        setLoading(false);
        return;
      }
      
      const quizData = getQuizById(quizId);
      if (quizData) {
        setQuiz(quizData);
        setUserAnswers(Array(quizData.questions.length).fill(null));
      } else {
        toast.error("Quiz not found");
        navigate("/customize");
      }
    } else {
      navigate("/customize");
    }
    setLoading(false);
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
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <Navigation />
        <div className="flex items-center justify-center min-h-[50vh]">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }
  
  if (!quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <Navigation />
        <div className="max-w-3xl mx-auto py-8 px-4 text-center">
          <h1 className="text-2xl font-bold mb-4">Quiz Not Found</h1>
          <p className="mb-6">The quiz you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate("/customize")}>Create a New Quiz</Button>
        </div>
      </div>
    );
  }
  
  const currentQuestion = quiz?.questions[currentQuestionIndex];
  const progressPercentage = quiz ? (currentQuestionIndex / (quiz.questions.length - 1)) * 100 : 0;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <Navigation />
      
      <main className="py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-center">
            {quiz?.title}
          </h1>
          
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
                      
                      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-semibold text-blue-800 mb-2">AI Learning Recommendations</h4>
                        <p className="text-blue-700 text-sm">
                          {results.score >= 80 
                            ? "Excellent performance! Consider trying more challenging questions to push yourself further." 
                            : results.score >= 60 
                            ? "Good attempt! Focus on reviewing the questions you got wrong to deepen your understanding." 
                            : "Keep practicing! We recommend revisiting the concepts and trying the quiz again."}
                        </p>
                      </div>
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
                      <Button variant="outline" onClick={() => navigate("/customize")}>
                        Create New Quiz
                      </Button>
                      <Button 
                        onClick={() => {
                          setCurrentQuestionIndex(0);
                          setUserAnswers(Array(quiz.questions.length).fill(null));
                          setShowResults(false);
                        }}
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
    </div>
  );
};

export default Practice;
