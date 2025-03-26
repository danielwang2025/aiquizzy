
import { QuizQuestion, QuizResult, QuizAttempt } from "@/types/quiz";
import { supabase } from "./supabaseClient";

// Save a quiz to the database
export const saveQuizToDatabase = async (questions: QuizQuestion[], title: string): Promise<string> => {
  const user = await supabase.auth.getUser();
  const userId = user.data.user?.id;
  
  const quizId = crypto.randomUUID();
  
  const { error } = await supabase
    .from('quizzes')
    .insert({
      id: quizId,
      title,
      questions,
      created_by: userId || null,
      created_at: new Date().toISOString()
    });
  
  if (error) {
    console.error("Error saving quiz:", error);
    throw error;
  }
  
  return quizId;
};

// Get all quizzes from the database
export const getQuizzesFromDatabase = async () => {
  const { data, error } = await supabase
    .from('quizzes')
    .select('*');
  
  if (error) {
    console.error("Error getting quizzes:", error);
    throw error;
  }
  
  return data || [];
};

// Get a quiz by ID
export const getQuizById = async (id: string) => {
  const { data, error } = await supabase
    .from('quizzes')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error("Error getting quiz by ID:", error);
    return null;
  }
  
  return data;
};

// Save quiz attempt
export const saveQuizAttemptToDatabase = async (
  quizId: string,
  userAnswers: (string | number | null)[],
  result: QuizResult
) => {
  const user = await supabase.auth.getUser();
  const userId = user.data.user?.id;
  
  const attemptId = crypto.randomUUID();
  
  const { error } = await supabase
    .from('quiz_attempts')
    .insert({
      id: attemptId,
      quiz_id: quizId,
      user_id: userId || null,
      user_answers: userAnswers,
      result,
      created_at: new Date().toISOString()
    });
  
  if (error) {
    console.error("Error saving quiz attempt:", error);
    throw error;
  }
  
  return attemptId;
};

// Get quiz attempts
export const getQuizAttemptsFromDatabase = async () => {
  const { data, error } = await supabase
    .from('quiz_attempts')
    .select('*');
  
  if (error) {
    console.error("Error getting quiz attempts:", error);
    throw error;
  }
  
  return data || [];
};

// Get quiz attempts by quiz ID
export const getQuizAttemptsByQuizId = async (quizId: string) => {
  const { data, error } = await supabase
    .from('quiz_attempts')
    .select('*')
    .eq('quiz_id', quizId);
  
  if (error) {
    console.error("Error getting quiz attempts by quiz ID:", error);
    throw error;
  }
  
  return data || [];
};

// Delete a quiz
export const deleteQuizFromDatabase = async (id: string) => {
  // First delete associated attempts
  const { error: attemptError } = await supabase
    .from('quiz_attempts')
    .delete()
    .eq('quiz_id', id);
  
  if (attemptError) {
    console.error("Error deleting quiz attempts:", attemptError);
    throw attemptError;
  }
  
  // Then delete the quiz
  const { error } = await supabase
    .from('quizzes')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error("Error deleting quiz:", error);
    throw error;
  }
};
