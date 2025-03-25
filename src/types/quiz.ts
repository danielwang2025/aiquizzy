
export interface QuizQuestion {
  id: string;
  type: 'multiple_choice' | 'fill_in';
  question: string;
  options?: string[];
  correctAnswer: string | number;
  explanation?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  topic?: string;
  hint?: string;  // Added hint field for providing hints to users
}

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  questions: QuizQuestion[];
  difficulty?: 'easy' | 'medium' | 'hard';
  createdAt: number;
  topics?: string[];
}

export interface QuizStats {
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  score: number;
}

// Added to match the implementations in other files
export interface QuizAttempt {
  id: string;
  quizId: string;
  objectives: string;
  date: string | number;
  questions: QuizQuestion[];
  userAnswers: (string | number | null)[];
  result: {
    correctAnswers: number;
    incorrectAnswers: number;
    score: number;
  };
  userId?: string;
}

export interface QuizHistory {
  id?: string;
  userId?: string;
  attempts: QuizAttempt[];
  reviewList: QuizQuestion[];
  disputedQuestions: DisputedQuestion[];
  learningPreferences?: LearningPreferences;
}

export interface QuizProgressData {
  labels: string[];
  scores: number[];
}

export interface DisputedQuestion {
  questionId: string;
  question: QuizQuestion;
  userAnswer: string | number | null;
  disputeReason: string;
  dateDisputed: string;
  status: 'pending' | 'reviewed';
}

export interface User {
  id: string;
  email: string;
  displayName?: string;
  createdAt: number;
  lastLoginAt?: number;
  photoURL?: string;
}

export interface LearningPreferences {
  preferredDifficulty: 'easy' | 'medium' | 'hard';
  preferredQuestionTypes: ('multiple_choice' | 'fill_in')[];
  topicsOfInterest: string[];
  dailyGoal: number;
  reminderEnabled: boolean;
}

// For Dashboard
export interface DashboardStats {
  totalQuizzes: number;
  totalQuestions: number;
  avgScore: number;
  topicsStudied: string[];
  recentScores: number[];
  learningStreak: number;
}

export interface QuizResult {
  id: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  date: number;
}
