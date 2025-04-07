
import { QuizQuestion } from "@/types/quiz";
import { loadQuizHistory, saveQuizHistory } from './historyCore';

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
