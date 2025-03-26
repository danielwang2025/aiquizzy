import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";
import {
  QuizAttempt,
  QuizQuestion,
  QuizHistory,
  DisputedQuestion,
  LearningPreferences
} from "@/types/quiz";
import { isAuthenticated, getCurrentUser } from "./authService";

// Helper function to convert Supabase JSON to proper types
const parseQuizQuestion = (questionData: any): QuizQuestion => {
  return {
    id: questionData.id || "",
    type: questionData.type as "multiple_choice" | "fill_in",
    question: questionData.question || "",
    options: questionData.options || [],
    correctAnswer: questionData.correctAnswer || questionData.correct_answer || "",
    explanation: questionData.explanation || "",
    difficulty: questionData.difficulty as "easy" | "medium" | "hard" || "medium",
    topic: questionData.topic || "",
    subtopic: questionData.subtopic || ""
  };
};

// Helper function to parse JSON array safely
const safeParseJsonArray = (json: any, defaultValue: any[] = []): any[] => {
  if (!json) return defaultValue;
  if (Array.isArray(json)) return json;
  try {
    const parsed = typeof json === 'string' ? JSON.parse(json) : json;
    return Array.isArray(parsed) ? parsed : defaultValue;
  } catch (e) {
    console.error("Error parsing JSON array:", e);
    return defaultValue;
  }
};

// Helper function to parse JSON object safely
const safeParseJsonObject = (json: any, defaultValue: any = {}): any => {
  if (!json) return defaultValue;
  if (typeof json === 'object' && !Array.isArray(json)) return json;
  try {
    const parsed = typeof json === 'string' ? JSON.parse(json) : json;
    return typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : defaultValue;
  } catch (e) {
    console.error("Error parsing JSON object:", e);
    return defaultValue;
  }
};

// Load quiz history from Supabase or localStorage
export const loadQuizHistory = async (): Promise<QuizHistory> => {
  // Initialize default history
  let history: QuizHistory = {
    attempts: [],
    reviewList: [],
    disputedQuestions: []
  };

  try {
    // If user is authenticated, load from Supabase
    if (isAuthenticated()) {
      const user = await getCurrentUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Load quiz attempts
      const { data: quizData, error: quizError } = await supabase
        .from('quiz_history')
        .select('*')
        .eq('user_id', user.id);

      if (quizError) throw quizError;
      
      // Parse attempts from Supabase format to application format
      const attempts: QuizAttempt[] = (quizData || []).map(item => ({
        id: item.id,
        userId: item.user_id,
        date: item.date,
        objectives: item.objectives || "",
        questions: safeParseJsonArray(item.questions, []).map(parseQuizQuestion),
        userAnswers: safeParseJsonArray(item.user_answers, []),
        result: safeParseJsonObject(item.result, {
          totalQuestions: 0,
          correctAnswers: 0,
          incorrectAnswers: 0,
          score: 0
        }),
        difficulty: safeParseJsonObject(item.result).difficulty || "medium",
        topics: safeParseJsonObject(item.result).topics || []
      }));

      // Load review list
      const { data: reviewData, error: reviewError } = await supabase
        .from('review_list')
        .select('*')
        .eq('user_id', user.id);

      if (reviewError) throw reviewError;

      // Get the full question data for each review item
      const reviewList: QuizQuestion[] = [];
      for (const item of reviewData || []) {
        const { data: questionData, error: questionError } = await supabase
          .from('quiz_questions')
          .select('*')
          .eq('id', item.question_id)
          .single();

        if (!questionError && questionData) {
          reviewList.push(parseQuizQuestion(questionData));
        }
      }

      // Load disputed questions
      const { data: disputedData, error: disputedError } = await supabase
        .from('disputed_questions')
        .select('*')
        .eq('user_id', user.id);

      if (disputedError) throw disputedError;

      const disputedQuestions: DisputedQuestion[] = [];
      for (const item of disputedData || []) {
        const { data: questionData, error: questionError } = await supabase
          .from('quiz_questions')
          .select('*')
          .eq('id', item.question_id)
          .single();

        if (!questionError && questionData) {
          disputedQuestions.push({
            questionId: item.question_id,
            question: parseQuizQuestion(questionData),
            userAnswer: item.user_answer,
            disputeReason: item.dispute_reason || "",
            dateDisputed: item.date_disputed || new Date().toISOString(),
            status: item.status as "pending" | "reviewed" || "pending"
          });
        }
      }

      history = {
        attempts,
        reviewList,
        disputedQuestions
      };
    } else {
      // Load from localStorage
      const savedHistory = localStorage.getItem("quizHistory");
      if (savedHistory) {
        history = JSON.parse(savedHistory);
      }
    }

    return history;
  } catch (error) {
    console.error("Error loading quiz history:", error);
    
    // Fallback to localStorage
    const savedHistory = localStorage.getItem("quizHistory");
    if (savedHistory) {
      try {
        history = JSON.parse(savedHistory);
      } catch (e) {
        console.error("Error parsing local storage history:", e);
      }
    }
    
    return history;
  }
};

