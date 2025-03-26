
import { QuizAttempt, QuizQuestion, QuizHistory, DisputedQuestion } from "@/types/quiz";
import { getCurrentUser } from "./authService";
import { supabase } from "@/integrations/supabase/client";

// Load quiz history
export const loadQuizHistory = async (): Promise<QuizHistory> => {
  try {
    const currentUser = getCurrentUser();
    const userId = currentUser?.id;
    
    if (!userId) {
      console.warn("No user ID available for loading quiz history");
      // For anonymous users, fallback to localStorage
      return loadQuizHistoryFromLocalStorage();
    }
    
    // Get user attempts
    const { data: attemptsData, error: attemptsError } = await supabase
      .from('quiz_history')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });
    
    if (attemptsError) throw attemptsError;
    
    // Get review list
    const { data: reviewData, error: reviewError } = await supabase
      .from('review_list')
      .select('*, quiz_questions(*)')
      .eq('user_id', userId);
    
    if (reviewError) throw reviewError;
    
    // Get disputed questions
    const { data: disputedData, error: disputedError } = await supabase
      .from('disputed_questions')
      .select('*')
      .eq('user_id', userId);
    
    if (disputedError) throw disputedError;
    
    // Map the data to the expected format
    const attempts = attemptsData?.map((attempt) => ({
      id: attempt.id,
      userId: attempt.user_id,
      date: attempt.date,
      objectives: attempt.objectives || "Quiz Attempt",
      questions: [], // This would need to be fetched separately
      userAnswers: attempt.user_answers || [],
      result: attempt.result,
      difficulty: attempt.difficulty,
      topics: attempt.topics
    })) || [];
    
    const reviewList = reviewData?.map((item) => ({
      id: item.question_id,
      question: item.quiz_questions?.question || "",
      type: (item.quiz_questions?.type as 'multiple_choice' | 'fill_in') || 'multiple_choice',
      options: item.quiz_questions?.options ? JSON.parse(item.quiz_questions.options) : undefined,
      correctAnswer: item.quiz_questions?.correct_answer || "",
      explanation: item.quiz_questions?.explanation,
      difficulty: item.quiz_questions?.difficulty as 'easy' | 'medium' | 'hard',
      topic: item.quiz_questions?.topic,
      subtopic: item.quiz_questions?.subtopic
    })) || [];
    
    const disputedQuestions = disputedData?.map((item) => ({
      questionId: item.question_id || "",
      question: {
        id: item.question_id || "",
        question: "", // Would need to be fetched from quiz_questions
        type: 'multiple_choice',
        correctAnswer: "",
      },
      userAnswer: item.user_answer,
      disputeReason: item.dispute_reason || "",
      dateDisputed: item.date_disputed || new Date().toISOString(),
      status: (item.status as 'pending' | 'reviewed') || 'pending'
    })) || [];
    
    return {
      userId,
      attempts,
      reviewList,
      disputedQuestions
    };
  } catch (error) {
    console.error("Error loading quiz history from database:", error);
    // Fallback to localStorage if Supabase fails
    return loadQuizHistoryFromLocalStorage();
  }
};

// Fallback function to load quiz history from localStorage
const loadQuizHistoryFromLocalStorage = (): QuizHistory => {
  const HISTORY_KEY = "quiz_history";
  const currentUser = getCurrentUser();
  const userId = currentUser?.id;
  const key = userId || 'anonymous';
  
  const savedHistory = localStorage.getItem(HISTORY_KEY);
  let history: QuizHistory = { attempts: [], reviewList: [], disputedQuestions: [] };
  
  if (savedHistory) {
    try {
      const allHistories = JSON.parse(savedHistory);
      
      // If user is logged in, find their history
      if (userId) {
        const userHistory = allHistories[userId];
        if (userHistory) {
          history = userHistory;
          // Ensure disputedQuestions exists (for backwards compatibility)
          if (!history.disputedQuestions) {
            history.disputedQuestions = [];
          }
        }
      } else {
        // For anonymous users, use the 'anonymous' key
        const anonymousHistory = allHistories.anonymous;
        if (anonymousHistory) {
          history = anonymousHistory;
          // Ensure disputedQuestions exists (for backwards compatibility)
          if (!history.disputedQuestions) {
            history.disputedQuestions = [];
          }
        }
      }
    } catch (error) {
      console.error("Error loading quiz history:", error);
    }
  }
  
  return history;
};

