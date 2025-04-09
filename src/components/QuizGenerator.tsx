import React, { useState, useReducer, useEffect } from "react";
import { QuizState, QuizQuestion, QuizResult, QuizAttempt, QuizHistory as QuizHistoryType, DisputedQuestion } from "@/types/quiz";
import { generateQuestions } from "@/utils/api";
import LoadingSpinner from "./LoadingSpinner";
import QuizQuestionComponent from "./QuizQuestion";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { 
  loadQuizHistory, 
  saveQuizAttempt, 
  addToReviewList, 
  removeFromReviewList,
  clearReviewList,
  clearAllHistory 
} from "@/utils/historyService";
import { saveQuizToDatabase } from "@/utils/databaseService";
import QuizHistory from "./QuizHistory";
import ReviewList from "./ReviewList";
import DisputedQuestions from "./DisputedQuestions";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate } from "react-router-dom";
import { isAuthenticated } from "@/utils/authService";
import { exportToDocx } from "@/utils/documentExport";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Download, 
  FileText, 
  BookOpen, 
  Lightbulb, 
  Pencil, 
  BookCheck, 
  FileCheck, 
  FilePlus 
} from "lucide-react";

interface QuizGeneratorProps {
  initialTopic?: string;
  isAuthenticated?: boolean;
  userId?: string;
}

type QuizAction =
  | { type: "SET_LOADING" }
  | { type: "SET_QUESTIONS"; payload: QuizQuestion[] }
  | { type: "SET_ANSWER"; payload: { index: number; answer: string | number } }
  | { type: "COMPLETE_QUIZ"; payload: QuizResult }
  | { type: "RESET_QUIZ" }
  | { type: "LOAD_ATTEMPT"; payload: QuizAttempt }
  | { type: "SET_ERROR"; payload: string }
  | { type: "REMOVE_QUESTION"; payload: string };