// Save a quiz attempt
export const saveQuizAttempt = async (attempt: QuizAttempt): Promise<void> => {
  try {
    if (isAuthenticated()) {
      const user = await getCurrentUser();
      if (!user) throw new Error("User not authenticated");

      // Prepare attempt for Supabase
      const supabaseAttempt = {
        id: attempt.id,
        user_id: user.id,
        objectives: attempt.objectives,
        questions: JSON.stringify(attempt.questions),
        user_answers: JSON.stringify(attempt.userAnswers),
        result: JSON.stringify(attempt.result),
        date: attempt.date
      };

      // Save to Supabase
      const { error } = await supabase
        .from('quiz_history')
        .upsert(supabaseAttempt);

      if (error) throw error;
    }

    // Also save to localStorage as backup
    const history = await loadQuizHistory();
    const updatedHistory = {
      ...history,
      attempts: [attempt, ...history.attempts]
    };
    localStorage.setItem("quizHistory", JSON.stringify(updatedHistory));
  } catch (error) {
    console.error("Error saving quiz attempt:", error);
    
    // Fallback to localStorage only
    const history = JSON.parse(localStorage.getItem("quizHistory") || '{"attempts":[],"reviewList":[],"disputedQuestions":[]}');
    const updatedHistory = {
      ...history,
      attempts: [attempt, ...history.attempts]
    };
    localStorage.setItem("quizHistory", JSON.stringify(updatedHistory));
  }
};

// Add a question to the review list
export const addToReviewList = async (question: QuizQuestion): Promise<void> => {
  try {
    if (isAuthenticated()) {
      const user = await getCurrentUser();
      if (!user) throw new Error("User not authenticated");

      // Check if question already exists in the review list
      const { data: existingData } = await supabase
        .from('review_list')
        .select('*')
        .eq('user_id', user.id)
        .eq('question_id', question.id);

      if (!existingData || existingData.length === 0) {
        // Save question to quiz_questions if it doesn't exist
        const { error: questionError } = await supabase
          .from('quiz_questions')
          .upsert({
            id: question.id,
            type: question.type,
            question: question.question,
            options: JSON.stringify(question.options),
            correct_answer: String(question.correctAnswer),
            explanation: question.explanation,
            difficulty: question.difficulty,
            topic: question.topic,
            subtopic: question.subtopic
          });

        if (questionError) throw questionError;

        // Add to review list
        const { error } = await supabase
          .from('review_list')
          .insert({
            id: uuidv4(),
            user_id: user.id,
            question_id: question.id
          });

        if (error) throw error;
      }
    }

    // Also update localStorage
    const history = await loadQuizHistory();
    
    // Check if question is already in review list
    const isAlreadyInList = history.reviewList.some(q => q.id === question.id);
    
    if (!isAlreadyInList) {
      const updatedHistory = {
        ...history,
        reviewList: [...history.reviewList, question]
      };
      localStorage.setItem("quizHistory", JSON.stringify(updatedHistory));
    }
  } catch (error) {
    console.error("Error adding to review list:", error);
    
    // Fallback to localStorage only
    const history = JSON.parse(localStorage.getItem("quizHistory") || '{"attempts":[],"reviewList":[],"disputedQuestions":[]}');
    const isAlreadyInList = history.reviewList.some((q: QuizQuestion) => q.id === question.id);
    
    if (!isAlreadyInList) {
      const updatedHistory = {
        ...history,
        reviewList: [...history.reviewList, question]
      };
      localStorage.setItem("quizHistory", JSON.stringify(updatedHistory));
    }
  }
};

