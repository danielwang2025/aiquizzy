
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

export interface QuizHistory {
  id: string;
  quizId: string;
  score: number;
  date: number;
  stats: QuizStats;
}

export interface QuizProgressData {
  labels: string[];
  scores: number[];
}

export interface DisputedQuestion {
  questionId: string;
  reason: string;
  userAnswer: string | number | null;
  timestamp: number;
}
