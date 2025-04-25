
import { QuizAttempt, QuizHistory } from "@/types/quiz";

export const loadQuizHistory = (): QuizHistory => {
  return { attempts: [], reviewList: [], disputedQuestions: [] };
};

export const saveQuizHistory = (history: QuizHistory): void => {
  // Functionality disabled
  console.log("History save functionality is disabled to conserve resources");
};

export const saveQuizAttempt = (attempt: QuizAttempt): void => {
  // Functionality disabled
  console.log("Quiz attempt save functionality is disabled to conserve resources");
};

export const clearAllHistory = (): void => {
  // Functionality disabled
  console.log("History clear functionality is disabled to conserve resources");
};