// Save quiz history
export const saveQuizHistory = async (history: QuizHistory): Promise<void> => {
  try {
    const currentUser = getCurrentUser();
    const userId = currentUser?.id;
    
    if (!userId) {
      console.warn("No user ID available for saving quiz history");
      // For anonymous users, fallback to localStorage
      saveQuizHistoryToLocalStorage(history);
      return;
    }
    
    // We don't directly save the whole history object to Supabase
    // Instead, we update the individual collections as needed
    
    // This function is primarily used as a fallback or for compatibility
    
    // Save the history to localStorage as a fallback
    saveQuizHistoryToLocalStorage(history);
  } catch (error) {
    console.error("Error saving quiz history to database:", error);
    // Fallback to localStorage if Supabase fails
    saveQuizHistoryToLocalStorage(history);
  }
};

// Fallback function to save quiz history to localStorage
const saveQuizHistoryToLocalStorage = (history: QuizHistory): void => {
  const HISTORY_KEY = "quiz_history";
  const currentUser = getCurrentUser();
  const userId = currentUser?.id;
  const key = userId || 'anonymous';
  
  let allHistories = {};
  const savedHistory = localStorage.getItem(HISTORY_KEY);
  
  if (savedHistory) {
    try {
      allHistories = JSON.parse(savedHistory);
    } catch (error) {
      console.error("Error parsing existing history:", error);
    }
  }
  
  // Add userId to history object
  history.userId = userId;
  
  // Update user's history in the collection
  allHistories = { ...allHistories, [key]: history };
  
  localStorage.setItem(HISTORY_KEY, JSON.stringify(allHistories));
};

// Add a new quiz attempt to history
export const saveQuizAttempt = async (attempt: QuizAttempt): Promise<void> => {
  try {
    const currentUser = getCurrentUser();
    const userId = currentUser?.id;
    
    if (!userId) {
      console.warn("No user ID available for saving quiz attempt");
      // For anonymous users, fallback to localStorage
      saveQuizAttemptToLocalStorage(attempt);
      return;
    }
    
    // Add userId to attempt
    attempt.userId = userId;
    
    const attemptData = {
      id: attempt.id,
      user_id: userId,
      quiz_id: attempt.id, // This might need adjustment based on data model
      objectives: attempt.objectives,
      user_answers: attempt.userAnswers,
      result: attempt.result,
      date: attempt.date,
      difficulty: attempt.difficulty,
      topics: attempt.topics
    };
    
    const { error } = await supabase
      .from('quiz_history')
      .insert(attemptData);
    
    if (error) throw error;
  } catch (error) {
    console.error("Error saving quiz attempt to database:", error);
    // Fallback to localStorage if Supabase fails
    saveQuizAttemptToLocalStorage(attempt);
  }
};

// Fallback function to save quiz attempt to localStorage
const saveQuizAttemptToLocalStorage = (attempt: QuizAttempt): void => {
  const history = loadQuizHistoryFromLocalStorage();
  history.attempts = [attempt, ...history.attempts];
  saveQuizHistoryToLocalStorage(history);
};

// Add a question to the review list
export const addToReviewList = async (question: QuizQuestion): Promise<void> => {
  try {
    const currentUser = getCurrentUser();
    const userId = currentUser?.id;
    
    if (!userId) {
      console.warn("No user ID available for adding to review list");
      // For anonymous users, fallback to localStorage
      addToReviewListLocalStorage(question);
      return;
    }
    
    // Check if question is already in review list
    const { data, error: checkError } = await supabase
      .from('review_list')
      .select()
      .eq('user_id', userId)
      .eq('question_id', question.id);
    
    if (checkError) throw checkError;
    
    if (data && data.length === 0) {
      // Question not in review list, add it
      const { error } = await supabase
        .from('review_list')
        .insert({
          user_id: userId,
          question_id: question.id,
          added_at: new Date().toISOString()
        });
      
      if (error) throw error;
    }
  } catch (error) {
    console.error("Error adding to review list in database:", error);
    // Fallback to localStorage if Supabase fails
    addToReviewListLocalStorage(question);
  }
};

