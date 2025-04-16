
import { QuizQuestion, QuizResult, QuizAttempt } from "@/types/quiz";

// LocalStorage keys
const DB_QUIZZES_KEY = "quiz_db_quizzes";
const DB_ATTEMPTS_KEY = "quiz_db_attempts";

// Get a quiz by ID - used for loading shared quizzes
export const getQuizById = (id: string) => {
  const quizzesJson = localStorage.getItem(DB_QUIZZES_KEY);
  const quizzes = quizzesJson ? JSON.parse(quizzesJson) : [];
  return quizzes.find((quiz: any) => quiz.id === id) || null;
};

// Get quiz attempts
export const getQuizAttemptsFromDatabase = () => {
  const attemptsJson = localStorage.getItem(DB_ATTEMPTS_KEY);
  return attemptsJson ? JSON.parse(attemptsJson) : [];
};

// Get quiz attempts by quiz ID
export const getQuizAttemptsByQuizId = (quizId: string) => {
  const attempts = getQuizAttemptsFromDatabase();
  return attempts.filter((attempt: any) => attempt.quizId === quizId);
};