// Remove a question from the review list
export const removeFromReviewList = async (questionId: string): Promise<void> => {
  try {
    if (isAuthenticated()) {
      const user = await getCurrentUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from('review_list')
        .delete()
        .eq('user_id', user.id)
        .eq('question_id', questionId);

      if (error) throw error;
    }

    // Also update localStorage
    const history = await loadQuizHistory();
    const updatedHistory = {
      ...history,
      reviewList: history.reviewList.filter(q => q.id !== questionId)
    };
    localStorage.setItem("quizHistory", JSON.stringify(updatedHistory));
  } catch (error) {
    console.error("Error removing from review list:", error);
    
    // Fallback to localStorage only
    const history = JSON.parse(localStorage.getItem("quizHistory") || '{"attempts":[],"reviewList":[],"disputedQuestions":[]}');
    const updatedHistory = {
      ...history,
      reviewList: history.reviewList.filter((q: QuizQuestion) => q.id !== questionId)
    };
    localStorage.setItem("quizHistory", JSON.stringify(updatedHistory));
  }
};

// Clear the review list
export const clearReviewList = async (): Promise<void> => {
  try {
    if (isAuthenticated()) {
      const user = await getCurrentUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from('review_list')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
    }

    // Also update localStorage
    const history = await loadQuizHistory();
    const updatedHistory = {
      ...history,
      reviewList: []
    };
    localStorage.setItem("quizHistory", JSON.stringify(updatedHistory));
  } catch (error) {
    console.error("Error clearing review list:", error);
    
    // Fallback to localStorage only
    const history = JSON.parse(localStorage.getItem("quizHistory") || '{"attempts":[],"reviewList":[],"disputedQuestions":[]}');
    const updatedHistory = {
      ...history,
      reviewList: []
    };
    localStorage.setItem("quizHistory", JSON.stringify(updatedHistory));
  }
};

// Clear all history
export const clearAllHistory = async (): Promise<void> => {
  try {
    if (isAuthenticated()) {
      const user = await getCurrentUser();
      if (!user) throw new Error("User not authenticated");

      // Clear quiz history
      const { error: historyError } = await supabase
        .from('quiz_history')
        .delete()
        .eq('user_id', user.id);

      if (historyError) throw historyError;

      // Clear review list
      const { error: reviewError } = await supabase
        .from('review_list')
        .delete()
        .eq('user_id', user.id);

      if (reviewError) throw reviewError;

      // Clear disputed questions
      const { error: disputedError } = await supabase
        .from('disputed_questions')
        .delete()
        .eq('user_id', user.id);

      if (disputedError) throw disputedError;
    }

    // Clear localStorage
    localStorage.setItem("quizHistory", JSON.stringify({
      attempts: [],
      reviewList: [],
      disputedQuestions: []
    }));
  } catch (error) {
    console.error("Error clearing history:", error);
    
    // Fallback to clearing localStorage only
    localStorage.setItem("quizHistory", JSON.stringify({
      attempts: [],
      reviewList: [],
      disputedQuestions: []
    }));
  }
};

// Add a disputed question
export const addDisputedQuestion = async (
  question: QuizQuestion,
  userAnswer: string | number | null,
  disputeReason: string
): Promise<void> => {
  try {
    if (isAuthenticated()) {
      const user = await getCurrentUser();
      if (!user) throw new Error("User not authenticated");

      // Save question to quiz_questions if it doesn't exist
      const { error: questionError } = await supabase
        .from('quiz_questions')
        .upsert({
          id: question.id,
          type: question.type,
          question: question.question,
          options: JSON.stringify(question.options || []),
          correct_answer: String(question.correctAnswer),
          explanation: question.explanation || "",
          difficulty: question.difficulty || "medium",
          topic: question.topic || "",
          subtopic: question.subtopic || ""
        });

      if (questionError) throw questionError;

      // Add to disputed questions
      const { error } = await supabase
        .from('disputed_questions')
        .insert({
          id: uuidv4(),
          user_id: user.id,
          question_id: question.id,
          user_answer: userAnswer !== null ? String(userAnswer) : null,
          dispute_reason: disputeReason,
          date_disputed: new Date().toISOString(),
          status: 'pending'
        });

      if (error) throw error;
    }

    // Also update localStorage
    const history = await loadQuizHistory();
    const disputedQuestion: DisputedQuestion = {
      questionId: question.id,
      question,
      userAnswer,
      disputeReason,
      dateDisputed: new Date().toISOString(),
      status: 'pending'
    };
    
    const updatedHistory = {
      ...history,
      disputedQuestions: [...history.disputedQuestions, disputedQuestion]
    };
    localStorage.setItem("quizHistory", JSON.stringify(updatedHistory));
  } catch (error) {
    console.error("Error adding disputed question:", error);
    
    // Fallback to localStorage only
    const history = JSON.parse(localStorage.getItem("quizHistory") || '{"attempts":[],"reviewList":[],"disputedQuestions":[]}');
    const disputedQuestion = {
      questionId: question.id,
      question,
      userAnswer,
      disputeReason,
      dateDisputed: new Date().toISOString(),
      status: 'pending'
    };
    
    const updatedHistory = {
      ...history,
      disputedQuestions: [...history.disputedQuestions, disputedQuestion]
    };
    localStorage.setItem("quizHistory", JSON.stringify(updatedHistory));
  }
};

