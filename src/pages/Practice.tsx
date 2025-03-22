
import React, { useState, useEffect, useReducer } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import QuizQuestionComponent from "@/components/QuizQuestion";
import { QuizState, QuizQuestion, QuizResult } from "@/types/quiz";
import { loadQuizHistory, saveQuizAttempt } from "@/utils/historyService";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Timer, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import LoadingSpinner from "@/components/LoadingSpinner";

// Import quizReducer if available or define it here
type QuizAction =
  | { type: "SET_LOADING" }
  | { type: "SET_QUESTIONS"; payload: QuizQuestion[] }
  | { type: "SET_ANSWER"; payload: { index: number; answer: string | number } }
  | { type: "NEXT_QUESTION" }
  | { type: "PREV_QUESTION" }
  | { type: "COMPLETE_QUIZ"; payload: QuizResult }
  | { type: "RESET_QUIZ" }
  | { type: "SET_ERROR"; payload: string }
  | { type: "START_TIMER" }
  | { type: "STOP_TIMER" };

// Initial state for the quiz
const initialState: QuizState = {
  questions: [],
  currentQuestion: 0,
  answers: [],
  result: null,
  status: "idle",
  error: null,
  startTime: undefined,
  endTime: undefined,
};

// Reducer function
function quizReducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, status: "loading", error: null };
    case "SET_QUESTIONS":
      return {
        ...state,
        questions: action.payload,
        answers: Array(action.payload.length).fill(null),
        status: "active",
        result: null,
        error: null,
      };
    case "SET_ANSWER":
      const newAnswers = [...state.answers];
      newAnswers[action.payload.index] = action.payload.answer;
      return { ...state, answers: newAnswers };
    case "NEXT_QUESTION":
      if (state.currentQuestion < state.questions.length - 1) {
        return { ...state, currentQuestion: state.currentQuestion + 1 };
      }
      return state;
    case "PREV_QUESTION":
      if (state.currentQuestion > 0) {
        return { ...state, currentQuestion: state.currentQuestion - 1 };
      }
      return state;
    case "COMPLETE_QUIZ":
      return { 
        ...state, 
        result: action.payload, 
        status: "completed",
        endTime: Date.now()
      };
    case "RESET_QUIZ":
      return { ...initialState };
    case "SET_ERROR":
      return { ...state, error: action.payload, status: "idle" };
    case "START_TIMER":
      return { ...state, startTime: Date.now() };
    case "STOP_TIMER":
      return { ...state, endTime: Date.now() };
    default:
      return state;
  }
}