// Fallback function to add to review list in localStorage
const addToReviewListLocalStorage = (question: QuizQuestion): void => {
  const history = loadQuizHistoryFromLocalStorage();
  // Check if question is already in review list
  const exists = history.reviewList.some(q => q.id === question.id);
  if (!exists) {
    history.reviewList = [question, ...history.reviewList];
    saveQuizHistoryToLocalStorage(history);
  }
};

// Remove a question from the review list
export const removeFromReviewList = async (questionId: string): Promise<void> => {
  try {
    const currentUser = getCurrentUser();
    const userId = currentUser?.id;
    
    if (!userId) {
      console.warn("No user ID available for removing from review list");
      // For anonymous users, fallback to localStorage
      removeFromReviewListLocalStorage(questionId);
      return;
    }
    
    const { error } = await supabase
      .from('review_list')
      .delete()
      .eq('user_id', userId)
      .eq('question_id', questionId);
    
    if (error) throw error;
  } catch (error) {
    console.error("Error removing from review list in database:", error);
    // Fallback to localStorage if Supabase fails
    removeFromReviewListLocalStorage(questionId);
  }
};

// Fallback function to remove from review list in localStorage
const removeFromReviewListLocalStorage = (questionId: string): void => {
  const history = loadQuizHistoryFromLocalStorage();
  history.reviewList = history.reviewList.filter(q => q.id !== questionId);
  saveQuizHistoryToLocalStorage(history);
};

// Clear review list
export const clearReviewList = async (): Promise<void> => {
  try {
    const currentUser = getCurrentUser();
    const userId = currentUser?.id;
    
    if (!userId) {
      console.warn("No user ID available for clearing review list");
      // For anonymous users, fallback to localStorage
      clearReviewListLocalStorage();
      return;
    }
    
    const { error } = await supabase
      .from('review_list')
      .delete()
      .eq('user_id', userId);
    
    if (error) throw error;
  } catch (error) {
    console.error("Error clearing review list in database:", error);
    // Fallback to localStorage if Supabase fails
    clearReviewListLocalStorage();
  }
};

// Fallback function to clear review list in localStorage
const clearReviewListLocalStorage = (): void => {
  const history = loadQuizHistoryFromLocalStorage();
  history.reviewList = [];
  saveQuizHistoryToLocalStorage(history);
};

// Clear all history for current user
export const clearAllHistory = async (): Promise<void> => {
  try {
    const currentUser = getCurrentUser();
    const userId = currentUser?.id;
    
    if (!userId) {
      console.warn("No user ID available for clearing history");
      // For anonymous users, fallback to localStorage
      clearAllHistoryLocalStorage();
      return;
    }
    
    // Delete all user's data from the three tables
    await Promise.all([
      supabase.from('quiz_history').delete().eq('user_id', userId),
      supabase.from('review_list').delete().eq('user_id', userId),
      supabase.from('disputed_questions').delete().eq('user_id', userId)
    ]);
  } catch (error) {
    console.error("Error clearing history in database:", error);
    // Fallback to localStorage if Supabase fails
    clearAllHistoryLocalStorage();
  }
};

// Fallback function to clear all history in localStorage
const clearAllHistoryLocalStorage = (): void => {
  const HISTORY_KEY = "quiz_history";
  const currentUser = getCurrentUser();
  const userId = currentUser?.id;
  const key = userId || 'anonymous';
  
  let allHistories = {};
  const savedHistory = localStorage.getItem(HISTORY_KEY);
  
  if (savedHistory) {
    try {
      allHistories = JSON.parse(savedHistory);
      // Delete only current user's history
      delete allHistories[key];
      localStorage.setItem(HISTORY_KEY, JSON.stringify(allHistories));
    } catch (error) {
      console.error("Error clearing history:", error);
    }
  }
};