// Remove disputed question
export const removeDisputedQuestion = async (questionId: string): Promise<void> => {
  try {
    if (isAuthenticated()) {
      const user = await getCurrentUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from('disputed_questions')
        .delete()
        .eq('user_id', user.id)
        .eq('question_id', questionId);

      if (error) throw error;
    }

    // Also update localStorage
    const history = await loadQuizHistory();
    const updatedHistory = {
      ...history,
      disputedQuestions: history.disputedQuestions.filter(q => q.questionId !== questionId)
    };
    localStorage.setItem("quizHistory", JSON.stringify(updatedHistory));
  } catch (error) {
    console.error("Error removing disputed question:", error);
    
    // Fallback to localStorage only
    const history = JSON.parse(localStorage.getItem("quizHistory") || '{"attempts":[],"reviewList":[],"disputedQuestions":[]}');
    const updatedHistory = {
      ...history,
      disputedQuestions: history.disputedQuestions.filter((q: DisputedQuestion) => q.questionId !== questionId)
    };
    localStorage.setItem("quizHistory", JSON.stringify(updatedHistory));
  }
};

// Clear all disputed questions
export const clearDisputedQuestions = async (): Promise<void> => {
  try {
    if (isAuthenticated()) {
      const user = await getCurrentUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from('disputed_questions')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
    }

    // Also update localStorage
    const history = await loadQuizHistory();
    const updatedHistory = {
      ...history,
      disputedQuestions: []
    };
    localStorage.setItem("quizHistory", JSON.stringify(updatedHistory));
  } catch (error) {
    console.error("Error clearing disputed questions:", error);
    
    // Fallback to localStorage only
    const history = JSON.parse(localStorage.getItem("quizHistory") || '{"attempts":[],"reviewList":[],"disputedQuestions":[]}');
    const updatedHistory = {
      ...history,
      disputedQuestions: []
    };
    localStorage.setItem("quizHistory", JSON.stringify(updatedHistory));
  }
};

// Check if a question is already disputed
export const isQuestionDisputed = async (questionId: string): Promise<boolean> => {
  try {
    if (isAuthenticated()) {
      const user = await getCurrentUser();
      if (!user) return false;

      const { data, error } = await supabase
        .from('disputed_questions')
        .select('*')
        .eq('user_id', user.id)
        .eq('question_id', questionId);

      if (error) throw error;
      return !!data && data.length > 0;
    }

    // Fallback to localStorage
    const history = JSON.parse(localStorage.getItem("quizHistory") || '{"attempts":[],"reviewList":[],"disputedQuestions":[]}');
    return history.disputedQuestions.some((q: DisputedQuestion) => q.questionId === questionId);
  } catch (error) {
    console.error("Error checking if question is disputed:", error);
    
    // Fallback to localStorage
    const history = JSON.parse(localStorage.getItem("quizHistory") || '{"attempts":[],"reviewList":[],"disputedQuestions":[]}');
    return history.disputedQuestions.some((q: DisputedQuestion) => q.questionId === questionId);
  }
};

// Update learning preferences
export const updateLearningPreferences = async (preferences: LearningPreferences): Promise<void> => {
  try {
    if (isAuthenticated()) {
      const user = await getCurrentUser();
      if (!user) throw new Error("User not authenticated");

      // Convert LearningPreferences to JSON for Supabase
      const preferencesJson = JSON.stringify(preferences);

      const { error } = await supabase
        .from('users')
        .update({ learning_preferences: preferencesJson })
        .eq('id', user.id);

      if (error) throw error;
    }

    // Also update localStorage
    const history = await loadQuizHistory();
    const updatedHistory = {
      ...history,
      learningPreferences: preferences
    };
    localStorage.setItem("quizHistory", JSON.stringify(updatedHistory));
  } catch (error) {
    console.error("Error updating learning preferences:", error);
    
    // Fallback to localStorage only
    const history = JSON.parse(localStorage.getItem("quizHistory") || '{"attempts":[],"reviewList":[],"disputedQuestions":[],"learningPreferences":{}}');
    const updatedHistory = {
      ...history,
      learningPreferences: preferences
    };
    localStorage.setItem("quizHistory", JSON.stringify(updatedHistory));
  }
};
