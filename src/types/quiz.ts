
export interface QuizQuestion {
  id: string;
  type: 'multiple_choice' | 'fill_in';
  question: string;
  options?: string[];
  correctAnswer: string | number;
  explanation?: string;
}

// Create a type alias for QuizQuestionType to avoid naming conflicts
export type QuizQuestionType = QuizQuestion;

export interface QuizResult {
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  score: number;
  feedback?: string;
}

export interface QuizAttempt {
  id: string;
  userId?: string;
  date: string;
  objectives: string;
  questions: QuizQuestion[];
  userAnswers: (string | number | null)[];
  result: QuizResult;
}

export interface QuizState {
  questions: QuizQuestion[];
  currentQuestion: number;
  answers: (string | number | null)[];
  result: QuizResult | null;
  status: 'idle' | 'loading' | 'active' | 'completed';
  error: string | null;
}

export interface QuizHistory {
  userId?: string;
  attempts: QuizAttempt[];
  reviewList: QuizQuestion[];
  disputedQuestions: DisputedQuestion[]; // Add disputed questions list
}

// Add disputed question interface
export interface DisputedQuestion {
  questionId: string;
  question: QuizQuestion;
  userAnswer: string | number | null;
  disputeReason: string;
  dateDisputed: string;
  status: 'pending' | 'reviewed';
}

// Add user authentication types
export interface User {
  id: string;
  email: string;
  displayName?: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
