import React, { useState, useReducer, useEffect } from "react";
import { QuizState, QuizQuestion, QuizResult, QuizAttempt, QuizHistory as QuizHistoryType, DisputedQuestion } from "@/types/quiz";
import { generateQuestions } from "@/utils/api";
import LoadingSpinner from "./LoadingSpinner";
import QuizQuestionComponent from "./QuizQuestion";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { loadQuizHistory, saveQuizAttempt, addToReviewList, removeFromReviewList, clearReviewList, clearAllHistory } from "@/utils/historyService";
import { saveQuizToDatabase } from "@/utils/databaseService";
import QuizHistory from "./QuizHistory";
import ReviewList from "./ReviewList";
import DisputedQuestions from "./DisputedQuestions";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate } from "react-router-dom";
import { isAuthenticated } from "@/utils/authService";
import { exportToDocx } from "@/utils/documentExport";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Download, FileText, BookOpen, Lightbulb, Pencil, BookCheck, FileCheck, FilePlus } from "lucide-react";

interface QuizGeneratorProps {
  initialTopic?: string;
  onQuizGenerated?: (quizId: string) => void;
}

type QuizAction = {
  type: "SET_LOADING";
} | {
  type: "SET_QUESTIONS";
  payload: QuizQuestion[];
} | {
  type: "SET_ANSWER";
  payload: {
    index: number;
    answer: string | number;
  };
} | {
  type: "COMPLETE_QUIZ";
  payload: QuizResult;
} | {
  type: "RESET_QUIZ";
} | {
  type: "LOAD_ATTEMPT";
  payload: QuizAttempt;
} | {
  type: "SET_ERROR";
  payload: string;
} | {
  type: "REMOVE_QUESTION";
  payload: string;
};

const initialState: QuizState = {
  questions: [],
  currentQuestion: 0,
  answers: [],
  result: null,
  status: "idle",
  error: null
};

function quizReducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case "SET_LOADING":
      return {
        ...state,
        status: "loading",
        error: null
      };
    case "SET_QUESTIONS":
      return {
        ...state,
        questions: action.payload,
        answers: Array(action.payload.length).fill(null),
        status: "active",
        result: null,
        error: null
      };
    case "SET_ANSWER":
      const newAnswers = [...state.answers];
      newAnswers[action.payload.index] = action.payload.answer;
      return {
        ...state,
        answers: newAnswers
      };
    case "COMPLETE_QUIZ":
      return {
        ...state,
        result: action.payload,
        status: "completed"
      };
    case "RESET_QUIZ":
      return {
        ...initialState
      };
    case "LOAD_ATTEMPT":
      return {
        questions: action.payload.questions,
        answers: action.payload.userAnswers,
        result: action.payload.result,
        currentQuestion: 0,
        status: "completed",
        error: null
      };
    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
        status: "idle"
      };
    case "REMOVE_QUESTION":
      const filteredQuestions = state.questions.filter(q => q.id !== action.payload);
      const filteredAnswers = state.answers.filter((_, idx) => state.questions[idx].id !== action.payload);
      let updatedResult = state.result;
      if (state.status === "completed" && state.result) {
        const totalQuestions = filteredQuestions.length;
        let correctAnswers = 0;
        let incorrectAnswers = 0;
        filteredQuestions.forEach((question, index) => {
          const isCorrect = filteredAnswers[index] === question.correctAnswer;
          if (isCorrect) correctAnswers++;else incorrectAnswers++;
        });
        const score = totalQuestions > 0 ? Math.round(correctAnswers / totalQuestions * 100) : 0;
        updatedResult = {
          totalQuestions,
          correctAnswers,
          incorrectAnswers,
          score,
          feedback: state.result.feedback
        };
      }
      return {
        ...state,
        questions: filteredQuestions,
        answers: filteredAnswers,
        result: updatedResult
      };
    default:
      return state;
  }
}

