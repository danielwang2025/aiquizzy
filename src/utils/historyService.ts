
import { QuizAttempt, QuizQuestion, QuizHistory, DisputedQuestion } from "@/types/quiz";
import { getCurrentUser } from "./authService";

const HISTORY_KEY = "quiz_history";

// Load quiz history from localStorage for current user
export const loadQuizHistory = (): QuizHistory => {
  let userId = null;
  try {
    // Instead of directly using the Promise, we'll use local storage for now
    // The proper fix would be to make this function async, but that would require
    // changing all callers as well
    const savedUserData = localStorage.getItem('current_user');
    if (savedUserData) {
      const userData = JSON.parse(savedUserData);
      userId = userData.id;
    }
  } catch (error) {
    console.error("Error getting current user:", error);
  }
  
  const savedHistory = localStorage.getItem(HISTORY_KEY);
  let history: QuizHistory = { attempts: [], reviewList: [], disputedQuestions: [] };
  
  if (savedHistory) {
    try {
      const allHistories = JSON.parse(savedHistory);
      
      // If user is logged in, find their history
      if (userId) {
        const userHistory = allHistories[userId];
        if (userHistory) {
          history = userHistory;
          // Ensure disputedQuestions exists (for backwards compatibility)
          if (!history.disputedQuestions) {
            history.disputedQuestions = [];
          }
        }
      } else {
        // For anonymous users, use the 'anonymous' key
        const anonymousHistory = allHistories.anonymous;
        if (anonymousHistory) {
          history = anonymousHistory;
          // Ensure disputedQuestions exists (for backwards compatibility)
          if (!history.disputedQuestions) {
            history.disputedQuestions = [];
          }
        }
      }
    } catch (error) {
      console.error("Error loading quiz history:", error);
    }
  }
  
  return history;
};

// Save quiz history to localStorage
export const saveQuizHistory = (history: QuizHistory): void => {
  let userId = null;
  try {
    const savedUserData = localStorage.getItem('current_user');
    if (savedUserData) {
      const userData = JSON.parse(savedUserData);
      userId = userData.id;
    }
  } catch (error) {
    console.error("Error getting current user:", error);
  }
  
  const key = userId || 'anonymous';
  
  let allHistories = {};
  const savedHistory = localStorage.getItem(HISTORY_KEY);
  
  if (savedHistory) {
    try {
      allHistories = JSON.parse(savedHistory);
    } catch (error) {
      console.error("Error parsing existing history:", error);
    }
  }
  
  // Add userId to history object
  history.userId = userId;
  
  // Update user's history in the collection
  allHistories = { ...allHistories, [key]: history };
  
  localStorage.setItem(HISTORY_KEY, JSON.stringify(allHistories));
};

// Add a new quiz attempt to history
export const saveQuizAttempt = (attempt: QuizAttempt): void => {
  let userId = null;
  try {
    const savedUserData = localStorage.getItem('current_user');
    if (savedUserData) {
      const userData = JSON.parse(savedUserData);
      userId = userData.id;
    }
  } catch (error) {
    console.error("Error getting current user:", error);
  }
  
  // Add userId to attempt
  if (userId) {
    attempt.userId = userId;
  }
  
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

// Clear all history for current user
export const clearAllHistory = (): void => {
  const currentUser = getCurrentUser();
  const userId = currentUser?.id;
  const key = userId || 'anonymous';
  
  let allHistories = {};
  const savedHistory = localStorage.getItem(HISTORY_KEY);
  
  if (savedHistory) {
    try {
      allHistories = JSON.parse(savedHistory);
      // Delete only current user's history
      delete allHistories[key];
      localStorage.setItem(HISTORY_KEY, JSON.stringify(allHistories));
    } catch (error) {
      console.error("Error clearing history:", error);
    }
  }
};

// Add a disputed question
export const addDisputedQuestion = (
  question: QuizQuestion, 
  userAnswer: string | number | null, 
  disputeReason: string
): void => {
  const history = loadQuizHistory();
  
  const disputedQuestion: DisputedQuestion = {
    questionId: question.id,
    question,
    userAnswer,
    disputeReason,
    dateDisputed: new Date().toISOString(),
    status: 'pending'
  };
  
  history.disputedQuestions = [disputedQuestion, ...history.disputedQuestions];
  saveQuizHistory(history);
};

// Remove a disputed question
export const removeDisputedQuestion = (questionId: string): void => {
  const history = loadQuizHistory();
  history.disputedQuestions = history.disputedQuestions.filter(dq => dq.questionId !== questionId);
  saveQuizHistory(history);
};

// Clear all disputed questions
export const clearDisputedQuestions = (): void => {
  const history = loadQuizHistory();
  history.disputedQuestions = [];
  saveQuizHistory(history);
};

// Check if a question is disputed
export const isQuestionDisputed = (questionId: string): boolean => {
  const history = loadQuizHistory();
  return history.disputedQuestions.some(dq => dq.questionId === questionId);
};

