import { QuizQuestion, QuizResult, QuizAttempt } from "@/types/quiz";

// LocalStorage keys
const DB_QUIZZES_KEY = "quiz_db_quizzes";
const DB_ATTEMPTS_KEY = "quiz_db_attempts";

// Save a quiz to the database
export const saveQuizToDatabase = (
  quizIdOrQuestions: string | QuizQuestion[],
  quizTitleOrData: string | {
    id: string;
    title: string;
    objectives: string;
    createdAt: string;
    questions: QuizQuestion[];
    difficulty?: 'easy' | 'medium' | 'hard';
    isComplete?: boolean;
  }
) => {
  const quizzes = getQuizzesFromDatabase();
  
  // Handle both usage patterns:
  // 1. (quizId: string, quizData: object)
  // 2. (questions: QuizQuestion[], title: string)
  
  let quizData;
  
  if (Array.isArray(quizIdOrQuestions)) {
    // Handle the case where the first argument is an array of questions
    const questions = quizIdOrQuestions;
    const title = typeof quizTitleOrData === 'string' ? quizTitleOrData : 'Untitled Quiz';
    
    quizData = {
      id: crypto.randomUUID(),
      title: title,
      objectives: title,
      createdAt: new Date().toISOString(),
      questions: questions,
      isComplete: true
    };
  } else {
    // Handle the case where the first argument is a quiz ID
    quizData = quizTitleOrData;
  }
  
  quizzes.push(quizData);
  localStorage.setItem(DB_QUIZZES_KEY, JSON.stringify(quizzes));
  
  return typeof quizData === 'object' ? quizData.id : quizIdOrQuestions;
};

// Get all quizzes from the database
export const getQuizzesFromDatabase = () => {
  const quizzesJson = localStorage.getItem(DB_QUIZZES_KEY);
  return quizzesJson ? JSON.parse(quizzesJson) : [];
};

// Get a quiz by ID
export const getQuizById = (id: string) => {
  const quizzes = getQuizzesFromDatabase();
  return quizzes.find((quiz: any) => quiz.id === id) || null;
};

// Save quiz attempt
export const saveQuizAttemptToDatabase = (
  quizId: string,
  userAnswers: (string | number | null)[],
  result: QuizResult
) => {
  const attempts = getQuizAttemptsFromDatabase();
  
  const newAttempt = {
    id: crypto.randomUUID(),
    quizId,
    userAnswers,
    result,
    date: new Date().toISOString()
  };
  
  attempts.push(newAttempt);
  localStorage.setItem(DB_ATTEMPTS_KEY, JSON.stringify(attempts));
  
  return newAttempt.id;
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

// Delete a quiz
export const deleteQuizFromDatabase = (id: string) => {
  const quizzes = getQuizzesFromDatabase();
  const filteredQuizzes = quizzes.filter((quiz: any) => quiz.id !== id);
  localStorage.setItem(DB_QUIZZES_KEY, JSON.stringify(filteredQuizzes));
  
  // Also delete associated attempts
  const attempts = getQuizAttemptsFromDatabase();
  const filteredAttempts = attempts.filter((attempt: any) => attempt.quizId !== id);
  localStorage.setItem(DB_ATTEMPTS_KEY, JSON.stringify(filteredAttempts));
};
