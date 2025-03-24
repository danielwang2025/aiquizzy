
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
import { ArrowLeft, ArrowRight, Medal, HelpCircle } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const Practice = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState<any>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<(string | number | null)[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [needsHint, setNeedsHint] = useState(false);
  
  useEffect(() => {
    if (quizId) {
      const quizData = getQuizById(quizId);
      if (quizData) {
        setQuiz(quizData);
        setUserAnswers(Array(quizData.questions.length).fill(null));
      } else {
        toast.error("Quiz not found");
        navigate("/customize");
      }
    } else {
      // If no quizId is provided, show available quizzes
      // In this simple version, just redirect to customize page
      navigate("/customize");
    }
    setLoading(false);
  }, [quizId, navigate]);
  
  const handleAnswer = (answer: string | number) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = answer;
    setUserAnswers(newAnswers);
    setNeedsHint(false);
  };
  
  const goToNextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setNeedsHint(false);
    } else {
      setShowResults(true);
    }
  };
  
  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setNeedsHint(false);
    }
  };
  
  const requestHint = () => {
    setNeedsHint(true);
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
  
  const getGeneralHint = (question: QuizQuestion) => {
    if (question.type === "multiple_choice") {
      return "考虑每个选项的含义，排除明显不合理的选项，然后再从剩余选项中做出选择。";
    } else {
      return "回想与问题相关的关键概念和术语，尝试用专业术语表达你的答案。";
    }
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
  
  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progressPercentage = (currentQuestionIndex / (quiz.questions.length - 1)) * 100;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <Navigation />
      
      <main className="py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-center">
            {quiz.title}
          </h1>
          
          {!showResults ? (
            <div>
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">进度</span>
                  <span className="text-sm font-medium">{currentQuestionIndex + 1} / {quiz.questions.length}</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-border">
                <div className="mb-4 flex justify-between items-center">
                  <div className="flex items-center">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-medium text-sm mr-2">
                      {currentQuestionIndex + 1}
                    </span>
                    <span className="text-sm bg-blue-50 text-blue-700 px-2 py-1 rounded-md capitalize">
                      {currentQuestion.difficulty}
                    </span>
                  </div>
                  
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8">
                        <HelpCircle className="h-4 w-4 mr-1" />
                        不确定
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-4">
                      <div className="space-y-2">
                        <h4 className="font-medium">提示</h4>
                        <p className="text-sm text-muted-foreground">
                          {getGeneralHint(currentQuestion)}
                        </p>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                
                <QuizQuestionComponent 
                  question={currentQuestion}
                  userAnswer={userAnswers[currentQuestionIndex]}
                  onAnswer={handleAnswer}
                  showResult={false}
                  index={currentQuestionIndex}
                />
                
                <div className="flex justify-between mt-6">
                  <Button
                    variant="outline"
                    onClick={goToPreviousQuestion}
                    disabled={currentQuestionIndex === 0}
                    className="flex items-center"
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    上一题
                  </Button>
                  
                  <Button
                    onClick={goToNextQuestion}
                    disabled={userAnswers[currentQuestionIndex] === null}
                    className="flex items-center bg-blue-600 hover:bg-blue-700"
                  >
                    {currentQuestionIndex === quiz.questions.length - 1 ? (
                      <>完成测试<Medal className="h-4 w-4 ml-1" /></>
                    ) : (
                      <>下一题<ArrowRight className="h-4 w-4 ml-1" /></>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-border">
              <h2 className="text-2xl font-bold mb-4 text-center">测试结果</h2>
              
              {(() => {
                const results = calculateResults();
                
                return (
                  <div>
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="p-4 rounded-lg bg-secondary/50 text-center">
                        <p className="text-sm text-muted-foreground">题目总数</p>
                        <p className="text-2xl font-semibold">{results.totalQuestions}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-green-500/10 text-center">
                        <p className="text-sm text-green-800">正确</p>
                        <p className="text-2xl font-semibold text-green-700">{results.correctCount}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-red-500/10 text-center">
                        <p className="text-sm text-red-800">错误</p>
                        <p className="text-2xl font-semibold text-red-700">{results.incorrectCount}</p>
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">得分</span>
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
                        <h4 className="font-semibold text-blue-800 mb-2">AI 学习建议</h4>
                        <p className="text-blue-700 text-sm">
                          {results.score >= 80 
                            ? "优秀的表现！考虑尝试更高难度的题目来挑战自己。" 
                            : results.score >= 60 
                            ? "不错的尝试！重点复习你错误的题目，加深理解。" 
                            : "继续努力！建议重新学习相关概念，然后再次尝试测试。"}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <h3 className="font-semibold">题目总结</h3>
                      
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
                                    ? <span className="text-green-700">正确</span> 
                                    : <span className="text-red-700">
                                        错误。正确答案: {
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
                                查看
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    <div className="flex justify-between mt-8">
                      <Button variant="outline" onClick={() => navigate("/customize")}>
                        创建新的测试
                      </Button>
                      <Button 
                        onClick={() => {
                          setCurrentQuestionIndex(0);
                          setUserAnswers(Array(quiz.questions.length).fill(null));
                          setShowResults(false);
                        }}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        重新测试
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
