
import { DisputedQuestion, QuizQuestion } from "@/types/quiz";

export const addDisputedQuestion = (
  question: QuizQuestion, 
  userAnswer: string | number | null, 
  disputeReason: string
): void => {
  console.log("Dispute question functionality is disabled to conserve resources");
};

export const removeDisputedQuestion = (questionId: string): void => {
  console.log("Remove disputed question functionality is disabled to conserve resources");
};

export const clearDisputedQuestions = (): void => {
  console.log("Clear disputed questions functionality is disabled to conserve resources");
};

export const isQuestionDisputed = (questionId: string): boolean => {
  return false;
};
