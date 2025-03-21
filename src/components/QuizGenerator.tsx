
import React, { useState, useReducer } from "react";
import { QuizState, QuizQuestion as QuizQuestionType, QuizResult } from "@/types/quiz";
import { generateQuestions } from "@/utils/api";
import LoadingSpinner from "./LoadingSpinner";
import QuizQuestionComponent from "./QuizQuestion";
import { toast } from "sonner";
import { motion } from "framer-motion";

// Initial state for the quiz
const initialState: QuizState = {
  questions: [],
  currentQuestion: 0,
  answers: [],
  result: null,
  status: "idle",
  error: null,
};

// Action types
type QuizAction =
  | { type: "SET_LOADING" }
  | { type: "SET_QUESTIONS"; payload: QuizQuestionType[] }
  | { type: "SET_ANSWER"; payload: { index: number; answer: string | number } }
  | { type: "COMPLETE_QUIZ"; payload: QuizResult }
  | { type: "RESET_QUIZ" }
  | { type: "SET_ERROR"; payload: string };

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
    case "SET_ERROR":
      return { ...state, error: action.payload, status: "idle" };
    default:
      return state;
  }
}

const QuizGenerator: React.FC = () => {
  const [state, dispatch] = useReducer(quizReducer, initialState);
  const [objectives, setObjectives] = useState("");

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
      toast.error("Failed to generate quiz");
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
  };

  // Reset the quiz
  const handleReset = () => {
    dispatch({ type: "RESET_QUIZ" });
    setObjectives("");
  };

  // Try again with the same objectives
  const handleTryAgain = () => {
    handleGenerate();
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      {state.status === "idle" && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass-card rounded-2xl p-8"
        >
          <h2 className="text-2xl font-semibold mb-6 text-center">Quiz Generator</h2>
          
          <div className="mb-6">
            <label htmlFor="objectives" className="block text-sm font-medium mb-2">
              Learning Objectives
            </label>
            <textarea
              id="objectives"
              className="w-full p-3 h-32 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white/80 backdrop-blur-sm"
              placeholder="Enter your learning objectives here..."
              value={objectives}
              onChange={(e) => setObjectives(e.target.value)}
            />
          </div>
          
          <button
            className="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2"
            onClick={handleGenerate}
          >
            Generate Quiz
          </button>
          
          <p className="text-center text-sm text-muted-foreground mt-4">
            Enter the learning objectives and click the button to generate a customized quiz.
          </p>
        </motion.div>
      )}

      {state.status === "loading" && (
        <div className="min-h-[300px] flex flex-col items-center justify-center">
          <LoadingSpinner size="lg" className="mb-4" />
          <p className="text-muted-foreground animate-pulse-subtle">Generating quiz questions...</p>
        </div>
      )}

      {(state.status === "active" || state.status === "completed") && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Quiz Questions</h2>
            <button
              className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-secondary transition-colors"
              onClick={handleReset}
            >
              New Quiz
            </button>
          </div>

          <div className="mb-8">
            {state.questions.map((question, index) => (
              <QuizQuestionComponent
                key={question.id}
                question={question}
                userAnswer={state.answers[index]}
                onAnswer={(answer) => handleAnswer(index, answer)}
                showResult={state.status === "completed"}
                index={index}
              />
            ))}
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
              
              <p className="p-3 rounded-md bg-blue-500/10 text-blue-800">{state.result.feedback}</p>
              
              <button
                className="w-full py-3 mt-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2"
                onClick={handleTryAgain}
              >
                Try Again
              </button>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuizGenerator;
