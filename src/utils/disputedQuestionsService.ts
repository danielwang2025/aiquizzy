
import { DisputedQuestion, QuizQuestion } from "@/types/quiz";
import { loadQuizHistory, saveQuizHistory } from './historyCore';

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