const QuizGenerator: React.FC<QuizGeneratorProps> = ({
  initialTopic = "",
  onQuizGenerated
}) => {
  const [state, dispatch] = useReducer(quizReducer, initialState);
  const [objectives, setObjectives] = useState(initialTopic);
  const [quizHistory, setQuizHistory] = useState<QuizHistoryType>({
    attempts: [],
    reviewList: [],
    disputedQuestions: []
  });
  const [selectedIncorrectQuestions, setSelectedIncorrectQuestions] = useState<string[]>([]);
  const navigate = useNavigate();
  const isAuth = isAuthenticated();
  const [bloomLevel, setBloomLevel] = useState<"remember" | "understand" | "apply" | "analyze" | "evaluate" | "create">("understand");
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [questionTypes, setQuestionTypes] = useState<("multiple_choice" | "fill_in")[]>(["multiple_choice", "fill_in"]);
  const [includeAnswers, setIncludeAnswers] = useState(false);
  const [documentTitle, setDocumentTitle] = useState("");
  const [demoLimitReached, setDemoLimitReached] = useState(false);

  useEffect(() => {
    setQuizHistory(loadQuizHistory());
    if (!isAuth) {
      const demoUsage = localStorage.getItem("demoQuizUsage");
      const usage = demoUsage ? JSON.parse(demoUsage) : {
        count: 0,
        timestamp: Date.now()
      };
      const oneDayMs = 24 * 60 * 60 * 1000;
      if (Date.now() - usage.timestamp > oneDayMs) {
        localStorage.setItem("demoQuizUsage", JSON.stringify({
          count: 0,
          timestamp: Date.now()
        }));
      } else if (usage.count >= 5) {
        setDemoLimitReached(true);
      }
    }
  }, [isAuth]);

  useEffect(() => {
    if (objectives) {
      setDocumentTitle(objectives.length > 50 ? objectives.substring(0, 50) + "..." : objectives);
    }
  }, [objectives]);

  const handleGenerate = async () => {
    const combinedObjectives = objectives.trim();
    if (!combinedObjectives) {
      toast.error("Please enter learning objectives");
      return;
    }
    
    if (!isAuth) {
      const demoUsage = localStorage.getItem("demoQuizUsage");
      const usage = demoUsage ? JSON.parse(demoUsage) : {
        count: 0,
        timestamp: Date.now()
      };
      if (usage.count >= 5) {
        setDemoLimitReached(true);
        toast.error("You've reached the demo limit (5 quizzes). Please sign in to continue.");
        return;
      }
      const newUsage = {
        count: usage.count + 1,
        timestamp: usage.timestamp
      };
      localStorage.setItem("demoQuizUsage", JSON.stringify(newUsage));
      const remaining = 5 - newUsage.count;
      if (remaining <= 2) {
        toast.info(`Demo mode: ${remaining} ${remaining === 1 ? 'attempt' : 'attempts'} remaining`);
      }
      if (newUsage.count >= 5) {
        setDemoLimitReached(true);
      }
    }
    
    dispatch({
      type: "SET_LOADING"
    });
    try {
      toast.loading("The AI is generating practice questions, which may take a little time...", {
        duration: 30000
      });
      const questions = await generateQuestions(objectives, {
        bloomLevel,
        count: questionCount,
        questionTypes
      });
      if (questions && questions.length > 0) {
        dispatch({
          type: "SET_QUESTIONS",
          payload: questions
        });
        const quizTitle = objectives.length > 50 ? objectives.substring(0, 50) + "..." : objectives;
        const quizId = saveQuizToDatabase(questions, quizTitle);
        console.log("Quiz saved to database with ID:", quizId);
        if (onQuizGenerated && quizId) {
          onQuizGenerated(quizId);
        }
        toast.dismiss();
        toast.success("Quiz generated successfully!");
      } else {
        throw new Error("No questions were generated");
      }
    } catch (error: any) {
      console.error("Error generating quiz:", error);
      toast.dismiss();
      toast.error(error.message || "Failed to generate quiz. Please try again.");
      dispatch({
        type: "SET_ERROR",
        payload: "Failed to generate quiz. Please try again."
      });
    }
  };

  // ... rest of the component remains unchanged
};

export default QuizGenerator;
