import React, { useState, useReducer, useEffect } from "react";
import { QuizState, QuizQuestion, QuizResult, QuizAttempt, QuizHistory as QuizHistoryType } from "@/types/quiz";
import { generateQuestions } from "@/utils/api";
import LoadingSpinner from "./LoadingSpinner";
import QuizQuestionComponent from "./QuizQuestion";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  loadQuizHistory, 
  saveQuizAttempt, 
  addToReviewList, 
  removeFromReviewList,
  clearReviewList,
  clearAllHistory 
} from "@/utils/historyService";
import QuizHistory from "./QuizHistory";
import ReviewList from "./ReviewList";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";

// Action types
type QuizAction =
  | { type: "SET_LOADING" }
  | { type: "SET_QUESTIONS"; payload: QuizQuestion[] }
  | { type: "SET_ANSWER"; payload: { index: number; answer: string | number } }
  | { type: "COMPLETE_QUIZ"; payload: QuizResult }
  | { type: "RESET_QUIZ" }
  | { type: "LOAD_ATTEMPT"; payload: QuizAttempt }
  | { type: "SET_ERROR"; payload: string };

// Initial state for the quiz
const initialState: QuizState = {
  questions: [],
  currentQuestion: 0,
  answers: [],
  result: null,
  status: "idle",
  error: null,
};

// Reducer function to manage quiz state
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
    case "COMPLETE_QUIZ":
      return { ...state, result: action.payload, status: "completed" };
    case "RESET_QUIZ":
      return { ...initialState };
    case "LOAD_ATTEMPT":
      return {
        questions: action.payload.questions,
        answers: action.payload.userAnswers,
        result: action.payload.result,
        currentQuestion: 0,
        status: "completed",
        error: null,
      };
    case "SET_ERROR":
      return { ...state, error: action.payload, status: "idle" };
    default:
      return state;
  }
}

