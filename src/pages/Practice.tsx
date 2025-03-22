import React, { useState, useEffect, useReducer } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import QuizQuestionComponent from "@/components/QuizQuestion";
import { QuizState, QuizQuestion, QuizResult } from "@/types/quiz";
import { loadQuizHistory, saveQuizAttempt } from "@/utils/historyService";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Timer, ChevronLeft, ChevronRight, AlertCircle, Moon, Sun, Medal } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

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
  const [nightMode, setNightMode] = useState<boolean>(false);
  const [showTutorial, setShowTutorial] = useState<boolean>(false);
  
  useEffect(() => {
    const savedNightMode = localStorage.getItem('nightMode');
    if (savedNightMode) {
      setNightMode(savedNightMode === 'true');
    }
    
    const tutorialShown = localStorage.getItem('practiceTutorialShown');
    if (!tutorialShown) {
      setShowTutorial(true);
      localStorage.setItem('practiceTutorialShown', 'true');
    }
    
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
      navigate("/customize");
    }
  }, [quizId, navigate]);
  
  useEffect(() => {
    if (state.status === "active" && !state.startTime) {
      dispatch({ type: "START_TIMER" });
    }
  }, [state.status, state.startTime]);
  
  useEffect(() => {
    if (state.status === "active" && state.startTime) {
      const interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - state.startTime!) / 1000));
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [state.status, state.startTime]);
  
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (answer: string | number) => {
    dispatch({
      type: "SET_ANSWER",
      payload: { index: state.currentQuestion, answer },
    });
    
    const questionElement = document.getElementById(`question-${state.currentQuestion}`);
    if (questionElement) {
      questionElement.classList.add('animate-pulse');
      setTimeout(() => {
        questionElement.classList.remove('animate-pulse');
      }, 300);
    }
  };
  
  const handleNextQuestion = () => {
    dispatch({ type: "NEXT_QUESTION" });
  };
  
  const handlePrevQuestion = () => {
    dispatch({ type: "PREV_QUESTION" });
  };

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

  const handleReset = () => {
    dispatch({ type: "RESET_QUIZ" });
    navigate("/customize");
  };

  const toggleNightMode = () => {
    setNightMode(!nightMode);
    localStorage.setItem('nightMode', (!nightMode).toString());
  };

  const currentQuestion = state.questions[state.currentQuestion];
  const progress = state.questions.length > 0 
    ? ((state.currentQuestion + 1) / state.questions.length) * 100 
    : 0;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      nightMode 
        ? "bg-gray-900 text-white" 
        : "bg-gradient-to-br from-blue-50 to-indigo-50"
    }`}>
      <Navigation />
      
      <main className="py-8 px-4 max-w-3xl mx-auto">
        <div className="flex justify-end mb-4">
          <div className="flex items-center space-x-2">
            <Sun className="h-4 w-4 text-yellow-500" />
            <Switch 
              checked={nightMode}
              onCheckedChange={toggleNightMode}
              id="night-mode"
            />
            <Moon className="h-4 w-4 text-blue-300" />
          </div>
        </div>
        
        {state.status === "loading" && (
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <LoadingSpinner size="lg" className="mb-4" />
            <p className={`text-muted-foreground ${nightMode ? "text-gray-400" : ""}`}>Loading quiz...</p>
          </div>
        )}
        
        {state.status === "active" && state.questions.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h1 className={`text-2xl font-bold ${nightMode ? "text-white" : ""}`}>{objectives}</h1>
              <div className={`flex items-center gap-2 ${nightMode ? "text-white" : ""}`}>
                <Timer className="h-5 w-5 text-muted-foreground" />
                <span className="font-mono text-lg">{formatTime(elapsedTime)}</span>
              </div>
            </div>
            
            <div className="mb-6">
              <div className={`flex justify-between text-sm mb-2 ${
                nightMode ? "text-gray-400" : "text-muted-foreground"
              }`}>
                <span>Question {state.currentQuestion + 1} of {state.questions.length}</span>
                <span>{Math.round(progress)}% completed</span>
              </div>
              <Progress value={progress} className={`h-2 ${nightMode ? "bg-gray-700" : ""}`} />
            </div>
            
            <AnimatePresence mode="wait">
              <motion.div
                key={state.currentQuestion}
                id={`question-${state.currentQuestion}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className={nightMode ? "opacity-90" : ""}
              >
                <QuizQuestionComponent
                  question={currentQuestion}
                  userAnswer={state.answers[state.currentQuestion]}
                  onAnswer={handleAnswer}
                  showResult={false}
                  index={state.currentQuestion}
                  nightMode={nightMode}
                />
              </motion.div>
            </AnimatePresence>
            
            <div className="flex justify-between mt-8">
              <Button
                variant={nightMode ? "secondary" : "outline"}
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
                  className={`flex items-center gap-2 ${
                    nightMode 
                      ? "bg-indigo-600 hover:bg-indigo-700" 
                      : ""
                  }`}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleComplete}
                  className={`${
                    nightMode 
                      ? "bg-green-700 hover:bg-green-800" 
                      : "bg-green-600 hover:bg-green-700"
                  }`}
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
            className={`rounded-xl p-6 border shadow-sm ${
              nightMode 
                ? "bg-gray-800 border-gray-700" 
                : "bg-white border-border"
            }`}
          >
            <h2 className={`text-2xl font-semibold mb-4 ${nightMode ? "text-white" : ""}`}>Quiz Results</h2>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className={`p-4 rounded-lg text-center ${
                nightMode ? "bg-gray-700" : "bg-secondary/50"
              }`}>
                <p className={`text-sm ${nightMode ? "text-gray-300" : "text-muted-foreground"}`}>Total Questions</p>
                <p className="text-2xl font-semibold">{state.result.totalQuestions}</p>
              </div>
              <div className={`p-4 rounded-lg text-center ${
                nightMode ? "bg-green-900/30" : "bg-green-500/10"
              }`}>
                <p className={`text-sm ${nightMode ? "text-green-300" : "text-green-800"}`}>Correct</p>
                <p className={`text-2xl font-semibold ${nightMode ? "text-green-400" : "text-green-700"}`}>
                  {state.result.correctAnswers}
                </p>
              </div>
              <div className={`p-4 rounded-lg text-center ${
                nightMode ? "bg-red-900/30" : "bg-red-500/10"
              }`}>
                <p className={`text-sm ${nightMode ? "text-red-300" : "text-red-800"}`}>Incorrect</p>
                <p className={`text-2xl font-semibold ${nightMode ? "text-red-400" : "text-red-700"}`}>
                  {state.result.incorrectAnswers}
                </p>
              </div>
            </div>
            
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className={`font-medium ${nightMode ? "text-white" : ""}`}>Score</span>
                <span className="font-semibold">{state.result.score}%</span>
              </div>
              <div className={`w-full rounded-full h-2.5 ${nightMode ? "bg-gray-700" : "bg-secondary"}`}>
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${state.result.score}%` }}
                  transition={{ duration: 1 }}
                  className="h-2.5 rounded-full transition-all" 
                  style={{ 
                    backgroundColor: 
                      state.result.score >= 70 
                        ? '#10b981' 
                        : state.result.score >= 40 
                          ? '#f59e0b' 
                          : '#ef4444'
                  }}
                ></motion.div>
              </div>
            </div>
            
            {state.result.completionTime && (
              <div className={`mb-6 p-4 rounded-lg ${
                nightMode ? "bg-blue-900/20" : "bg-blue-500/10"
              }`}>
                <div className="flex items-center gap-2">
                  <Timer className={`h-5 w-5 ${nightMode ? "text-blue-400" : "text-blue-700"}`} />
                  <span className={`font-medium ${nightMode ? "text-blue-300" : "text-blue-800"}`}>
                    Completion Time
                  </span>
                </div>
                <p className={`text-xl font-mono mt-1 ${nightMode ? "text-blue-400" : "text-blue-700"}`}>
                  {formatTime(state.result.completionTime)}
                </p>
              </div>
            )}
            
            {state.result.pointsAwarded && (
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.3 }}
                className={`mb-6 p-4 rounded-lg border-2 ${
                  nightMode 
                    ? "bg-yellow-900/20 border-yellow-700/50" 
                    : "bg-yellow-500/10 border-yellow-500/30"
                }`}
              >
                <div className="flex justify-center items-center gap-2">
                  <Medal className={`h-6 w-6 ${nightMode ? "text-yellow-400" : "text-yellow-600"}`} />
                  <span className={`font-bold text-lg ${nightMode ? "text-yellow-300" : "text-yellow-800"}`}>
                    +{state.result.pointsAwarded} Points Earned!
                  </span>
                </div>
              </motion.div>
            )}
            
            <p className={`p-4 rounded-md ${
              nightMode 
                ? "bg-blue-900/20 text-blue-300" 
                : "bg-blue-500/10 text-blue-800"
            } mb-6`}>
              {state.result.feedback}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                variant={nightMode ? "secondary" : "outline"}
                onClick={handleReset}
                className="flex-1"
              >
                New Quiz
              </Button>
              <Button
                onClick={() => navigate('/review')}
                className={`flex-1 ${
                  nightMode ? "bg-indigo-600 hover:bg-indigo-700" : ""
                }`}
              >
                Review Questions
              </Button>
              <Button
                onClick={() => navigate('/dashboard')}
                variant={nightMode ? "outline" : "secondary"}
                className="flex-1"
              >
                View Dashboard
              </Button>
            </div>
          </motion.div>
        )}
        
        {showTutorial && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md">
              <h3 className="text-xl font-bold mb-4">Welcome to the Practice Mode!</h3>
              <p className="mb-4">Here's how to use this screen:</p>
              <ol className="list-decimal pl-5 mb-6 space-y-2">
                <li>Answer questions at your own pace</li>
                <li>Use night mode if you're studying in the dark</li>
                <li>Track your progress with the timer and progress bar</li>
                <li>Submit when you're done to see detailed results</li>
                <li>Earn points for completing quizzes successfully!</li>
              </ol>
              <Button 
                onClick={() => setShowTutorial(false)}
                className="w-full"
              >
                Got it!
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Practice;
