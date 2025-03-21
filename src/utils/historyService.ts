
import { QuizAttempt, QuizQuestion, QuizHistory } from "@/types/quiz";

const HISTORY_KEY = "quiz_history";

// Load quiz history from localStorage
export const loadQuizHistory = (): QuizHistory => {
  const savedHistory = localStorage.getItem(HISTORY_KEY);
  if (savedHistory) {
    return JSON.parse(savedHistory);
  }
  return { attempts: [], reviewList: [] };
};

// Save quiz history to localStorage
export const saveQuizHistory = (history: QuizHistory): void => {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
};

// Add a new quiz attempt to history
export const saveQuizAttempt = (attempt: QuizAttempt): void => {
  const history = loadQuizHistory();
  history.attempts = [attempt, ...history.attempts];
  saveQuizHistory(history);
};

// Add a question to the review list
export const addToReviewList = (question: QuizQuestion): void => {
  const history = loadQuizHistory();
  // Check if question is already in review list
  const exists = history.reviewList.some(q => q.id === question.id);
  if (!exists) {
    history.reviewList = [question, ...history.reviewList];
    saveQuizHistory(history);
  }
};

// Remove a question from the review list
export const removeFromReviewList = (questionId: string): void => {
  const history = loadQuizHistory();
  history.reviewList = history.reviewList.filter(q => q.id !== questionId);
  saveQuizHistory(history);
};

// Clear review list
export const clearReviewList = (): void => {
  const history = loadQuizHistory();
  history.reviewList = [];
  saveQuizHistory(history);
};

// Clear all history
export const clearAllHistory = (): void => {
  localStorage.removeItem(HISTORY_KEY);
};