const initialState: QuizState = {
  questions: [],
  currentQuestion: 0,
  answers: [],
  result: null,
  status: "idle",
  error: null,
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
    case "REMOVE_QUESTION":
      const filteredQuestions = state.questions.filter(q => q.id !== action.payload);
      const filteredAnswers = state.answers.filter((_, idx) => 
        state.questions[idx].id !== action.payload
      );
      
      let updatedResult = state.result;
      if (state.status === "completed" && state.result) {
        const totalQuestions = filteredQuestions.length;
        let correctAnswers = 0;
        let incorrectAnswers = 0;
        
        filteredQuestions.forEach((question, index) => {
          const isCorrect = filteredAnswers[index] === question.correctAnswer;
          if (isCorrect) correctAnswers++;
          else incorrectAnswers++;
        });
        
        const score = totalQuestions > 0 
          ? Math.round((correctAnswers / totalQuestions) * 100) 
          : 0;
          
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

const QuizGenerator: React.FC<QuizGeneratorProps> = ({ initialTopic = "", isAuthenticated = false, userId }) => {
  const [state, dispatch] = useReducer(quizReducer, initialState);
  const [objectives, setObjectives] = useState(initialTopic);
  const [quizHistory, setQuizHistory] = useState<QuizHistoryType>({ attempts: [], reviewList: [], disputedQuestions: [] });
  const [selectedIncorrectQuestions, setSelectedIncorrectQuestions] = useState<string[]>([]);
  const navigate = useNavigate();
  const isAuth = isAuthenticated;
  
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
      const usage = demoUsage ? JSON.parse(demoUsage) : { count: 0, timestamp: Date.now() };
      
      const oneDayMs = 24 * 60 * 60 * 1000;
      if (Date.now() - usage.timestamp > oneDayMs) {
        localStorage.setItem("demoQuizUsage", JSON.stringify({ count: 0, timestamp: Date.now() }));
      } else if (usage.count >= 5) {
        setDemoLimitReached(true);
      }
    }
  }, [isAuth]);

  useEffect(() => {
    if (objectives) {
      setDocumentTitle(objectives.length > 50 
        ? objectives.substring(0, 50) + "..." 
        : objectives);
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
      const usage = demoUsage ? JSON.parse(demoUsage) : { count: 0, timestamp: Date.now() };
      
      if (usage.count >= 5) {
        setDemoLimitReached(true);
        toast.error("You've reached the demo limit (5 quizzes). Please sign in to continue.");
        return;
      }
      
      const newUsage = { count: usage.count + 1, timestamp: usage.timestamp };
      localStorage.setItem("demoQuizUsage", JSON.stringify(newUsage));
      
      const remaining = 5 - newUsage.count;
      if (remaining <= 2) {
        toast.info(`Demo mode: ${remaining} ${remaining === 1 ? 'attempt' : 'attempts'} remaining`);
      }
      
      if (newUsage.count >= 5) {
        setDemoLimitReached(true);
      }
    }

    dispatch({ type: "SET_LOADING" });

    try {
      const questions = await generateQuestions(objectives, {
        bloomLevel,
        count: questionCount,
        questionTypes
      });
      
      dispatch({ type: "SET_QUESTIONS", payload: questions });
      
      const quizTitle = objectives.length > 50 
        ? objectives.substring(0, 50) + "..." 
        : objectives;
      
      const quizId = saveQuizToDatabase(questions, quizTitle);
      console.log("Quiz saved to database with ID:", quizId);
      
      toast.success("Quiz generated successfully!");
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload: "Failed to generate quiz. Please try again.",
      });
      toast.error("Failed to generate quiz. Please check the console for details.");
    }
  };

  const handleQuestionTypeChange = (type: "multiple_choice" | "fill_in") => {
    setQuestionTypes(prev => {
      if (prev.includes(type) && prev.length > 1) {
        return prev.filter(t => t !== type);
      } 
      else if (!prev.includes(type)) {
        return [...prev, type];
      }
      return prev;
    });
  };

  const handleAnswer = (index: number, answer: string | number) => {
    dispatch({
      type: "SET_ANSWER",
      payload: { index, answer },
    });
  };

  const handleComplete = () => {
    const { questions, answers } = state;
    
    if (answers.some(answer => answer === null)) {
      toast.error("Please answer all questions before submitting");
      return;
    }

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
    
    setSelectedIncorrectQuestions(incorrectQuestionIds);

    const attempt: QuizAttempt = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      objectives,
      questions,
      userAnswers: answers,
      result,
    };
    
    saveQuizAttempt(attempt);
    
    setQuizHistory(loadQuizHistory());
  };

  const handleDisputeQuestion = (questionId: string) => {
    dispatch({ type: "REMOVE_QUESTION", payload: questionId });
    setQuizHistory(loadQuizHistory());
  };

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

  const toggleSelectQuestion = (id: string) => {
    setSelectedIncorrectQuestions(prev => 
      prev.includes(id) 
        ? prev.filter(qId => qId !== id) 
        : [...prev, id]
    );
  };

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

  const deselectAllIncorrectQuestions = () => {
    setSelectedIncorrectQuestions([]);
  };

  const handleViewAttempt = (attempt: QuizAttempt) => {
    dispatch({ type: "LOAD_ATTEMPT", payload: attempt });
  };

  const handleRemoveFromReviewList = (id: string) => {
    removeFromReviewList(id);
    setQuizHistory(loadQuizHistory());
  };

  const handleClearReviewList = () => {
    clearReviewList();
    setQuizHistory({ attempts: [], reviewList: [], disputedQuestions: [] });
  };

  const handleClearHistory = () => {
    clearAllHistory();
    setQuizHistory({ attempts: [], reviewList: [], disputedQuestions: [] });
  };

  const handlePracticeReviewQuestions = (questions: QuizQuestion[]) => {
    if (questions.length === 0) {
      toast.error("No questions to practice");
      return;
    }
    
    const quizId = saveQuizToDatabase(questions, "Review List Practice");
    
    navigate(`/practice/${quizId}`);
  };

  const handleReset = () => {
    dispatch({ type: "RESET_QUIZ" });
    setObjectives("");
    setSelectedIncorrectQuestions([]);
  };

  const handleTryAgain = () => {
    handleGenerate();
  };

  const handleExportToDocument = async () => {
    try {
      if (!state.questions || state.questions.length === 0) {
        toast.error("No quiz questions to export");
        return;
      }
      
      toast.loading("Exporting document...");
      
      const title = documentTitle || objectives || "Quiz";
      
      await exportToDocx(
        state.questions,
        title,
        includeAnswers
      );
      
      toast.dismiss();
      toast.success("Quiz exported to Word document");
    } catch (error) {
      console.error("Error exporting document:", error);
      toast.dismiss();
      toast.error("Failed to export document. Please try again.");
    }
  };

  const handleUpdateHistory = () => {
    setQuizHistory(loadQuizHistory());
  };

  const getBloomLevelIcon = (level: string) => {
    switch (level) {
      case 'remember':
        return <BookOpen className="h-4 w-4 mr-2" />;
      case 'understand':
        return <Lightbulb className="h-4 w-4 mr-2" />;
      case 'apply':
        return <Pencil className="h-4 w-4 mr-2" />;
      case 'analyze':
        return <BookCheck className="h-4 w-4 mr-2" />;
      case 'evaluate':
        return <FileCheck className="h-4 w-4 mr-2" />;
      case 'create':
        return <FilePlus className="h-4 w-4 mr-2" />;
      default:
        return <Lightbulb className="h-4 w-4 mr-2" />;
    }
  };

  const getBloomLevelDescription = (level: string) => {
    switch (level) {
      case 'remember':
        return "记忆 - 回忆事实、术语和基本概念";
      case 'understand':
        return "理解 - 解释想法或概念";
      case 'apply':
        return "应用 - 在新情境中使用信息";
      case 'analyze':
        return "分析 - 区分不同部分之间的关系";
      case 'evaluate':
        return "评估 - 作出判断和决策";
      case 'create':
        return "创造 - 创建新的想法或产品";
      default:
        return "";
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Quiz Generator</h2>
        
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline">History & Review</Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-md overflow-y-auto">
            <Tabs defaultValue="history" className="mt-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="history">Quiz History</TabsTrigger>
                <TabsTrigger value="review">Review List</TabsTrigger>
                <TabsTrigger value="disputed">Disputed</TabsTrigger>
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
              <TabsContent value="disputed" className="mt-4">
                <DisputedQuestions 
                  questions={quizHistory.disputedQuestions}
                  onUpdate={handleUpdateHistory}
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
          className="glass-card rounded-2xl p-8 bg-white/80 shadow-sm border border-border"
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
          
          <div className="grid grid-cols-1 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Bloom's Taxonomy Level
              </label>
              <Select value={bloomLevel} onValueChange={(value) => setBloomLevel(value as "remember" | "understand" | "apply" | "analyze" | "evaluate" | "create")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select cognitive level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="remember" className="flex items-center">
                    <div className="flex items-center">
                      {getBloomLevelIcon('remember')}
                      <span>Remember</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="understand" className="flex items-center">
                    <div className="flex items-center">
                      {getBloomLevelIcon('understand')}
                      <span>Understand</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="apply" className="flex items-center">
                    <div className="flex items-center">
                      {getBloomLevelIcon('apply')}
                      <span>Apply</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="analyze" className="flex items-center">
                    <div className="flex items-center">
                      {getBloomLevelIcon('analyze')}
                      <span>Analyze</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="evaluate" className="flex items-center">
                    <div className="flex items-center">
                      {getBloomLevelIcon('evaluate')}
                      <span>Evaluate</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="create" className="flex items-center">
                    <div className="flex items-center">
                      {getBloomLevelIcon('create')}
                      <span>Create</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              
              <div className="mt-2 text-sm text-muted-foreground">
                {getBloomLevelDescription(bloomLevel)}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Question Types
                </label>
                <div className="flex space-x-4">
                  <div className="flex items-center">
                    <Checkbox 
                      id="multiple-choice" 
                      checked={questionTypes.includes("multiple_choice")}
                      onCheckedChange={() => handleQuestionTypeChange("multiple_choice")}
                    />
                    <label htmlFor="multiple-choice" className="ml-2 text-sm">
                      Multiple Choice
                    </label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox 
                      id="fill-in" 
                      checked={questionTypes.includes("fill_in")}
                      onCheckedChange={() => handleQuestionTypeChange("fill_in")}
                    />
                    <label htmlFor="fill-in" className="ml-2 text-sm">
                      Fill in the Blank
                    </label>
                  </div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium">
                    Number of Questions: {questionCount}
                  </label>
                </div>
                <Slider 
                  min={3} 
                  max={20} 
                  step={1} 
                  value={[questionCount]} 
                  onValueChange={(value) => setQuestionCount(value[0])}
                  className="my-4"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>3</span>
                  <span>10</span>
                  <span>20</span>
                </div>
              </div>
            </div>
          </div>
          
          {demoLimitReached && !isAuth ? (
            <div className="mb-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-amber-800 font-medium">You've reached the demo limit (5 quizzes).</p>
              <p className="text-sm text-amber-700 mb-4">Sign in to create unlimited quizzes and track your progress.</p>
              <Button 
                onClick={() => document.querySelector<HTMLButtonElement>('[aria-label="Login / Register"]')?.click()}
                className="w-full"
              >
                Sign In to Continue
              </Button>
            </div>
          ) : (
            <button
              className="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2"
              onClick={handleGenerate}
            >
              Generate Quiz
            </button>
          )}
          
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
            <div className="flex gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <FileText className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Export Quiz to Document</DialogTitle>
                  </DialogHeader>
                  <div className="py-4 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="document-title">Document Title</Label>
                      <input
                        id="document-title"
                        value={documentTitle}
                        onChange={(e) => setDocumentTitle(e.target.value)}
                        className="w-full p-2 border rounded"
                        placeholder="Quiz Title"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="include-answers"
                        checked={includeAnswers}
                        onCheckedChange={(checked) => setIncludeAnswers(!!checked)}
                      />
                      <Label htmlFor="include-answers">Include answers and explanations</Label>
                    </div>
                    <div className="pt-2 text-sm text-muted-foreground">
                      Document will use Times New Roman font for professional formatting.
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <DialogClose asChild>
                      <Button onClick={handleExportToDocument} className="flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        Export to Word
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              <button
                className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-secondary transition-colors"
                onClick={handleReset}
              >
                New Quiz
              </button>
            </div>
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
                    onDisputeQuestion={state.status === "completed" ? handleDisputeQuestion : undefined}
                  />
                  
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
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <FileText className="mr-2 h-4 w-4" />
                      Export to Word
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Export Quiz to Document</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="document-title-results">Document Title</Label>
                        <input
                          id="document-title-results"
                          value={documentTitle}
                          onChange={(e) => setDocumentTitle(e.target.value)}
                          className="w-full p-2 border rounded"
                          placeholder="Quiz Title"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="include-answers-results"
                          checked={includeAnswers}
                          onCheckedChange={(checked) => setIncludeAnswers(!!checked)}
                        />
                        <Label htmlFor="include-answers-results">Include answers and explanations</Label>
                      </div>
                      <div className="pt-2 text-sm text-muted-foreground">
                        Document will use Times New Roman font for professional formatting.
                      </div>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                      </DialogClose>
                      <DialogClose asChild>
                        <Button onClick={handleExportToDocument} className="flex items-center gap-2">
                          <Download className="w-4 h-4" />
                          Export to Word
                        </Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                
                <Button
                  onClick={handleTryAgain}
                  className="w-full"
                >
                  Try Again
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuizGenerator;
