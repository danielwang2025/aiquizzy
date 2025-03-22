
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { getQuizById } from "@/utils/databaseService";
import QuizQuestionComponent from "@/components/QuizQuestion";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import LoadingSpinner from "@/components/LoadingSpinner";
import { QuizQuestion } from "@/types/quiz";

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
  
  const currentQuestion = quiz.questions[currentQuestionIndex];
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <Navigation />
      
      <main className="py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-center">
            {quiz.title}
          </h1>
          
          {!showResults ? (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-border">
              <div className="mb-4 flex justify-between items-center">
                <span className="text-sm font-medium">
                  Question {currentQuestionIndex + 1} of {quiz.questions.length}
                </span>
                <span className="text-sm text-muted-foreground">
                  {currentQuestion.difficulty}
                </span>
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
                >
                  Previous
                </Button>
                
                <Button
                  onClick={goToNextQuestion}
                  disabled={userAnswers[currentQuestionIndex] === null}
                >
                  {currentQuestionIndex === quiz.questions.length - 1 ? "Finish" : "Next"}
                </Button>
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
                          className="h-2.5 rounded-full bg-primary transition-all duration-1000" 
                          style={{ width: `${results.score}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <h3 className="font-semibold">Questions Summary</h3>
                      
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
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    <div className="flex justify-between mt-8">
                      <Button variant="outline" onClick={() => navigate("/customize")}>
                        Create New Quiz
                      </Button>
                      <Button onClick={() => {
                        setCurrentQuestionIndex(0);
                        setUserAnswers(Array(quiz.questions.length).fill(null));
                        setShowResults(false);
                      }}>
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
