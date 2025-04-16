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

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Generate Quiz</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="objectives" className="block mb-2 font-medium">Learning Objectives or Content</Label>
            <textarea
              id="objectives"
              className="w-full h-32 p-3 border rounded-md"
              placeholder="Enter your learning objectives, content you want to learn, or paste text from your notes..."
              value={objectives}
              onChange={(e) => setObjectives(e.target.value)}
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="block mb-2 font-medium">Question Type</Label>
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="multipleChoice" 
                  checked={questionTypes.includes("multiple_choice")}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setQuestionTypes(prev => [...prev, "multiple_choice"]);
                    } else if (questionTypes.length > 1) {
                      setQuestionTypes(prev => prev.filter(type => type !== "multiple_choice"));
                    }
                  }}
                />
                <Label htmlFor="multipleChoice">Multiple Choice</Label>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Checkbox 
                  id="fillIn" 
                  checked={questionTypes.includes("fill_in")}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setQuestionTypes(prev => [...prev, "fill_in"]);
                    } else if (questionTypes.length > 1) {
                      setQuestionTypes(prev => prev.filter(type => type !== "fill_in"));
                    }
                  }}
                />
                <Label htmlFor="fillIn">Fill in the Blank</Label>
              </div>
            </div>

            <div>
              <Label className="block mb-2 font-medium">Question Difficulty</Label>
              <Select value={bloomLevel} onValueChange={(value: any) => setBloomLevel(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="remember">Remember (Easy)</SelectItem>
                  <SelectItem value="understand">Understand (Basic)</SelectItem>
                  <SelectItem value="apply">Apply (Medium)</SelectItem>
                  <SelectItem value="analyze">Analyze (Challenging)</SelectItem>
                  <SelectItem value="evaluate">Evaluate (Advanced)</SelectItem>
                  <SelectItem value="create">Create (Expert)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="block mb-2 font-medium">Number of Questions: {questionCount}</Label>
              <Slider
                value={[questionCount]}
                min={2}
                max={20}
                step={1}
                onValueChange={(value) => setQuestionCount(value[0])}
                className="py-4"
              />
            </div>
          </div>

          <Button 
            onClick={handleGenerate} 
            disabled={state.status === "loading" || demoLimitReached}
            className="mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            {state.status === "loading" ? (
              <>
                <LoadingSpinner size="sm" />
                Generating...
              </>
            ) : (
              <>
                <Lightbulb className="w-4 h-4 mr-2" />
                Generate Practice Quiz
              </>
            )}
          </Button>
          
          {demoLimitReached && (
            <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-yellow-800 dark:text-yellow-200 flex items-center">
                <LockKeyhole className="inline-block mr-2 h-5 w-5" />
                You've reached the demo limit. Please sign in to continue.
              </p>
              <Button 
                variant="outline" 
                className="mt-2 text-sm border-yellow-300 hover:bg-yellow-100 dark:border-yellow-700 dark:hover:bg-yellow-900/40"
                onClick={handleLoginClick}
              >
                Sign In
              </Button>
            </div>
          )}

          {state.error && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-700 dark:text-red-200">{state.error}</p>
            </div>
          )}
        </div>
      </div>

      {state.status === "completed" && state.result && (
        <div className="my-8">
          <h3 className="text-xl font-bold mb-4">Quiz Results</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="text-muted-foreground text-sm">Total Questions</div>
              <div className="text-2xl font-bold">{state.result.totalQuestions}</div>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="text-muted-foreground text-sm">Correct Answers</div>
              <div className="text-2xl font-bold text-green-600">{state.result.correctAnswers}</div>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="text-muted-foreground text-sm">Incorrect Answers</div>
              <div className="text-2xl font-bold text-red-600">{state.result.incorrectAnswers}</div>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="text-muted-foreground text-sm">Score</div>
              <div className="text-2xl font-bold">{state.result.score}%</div>
            </div>
          </div>

          <div className="mb-6">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Export to Document
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Export Quiz</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="docTitle">Document Title</Label>
                    <input
                      id="docTitle"
                      className="w-full p-2 mt-1 border rounded"
                      value={documentTitle}
                      onChange={(e) => setDocumentTitle(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeAnswers"
                      checked={includeAnswers}
                      onCheckedChange={(checked) => {
                        if (typeof checked === 'boolean') {
                          setIncludeAnswers(checked);
                        }
                      }}
                    />
                    <Label htmlFor="includeAnswers">Include Answers</Label>
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button
                    onClick={() => {
                      exportToDocx(
                        documentTitle || "Quiz",
                        state.questions,
                        state.answers,
                        includeAnswers
                      );
                    }}
                  >
                    Download
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-6">
            {state.questions.map((question, index) => (
              <QuizQuestionComponent
                key={question.id}
                question={question}
                questionNumber={index + 1}
                userAnswer={state.answers[index]}
                showAnswer={true}
                onAnswerChange={(answer) => {
                  dispatch({
                    type: "SET_ANSWER",
                    payload: { index, answer }
                  });
                }}
              />
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
            <Button variant="outline" onClick={() => dispatch({ type: "RESET_QUIZ" })}>
              <FilePlus className="mr-2 h-4 w-4" />
              New Quiz
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizGenerator;
