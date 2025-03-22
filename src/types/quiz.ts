export interface QuizQuestion {
  id: string;
  type: 'multiple_choice' | 'fill_in';
  question: string;
  options?: string[];
  correctAnswer: string | number;
  explanation?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  topic?: string;
  subtopic?: string;
}

// Create a type alias for QuizQuestionType to avoid naming conflicts
export type QuizQuestionType = QuizQuestion;

export interface QuizResult {
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  score: number;
  feedback: string;
  completionTime?: number;
  pointsAwarded?: number;
}

export interface QuizAttempt {
  id: string;
  userId?: string;
  date: string;
  objectives: string;
  questions: QuizQuestion[];
  userAnswers: (string | number | null)[];
  result: QuizResult;
  difficulty?: 'easy' | 'medium' | 'hard';
  topics?: string[];
}

export interface QuizState {
  questions: QuizQuestion[];
  currentQuestion: number;
  answers: (string | number | null)[];
  result: QuizResult | null;
  status: 'idle' | 'loading' | 'active' | 'completed';
  error: string | null;
  startTime?: number;
  endTime?: number;
}

export interface QuizHistory {
  userId?: string;
  attempts: QuizAttempt[];
  reviewList: QuizQuestion[];
  disputedQuestions: DisputedQuestion[];
  learningPreferences?: LearningPreferences;
}

export interface LearningPreferences {
  preferredDifficulty?: 'easy' | 'medium' | 'hard';
  preferredQuestionTypes?: ('multiple_choice' | 'fill_in')[];
  topicsOfInterest?: string[];
  dailyGoal?: number; // Number of questions to practice per day
  reminderEnabled?: boolean;
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
  learningPreferences?: LearningPreferences;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Dashboard statistics
export interface DashboardStats {
  totalAttempts: number;
  totalQuestions: number;
  correctAnswers: number;
  averageScore: number;
  topicPerformance: {
    topic: string;
    correctRate: number;
    questionsCount: number;
  }[];
  recentScores: {
    date: string;
    score: number;
  }[];
  dailyStreak: number;
  lastPracticeDate?: string;
  mostChallengedTopics: string[];
}
