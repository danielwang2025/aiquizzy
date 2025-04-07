
// This file serves as the main entry point for history-related functionality
// It re-exports everything from the smaller, specialized modules

import { loadQuizHistory, saveQuizHistory, saveQuizAttempt, clearAllHistory } from './historyCore';
import { addToReviewList, removeFromReviewList, clearReviewList } from './reviewListService';
import { 
  addDisputedQuestion, 
  removeDisputedQuestion,
  clearDisputedQuestions,
  isQuestionDisputed
} from './disputedQuestionsService';

// Re-export everything
export {
  // History core functions
  loadQuizHistory,
  saveQuizHistory,
  saveQuizAttempt,
  clearAllHistory,
  
  // Review list functions
  addToReviewList,
  removeFromReviewList,
  clearReviewList,
  
  // Disputed questions functions
  addDisputedQuestion,
  removeDisputedQuestion,
  clearDisputedQuestions,
  isQuestionDisputed
};