const QuizGenerator: React.FC = () => {
  const [state, dispatch] = useReducer(quizReducer, initialState);
  const [objectives, setObjectives] = useState("");
  const [quizHistory, setQuizHistory] = useState<QuizHistoryType>({ attempts: [], reviewList: [] });
  const [selectedIncorrectQuestions, setSelectedIncorrectQuestions] = useState<string[]>([]);
  
  // Load quiz history from localStorage on component mount
  useEffect(() => {
    setQuizHistory(loadQuizHistory());
  }, []);

  // Generate quiz based on learning objectives
  const handleGenerate = async () => {
    if (!objectives.trim()) {
      toast.error("Please enter learning objectives");
      return;
    }

    dispatch({ type: "SET_LOADING" });

    try {
      const questions = await generateQuestions(objectives);
      dispatch({ type: "SET_QUESTIONS", payload: questions });
      toast.success("Quiz generated successfully!");
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload: "Failed to generate quiz. Please try again.",
      });
      toast.error("Failed to generate quiz. Please check the console for details.");
    }
  };

  // Handle answer selection
  const handleAnswer = (index: number, answer: string | number) => {
    dispatch({
      type: "SET_ANSWER",
      payload: { index, answer },
    });
  };

  // Calculate and show results
  const handleComplete = () => {
    const { questions, answers } = state;
    
    // Check if all questions have been answered
    if (answers.some(answer => answer === null)) {
      toast.error("Please answer all questions before submitting");
      return;
    }

    // Calculate results
    let correctAnswers = 0;
    let incorrectAnswers = 0;
    let incorrectQuestionIds: string[] = [];

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
        incorrectQuestionIds.push(question.id);
      }
    });

    const score = Math.round((correctAnswers / questions.length) * 100);
    
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
    };

    dispatch({ type: "COMPLETE_QUIZ", payload: result });
    
    // Reset selected incorrect questions
    setSelectedIncorrectQuestions(incorrectQuestionIds);

    // Save the quiz attempt to history
    const attempt: QuizAttempt = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      objectives,
      questions,
      userAnswers: answers,
      result,
    };
    
    saveQuizAttempt(attempt);
    
    // Update local history state
    setQuizHistory(loadQuizHistory());
  };

  // Add selected incorrect questions to review list
  const handleAddToReviewList = () => {
    if (selectedIncorrectQuestions.length === 0) {
      toast.error("No questions selected to add to review list");
      return;
    }
    
    state.questions.forEach(question => {
      if (selectedIncorrectQuestions.includes(question.id)) {
        addToReviewList(question);
      }
    });
    
    toast.success(`Added ${selectedIncorrectQuestions.length} question(s) to review list`);
    setQuizHistory(loadQuizHistory());
    setSelectedIncorrectQuestions([]);
  };

  // Toggle selection of incorrect question
  const toggleSelectQuestion = (id: string) => {
    setSelectedIncorrectQuestions(prev => 
      prev.includes(id) 
        ? prev.filter(qId => qId !== id) 
        : [...prev, id]
    );
  };

  // Select all incorrect questions
  const selectAllIncorrectQuestions = () => {
    const incorrectIds = state.questions
      .filter((_, index) => {
        const userAnswer = state.answers[index];
        const correctAnswer = state.questions[index].correctAnswer;
        
        return state.questions[index].type === "fill_in" 
          ? String(userAnswer).toLowerCase().trim() !== String(correctAnswer).toLowerCase().trim()
          : userAnswer !== correctAnswer;
      })
      .map(q => q.id);
    
    setSelectedIncorrectQuestions(incorrectIds);
  };

  // Deselect all incorrect questions
  const deselectAllIncorrectQuestions = () => {
    setSelectedIncorrectQuestions([]);
  };

  // View a specific quiz attempt
  const handleViewAttempt = (attempt: QuizAttempt) => {
    dispatch({ type: "LOAD_ATTEMPT", payload: attempt });
  };

  // Handle removing a question from review list
  const handleRemoveFromReviewList = (id: string) => {
    removeFromReviewList(id);
    setQuizHistory(loadQuizHistory());
  };

  // Clear review list
  const handleClearReviewList = () => {
    clearReviewList();
    setQuizHistory(loadQuizHistory());
  };

  // Clear all history
  const handleClearHistory = () => {
    clearAllHistory();
    setQuizHistory({ attempts: [], reviewList: [] });
  };

  // Practice review list questions
  const handlePracticeReviewQuestions = (questions: QuizQuestion[]) => {
    dispatch({ type: "SET_QUESTIONS", payload: questions });
    setObjectives("Review List Practice");
  };

  // Reset the quiz
  const handleReset = () => {
    dispatch({ type: "RESET_QUIZ" });
    setObjectives("");
    setSelectedIncorrectQuestions([]);
  };

  // Try again with the same objectives
  const handleTryAgain = () => {
    handleGenerate();
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Quiz Generator</h2>
        
        {/* History Sheet Trigger */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline">History & Review</Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-md">
            <Tabs defaultValue="history" className="mt-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="history">Quiz History</TabsTrigger>
                <TabsTrigger value="review">Review List</TabsTrigger>
              </TabsList>
              <TabsContent value="history" className="mt-4">
                <QuizHistory 
                  attempts={quizHistory.attempts}
                  onViewAttempt={handleViewAttempt}
                  onClearHistory={handleClearHistory}
                />
              </TabsContent>
              <TabsContent value="review" className="mt-4">
                <ReviewList 
                  questions={quizHistory.reviewList}
                  onRemoveQuestion={handleRemoveFromReviewList}
                  onClearAll={handleClearReviewList}
                  onPracticeQuestions={handlePracticeReviewQuestions}
                />
              </TabsContent>
            </Tabs>
          </SheetContent>
        </Sheet>
      </div>

      {state.status === "idle" && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass-card rounded-2xl p-8"
        >
          <div className="mb-6">
            <label htmlFor="objectives" className="block text-sm font-medium mb-2">
              Learning Objectives
            </label>
            <textarea
              id="objectives"
              className="w-full p-3 h-32 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white/80 backdrop-blur-sm"
              placeholder="Enter your learning objectives here (e.g., 'Python float data type', 'JavaScript promises', 'React hooks')"
              value={objectives}
              onChange={(e) => setObjectives(e.target.value)}
            />
          </div>
          
          <button
            className="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2"
            onClick={handleGenerate}
          >
            Generate Quiz with DeepSeek AI
          </button>
          
          <p className="text-center text-sm text-muted-foreground mt-4">
            Enter specific learning objectives to generate customized questions tailored to your learning needs.
          </p>
        </motion.div>
      )}

      {state.status === "loading" && (
        <div className="min-h-[300px] flex flex-col items-center justify-center">
          <LoadingSpinner size="lg" className="mb-4" />
          <p className="text-muted-foreground animate-pulse-subtle">Generating personalized quiz questions with DeepSeek AI...</p>
          <p className="text-xs text-muted-foreground mt-2">This may take a few moments</p>
        </div>
      )}

      {(state.status === "active" || state.status === "completed") && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">{objectives}</h2>
            <button
              className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-secondary transition-colors"
              onClick={handleReset}
            >
              New Quiz
            </button>
          </div>

          <div className="mb-8">
            {state.questions.map((question, index) => {
              const isIncorrect = state.status === "completed" && 
                state.answers[index] !== question.correctAnswer;
              
              return (
                <div key={question.id} className="mb-6">
                  <QuizQuestionComponent
                    question={question}
                    userAnswer={state.answers[index]}
                    onAnswer={(answer) => handleAnswer(index, answer)}
                    showResult={state.status === "completed"}
                    index={index}
                  />
                  
                  {/* Show checkbox for incorrect questions in completed state */}
                  {state.status === "completed" && isIncorrect && (
                    <div className="mt-2 ml-11 flex items-center space-x-2">
                      <Checkbox 
                        id={`add-to-review-${question.id}`}
                        checked={selectedIncorrectQuestions.includes(question.id)}
                        onCheckedChange={() => toggleSelectQuestion(question.id)}
                      />
                      <label 
                        htmlFor={`add-to-review-${question.id}`}
                        className="text-sm text-muted-foreground cursor-pointer"
                      >
                        Add to review list
                      </label>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {state.status === "active" && (
            <button
              className="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2"
              onClick={handleComplete}
            >
              Check Answers
            </button>
          )}

          {state.status === "completed" && state.result && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="rounded-xl p-6 border border-border bg-white shadow-sm"
            >
              <h3 className="text-xl font-semibold mb-2">Quiz Results</h3>
              
              <div className="grid grid-cols-3 gap-4 mb-4">
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
              
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Score</span>
                  <span className="font-semibold">{state.result.score}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2.5">
                  <div 
                    className="h-2.5 rounded-full bg-primary transition-all duration-1000" 
                    style={{ width: `${state.result.score}%` }}
                  ></div>
                </div>
              </div>
              
              <p className="p-3 rounded-md bg-blue-500/10 text-blue-800 mb-4">{state.result.feedback}</p>
              
              {/* Add buttons for review list management if there are incorrect answers */}
              {state.result.incorrectAnswers > 0 && (
                <div className="mb-4 p-3 border border-border rounded-lg bg-secondary/10">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Add incorrect questions to review list</span>
                    <div className="space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={selectAllIncorrectQuestions}
                        className="text-xs h-7"
                      >
                        Select All
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={deselectAllIncorrectQuestions}
                        className="text-xs h-7"
                      >
                        Deselect All
                      </Button>
                    </div>
                  </div>
                  
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleAddToReviewList}
                    disabled={selectedIncorrectQuestions.length === 0}
                    className="w-full mt-2"
                  >
                    Add {selectedIncorrectQuestions.length} Selected Question(s) to Review List
                  </Button>
                </div>
              )}
              
              <Button
                className="w-full py-3 mt-2"
                onClick={handleTryAgain}
              >
                Try Again
              </Button>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuizGenerator;