const Practice: React.FC = () => {
  const { quizId } = useParams<{ quizId?: string }>();
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(quizReducer, initialState);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [objectives, setObjectives] = useState<string>("");
  
  // Load quiz from history if quizId is provided
  useEffect(() => {
    if (quizId) {
      const history = loadQuizHistory();
      const attempt = history.attempts.find(a => a.id === quizId);
      
      if (attempt) {
        dispatch({ type: "SET_QUESTIONS", payload: attempt.questions });
        setObjectives(attempt.objectives);
      } else {
        toast.error("Quiz not found");
        navigate("/customize");
      }
    } else if (state.questions.length === 0) {
      // No quiz ID and no questions loaded - redirect to quiz generator
      navigate("/customize");
    }
  }, [quizId, navigate]);
  
  // Start timer when quiz is active
  useEffect(() => {
    if (state.status === "active" && !state.startTime) {
      dispatch({ type: "START_TIMER" });
    }
  }, [state.status, state.startTime]);
  
  // Update elapsed time
  useEffect(() => {
    if (state.status === "active" && state.startTime) {
      const interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - state.startTime!) / 1000));
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [state.status, state.startTime]);
  
  // Format time as mm:ss
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle answer selection
  const handleAnswer = (answer: string | number) => {
    dispatch({
      type: "SET_ANSWER",
      payload: { index: state.currentQuestion, answer },
    });
  };
  
  // Navigate to next question
  const handleNextQuestion = () => {
    dispatch({ type: "NEXT_QUESTION" });
  };
  
  // Navigate to previous question
  const handlePrevQuestion = () => {
    dispatch({ type: "PREV_QUESTION" });
  };

  // Complete the quiz and calculate results
  const handleComplete = () => {
    const { questions, answers } = state;
    
    if (answers.some(answer => answer === null)) {
      toast.error("Please answer all questions before submitting");
      return;
    }

    dispatch({ type: "STOP_TIMER" });
    
    let correctAnswers = 0;
    let incorrectAnswers = 0;

    questions.forEach((question, index) => {
      const userAnswer = answers[index];
      const isCorrect = 
        question.type === "fill_in" 
          ? String(userAnswer).toLowerCase().trim() === String(question.correctAnswer).toLowerCase().trim()
          : userAnswer === question.correctAnswer;

      if (isCorrect) {
        correctAnswers++;
      } else {
        incorrectAnswers++;
      }
    });

    const score = Math.round((correctAnswers / questions.length) * 100);
    const completionTime = state.startTime ? Math.floor((Date.now() - state.startTime) / 1000) : 0;
    
    let feedback = "";
    if (score >= 90) {
      feedback = "Excellent! You've mastered these learning objectives.";
    } else if (score >= 70) {
      feedback = "Good job! You have a solid understanding of the material.";
    } else if (score >= 50) {
      feedback = "You're on the right track, but there's room for improvement.";
    } else {
      feedback = "You might want to review the material again to strengthen your understanding.";
    }

    const result: QuizResult = {
      totalQuestions: questions.length,
      correctAnswers,
      incorrectAnswers,
      score,
      feedback,
      completionTime
    };

    dispatch({ type: "COMPLETE_QUIZ", payload: result });
    
    const attempt = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      objectives,
      questions,
      userAnswers: answers,
      result,
    };
    
    saveQuizAttempt(attempt);
    
    toast.success("Quiz completed!");
  };

  // Reset the quiz
  const handleReset = () => {
    dispatch({ type: "RESET_QUIZ" });
    navigate("/customize");
  };

  // Current question and progress
  const currentQuestion = state.questions[state.currentQuestion];
  const progress = state.questions.length > 0 
    ? ((state.currentQuestion + 1) / state.questions.length) * 100 
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <Navigation />
      
      <main className="py-8 px-4 max-w-3xl mx-auto">
        {state.status === "loading" && (
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <LoadingSpinner size="lg" className="mb-4" />
            <p className="text-muted-foreground">Loading quiz...</p>
          </div>
        )}
        
        {state.status === "active" && state.questions.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold">{objectives}</h1>
              <div className="flex items-center gap-2">
                <Timer className="h-5 w-5 text-muted-foreground" />
                <span className="font-mono text-lg">{formatTime(elapsedTime)}</span>
              </div>
            </div>
            
            <div className="mb-6">
              <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <span>Question {state.currentQuestion + 1} of {state.questions.length}</span>
                <span>{Math.round(progress)}% completed</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
            
            <motion.div
              key={state.currentQuestion}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <QuizQuestionComponent
                question={currentQuestion}
                userAnswer={state.answers[state.currentQuestion]}
                onAnswer={handleAnswer}
                showResult={false}
                index={state.currentQuestion}
              />
            </motion.div>
            
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={handlePrevQuestion}
                disabled={state.currentQuestion === 0}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              
              {state.currentQuestion < state.questions.length - 1 ? (
                <Button
                  onClick={handleNextQuestion}
                  className="flex items-center gap-2"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleComplete}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Submit Quiz
                </Button>
              )}
            </div>
            
            {state.answers.some(a => a === null) && (
              <div className="flex items-center gap-2 mt-4 text-sm text-amber-600">
                <AlertCircle className="h-4 w-4" />
                <span>Some questions are unanswered. You'll need to answer all questions before submitting.</span>
              </div>
            )}
          </div>
        )}
        
        {state.status === "completed" && state.result && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="rounded-xl p-6 border border-border bg-white shadow-sm"
          >
            <h2 className="text-2xl font-semibold mb-4">Quiz Results</h2>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="p-4 rounded-lg bg-secondary/50 text-center">
                <p className="text-sm text-muted-foreground">Total Questions</p>
                <p className="text-2xl font-semibold">{state.result.totalQuestions}</p>
              </div>
              <div className="p-4 rounded-lg bg-green-500/10 text-center">
                <p className="text-sm text-green-800">Correct</p>
                <p className="text-2xl font-semibold text-green-700">{state.result.correctAnswers}</p>
              </div>
              <div className="p-4 rounded-lg bg-red-500/10 text-center">
                <p className="text-sm text-red-800">Incorrect</p>
                <p className="text-2xl font-semibold text-red-700">{state.result.incorrectAnswers}</p>
              </div>
            </div>
            
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Score</span>
                <span className="font-semibold">{state.result.score}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2.5">
                <div 
                  className="h-2.5 rounded-full transition-all duration-1000" 
                  style={{ 
                    width: `${state.result.score}%`,
                    backgroundColor: state.result.score >= 70 ? '#10b981' : state.result.score >= 40 ? '#f59e0b' : '#ef4444'
                  }}
                ></div>
              </div>
            </div>
            
            {state.result.completionTime && (
              <div className="mb-6 p-4 rounded-lg bg-blue-500/10">
                <div className="flex items-center gap-2">
                  <Timer className="h-5 w-5 text-blue-700" />
                  <span className="font-medium text-blue-800">Completion Time</span>
                </div>
                <p className="text-xl font-mono mt-1 text-blue-700">{formatTime(state.result.completionTime)}</p>
              </div>
            )}
            
            <p className="p-4 rounded-md bg-blue-500/10 text-blue-800 mb-6">{state.result.feedback}</p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="outline"
                onClick={handleReset}
                className="flex-1"
              >
                New Quiz
              </Button>
              <Button
                onClick={() => navigate('/review')}
                className="flex-1"
              >
                Review Questions
              </Button>
              <Button
                onClick={() => navigate('/dashboard')}
                variant="secondary"
                className="flex-1"
              >
                View Dashboard
              </Button>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default Practice;
