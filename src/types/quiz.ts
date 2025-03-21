
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

export interface QuizState {
  questions: QuizQuestion[];
  currentQuestion: number;
  answers: (string | number | null)[];
  result: QuizResult | null;
  status: 'idle' | 'loading' | 'active' | 'completed';
  error: string | null;
}
