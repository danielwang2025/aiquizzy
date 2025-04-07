
import { QuizAttempt, QuizHistory } from "@/types/quiz";

const HISTORY_KEY = "quiz_history";

// Load quiz history from localStorage for current user
export const loadQuizHistory = (): QuizHistory => {
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

// Clear all history for current user
export const clearAllHistory = (): void => {
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
      // Delete only current user's history
      delete allHistories[key];
      localStorage.setItem(HISTORY_KEY, JSON.stringify(allHistories));
    } catch (error) {
      console.error("Error clearing history:", error);
    }
  }
};
