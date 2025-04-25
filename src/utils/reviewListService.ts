
import { QuizQuestion } from "@/types/quiz";

// All functions now just log that functionality is disabled
export const addToReviewList = (question: QuizQuestion): void => {
  console.log("Review list functionality is disabled to conserve resources");
};

export const removeFromReviewList = (questionId: string): void => {
  console.log("Review list functionality is disabled to conserve resources");
};

export const clearReviewList = (): void => {
  console.log("Review list functionality is disabled to conserve resources");
};

export const getReviewList = (): QuizQuestion[] => {
  // Return empty array to prevent any data loading
  return [];
};
