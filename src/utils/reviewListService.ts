
import { QuizQuestion } from "@/types/quiz";

// All functions are disabled to prevent local storage operations and reduce computational resource usage

export const addToReviewList = (question: QuizQuestion): void => {
  // Functionality completely disabled
  console.log("Review list functionality is disabled to conserve resources");
};

export const removeFromReviewList = (questionId: string): void => {
  // Functionality completely disabled
  console.log("Review list functionality is disabled to conserve resources");
};

export const clearReviewList = (): void => {
  // Functionality completely disabled
  console.log("Review list functionality is disabled to conserve resources");
};

export const getReviewList = (): QuizQuestion[] => {
  // Return empty array to prevent any data loading
  return [];
};