// Add a disputed question
export const addDisputedQuestion = async (
  question: QuizQuestion, 
  userAnswer: string | number | null, 
  disputeReason: string
): Promise<void> => {
  try {
    const currentUser = getCurrentUser();
    const userId = currentUser?.id;
    
    if (!userId) {
      console.warn("No user ID available for adding disputed question");
      // For anonymous users, fallback to localStorage
      addDisputedQuestionLocalStorage(question, userAnswer, disputeReason);
      return;
    }
    
    const disputeData = {
      user_id: userId,
      question_id: question.id,
      user_answer: userAnswer !== null ? userAnswer.toString() : null,
      dispute_reason: disputeReason,
      date_disputed: new Date().toISOString(),
      status: 'pending'
    };
    
    const { error } = await supabase
      .from('disputed_questions')
      .insert(disputeData);
    
    if (error) throw error;
  } catch (error) {
    console.error("Error adding disputed question to database:", error);
    // Fallback to localStorage if Supabase fails
    addDisputedQuestionLocalStorage(question, userAnswer, disputeReason);
  }
};

// Fallback function to add disputed question to localStorage
const addDisputedQuestionLocalStorage = (
  question: QuizQuestion, 
  userAnswer: string | number | null, 
  disputeReason: string
): void => {
  const history = loadQuizHistoryFromLocalStorage();
  
  const disputedQuestion: DisputedQuestion = {
    questionId: question.id,
    question,
    userAnswer,
    disputeReason,
    dateDisputed: new Date().toISOString(),
    status: 'pending'
  };
  
  history.disputedQuestions = [disputedQuestion, ...history.disputedQuestions];
  saveQuizHistoryToLocalStorage(history);
};

// Remove a disputed question
export const removeDisputedQuestion = async (questionId: string): Promise<void> => {
  try {
    const currentUser = getCurrentUser();
    const userId = currentUser?.id;
    
    if (!userId) {
      console.warn("No user ID available for removing disputed question");
      // For anonymous users, fallback to localStorage
      removeDisputedQuestionLocalStorage(questionId);
      return;
    }
    
    const { error } = await supabase
      .from('disputed_questions')
      .delete()
      .eq('user_id', userId)
      .eq('question_id', questionId);
    
    if (error) throw error;
  } catch (error) {
    console.error("Error removing disputed question from database:", error);
    // Fallback to localStorage if Supabase fails
    removeDisputedQuestionLocalStorage(questionId);
  }
};

// Fallback function to remove disputed question from localStorage
const removeDisputedQuestionLocalStorage = (questionId: string): void => {
  const history = loadQuizHistoryFromLocalStorage();
  history.disputedQuestions = history.disputedQuestions.filter(dq => dq.questionId !== questionId);
  saveQuizHistoryToLocalStorage(history);
};

// Clear all disputed questions
export const clearDisputedQuestions = async (): Promise<void> => {
  try {
    const currentUser = getCurrentUser();
    const userId = currentUser?.id;
    
    if (!userId) {
      console.warn("No user ID available for clearing disputed questions");
      // For anonymous users, fallback to localStorage
      clearDisputedQuestionsLocalStorage();
      return;
    }
    
    const { error } = await supabase
      .from('disputed_questions')
      .delete()
      .eq('user_id', userId);
    
    if (error) throw error;
  } catch (error) {
    console.error("Error clearing disputed questions from database:", error);
    // Fallback to localStorage if Supabase fails
    clearDisputedQuestionsLocalStorage();
  }
};

// Fallback function to clear disputed questions from localStorage
const clearDisputedQuestionsLocalStorage = (): void => {
  const history = loadQuizHistoryFromLocalStorage();
  history.disputedQuestions = [];
  saveQuizHistoryToLocalStorage(history);
};

// Check if a question is disputed
export const isQuestionDisputed = async (questionId: string): Promise<boolean> => {
  try {
    const currentUser = getCurrentUser();
    const userId = currentUser?.id;
    
    if (!userId) {
      console.warn("No user ID available for checking disputed question");
      // For anonymous users, fallback to localStorage
      return isQuestionDisputedLocalStorage(questionId);
    }
    
    const { data, error } = await supabase
      .from('disputed_questions')
      .select()
      .eq('user_id', userId)
      .eq('question_id', questionId);
    
    if (error) throw error;
    
    return data && data.length > 0;
  } catch (error) {
    console.error("Error checking disputed question in database:", error);
    // Fallback to localStorage if Supabase fails
    return isQuestionDisputedLocalStorage(questionId);
  }
};

// Fallback function to check if a question is disputed in localStorage
const isQuestionDisputedLocalStorage = (questionId: string): boolean => {
  const history = loadQuizHistoryFromLocalStorage();
  return history.disputedQuestions.some(dq => dq.questionId === questionId);
};
