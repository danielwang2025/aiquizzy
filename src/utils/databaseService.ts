
import { QuizQuestion, QuizResult, QuizAttempt } from "@/types/quiz";
import { supabase } from "@/integrations/supabase/client";
import { getCurrentUser } from "./authService";

// Save a quiz to the database
export const saveQuizToDatabase = async (questions: QuizQuestion[], title: string): Promise<string> => {
  try {
    // First save the questions individually
    for (const question of questions) {
      // Check if question already exists to avoid duplicates
      const { data: existingQuestion } = await supabase
        .from('quiz_questions')
        .select()
        .eq('id', question.id)
        .single();
      
      if (!existingQuestion) {
        // Convert the question object to match the database structure
        const questionData = {
          id: question.id,
          question: question.question,
          type: question.type,
          options: question.options ? JSON.stringify(question.options) : null,
          correct_answer: question.correctAnswer.toString(),
          explanation: question.explanation,
          difficulty: question.difficulty,
          topic: question.topic,
          subtopic: question.subtopic
        };
        
        // Insert the question
        await supabase.from('quiz_questions').insert(questionData);
      }
    }
    
    // Generate a unique ID for the quiz
    const quizId = crypto.randomUUID();
    
    // For future integration: We could store the quiz metadata in a separate table
    // For now, we'll return the ID that can be used to reference the set of questions
    return quizId;
  } catch (error) {
    console.error("Error saving quiz to database:", error);
    throw error;
  }
};

// Get all quizzes from the database
export const getQuizzesFromDatabase = async () => {
  try {
    const { data, error } = await supabase
      .from('quiz_questions')
      .select('*');
    
    if (error) throw error;
    
    // Group questions by common properties to simulate "quizzes"
    // This is temporary until we implement a proper quizzes table
    return data.map(question => ({
      id: question.id,
      title: question.topic || "Untitled Quiz",
      questions: [mapDatabaseQuestionToAppQuestion(question)],
      createdAt: question.created_at
    }));
  } catch (error) {
    console.error("Error getting quizzes from database:", error);
    return [];
  }
};

// Get a quiz by ID
export const getQuizById = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('id', id);
    
    if (error) throw error;
    
    if (data && data.length > 0) {
      return {
        id: data[0].id,
        title: data[0].topic || "Untitled Quiz",
        questions: [mapDatabaseQuestionToAppQuestion(data[0])],
        createdAt: data[0].created_at
      };
    }
    
    return null;
  } catch (error) {
    console.error("Error getting quiz by ID:", error);
    return null;
  }
};

// Save quiz attempt
export const saveQuizAttemptToDatabase = async (
  quizId: string,
  userAnswers: (string | number | null)[],
  result: QuizResult
) => {
  try {
    const currentUser = getCurrentUser();
    const userId = currentUser?.id;
    
    if (!userId) {
      console.warn("No user ID available for saving quiz attempt");
      // For anonymous users, fallback to localStorage
      return saveQuizAttemptToLocalStorage(quizId, userAnswers, result);
    }
    
    const attemptId = crypto.randomUUID();
    
    const attemptData = {
      id: attemptId,
      quiz_id: quizId,
      user_id: userId,
      user_answers: userAnswers,
      result: result,
      date: new Date().toISOString()
    };
    
    const { error } = await supabase
      .from('quiz_history')
      .insert(attemptData);
    
    if (error) throw error;
    
    return attemptId;
  } catch (error) {
    console.error("Error saving quiz attempt to database:", error);
    // Fallback to localStorage if Supabase fails
    return saveQuizAttemptToLocalStorage(quizId, userAnswers, result);
  }
};

// Fallback function to save quiz attempt to localStorage
const saveQuizAttemptToLocalStorage = (
  quizId: string,
  userAnswers: (string | number | null)[],
  result: QuizResult
) => {
  const DB_ATTEMPTS_KEY = "quiz_db_attempts";
  const attempts = JSON.parse(localStorage.getItem(DB_ATTEMPTS_KEY) || "[]");
  
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
export const getQuizAttemptsFromDatabase = async () => {
  try {
    const currentUser = getCurrentUser();
    const userId = currentUser?.id;
    
    if (!userId) {
      console.warn("No user ID available for getting quiz attempts");
      // For anonymous users, fallback to localStorage
      return getQuizAttemptsFromLocalStorage();
    }
    
    const { data, error } = await supabase
      .from('quiz_history')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });
    
    if (error) throw error;
    
    return data?.map(mapDatabaseAttemptToAppAttempt) || [];
  } catch (error) {
    console.error("Error getting quiz attempts from database:", error);
    // Fallback to localStorage if Supabase fails
    return getQuizAttemptsFromLocalStorage();
  }
};

// Fallback function to get quiz attempts from localStorage
const getQuizAttemptsFromLocalStorage = () => {
  const DB_ATTEMPTS_KEY = "quiz_db_attempts";
  const attemptsJson = localStorage.getItem(DB_ATTEMPTS_KEY);
  return attemptsJson ? JSON.parse(attemptsJson) : [];
};

// Get quiz attempts by quiz ID
export const getQuizAttemptsByQuizId = async (quizId: string) => {
  try {
    const currentUser = getCurrentUser();
    const userId = currentUser?.id;
    
    if (!userId) {
      console.warn("No user ID available for getting quiz attempts");
      // For anonymous users, fallback to localStorage
      return getQuizAttemptsByQuizIdFromLocalStorage(quizId);
    }
    
    const { data, error } = await supabase
      .from('quiz_history')
      .select('*')
      .eq('user_id', userId)
      .eq('quiz_id', quizId)
      .order('date', { ascending: false });
    
    if (error) throw error;
    
    return data?.map(mapDatabaseAttemptToAppAttempt) || [];
  } catch (error) {
    console.error("Error getting quiz attempts by quiz ID:", error);
    // Fallback to localStorage if Supabase fails
    return getQuizAttemptsByQuizIdFromLocalStorage(quizId);
  }
};

// Fallback function to get quiz attempts by quiz ID from localStorage
const getQuizAttemptsByQuizIdFromLocalStorage = (quizId: string) => {
  const attempts = getQuizAttemptsFromLocalStorage();
  return attempts.filter((attempt: any) => attempt.quizId === quizId);
};

// Delete a quiz
export const deleteQuizFromDatabase = async (id: string) => {
  try {
    // Delete the quiz question
    const { error: questionError } = await supabase
      .from('quiz_questions')
      .delete()
      .eq('id', id);
    
    if (questionError) throw questionError;
    
    // Also delete associated attempts
    const currentUser = getCurrentUser();
    const userId = currentUser?.id;
    
    if (userId) {
      const { error: attemptError } = await supabase
        .from('quiz_history')
        .delete()
        .eq('user_id', userId)
        .eq('quiz_id', id);
      
      if (attemptError) throw attemptError;
    } else {
      // Fallback to localStorage if no user ID
      deleteQuizFromLocalStorage(id);
    }
  } catch (error) {
    console.error("Error deleting quiz from database:", error);
    // Fallback to localStorage if Supabase fails
    deleteQuizFromLocalStorage(id);
  }
};

// Fallback function to delete a quiz from localStorage
const deleteQuizFromLocalStorage = (id: string) => {
  const DB_QUIZZES_KEY = "quiz_db_quizzes";
  const DB_ATTEMPTS_KEY = "quiz_db_attempts";
  
  const quizzes = JSON.parse(localStorage.getItem(DB_QUIZZES_KEY) || "[]");
  const filteredQuizzes = quizzes.filter((quiz: any) => quiz.id !== id);
  localStorage.setItem(DB_QUIZZES_KEY, JSON.stringify(filteredQuizzes));
  
  const attempts = JSON.parse(localStorage.getItem(DB_ATTEMPTS_KEY) || "[]");
  const filteredAttempts = attempts.filter((attempt: any) => attempt.quizId !== id);
  localStorage.setItem(DB_ATTEMPTS_KEY, JSON.stringify(filteredAttempts));
};

// Helper function to map database question to app question
const mapDatabaseQuestionToAppQuestion = (dbQuestion: any): QuizQuestion => {
  return {
    id: dbQuestion.id,
    question: dbQuestion.question,
    type: dbQuestion.type as 'multiple_choice' | 'fill_in',
    options: dbQuestion.options ? JSON.parse(dbQuestion.options) : undefined,
    correctAnswer: dbQuestion.correct_answer,
    explanation: dbQuestion.explanation,
    difficulty: dbQuestion.difficulty as 'easy' | 'medium' | 'hard',
    topic: dbQuestion.topic,
    subtopic: dbQuestion.subtopic
  };
};

// Helper function to map database attempt to app attempt
const mapDatabaseAttemptToAppAttempt = (dbAttempt: any): QuizAttempt => {
  return {
    id: dbAttempt.id,
    userId: dbAttempt.user_id,
    date: dbAttempt.date,
    objectives: dbAttempt.objectives || "Quiz Attempt",
    questions: [], // This would need to be fetched separately
    userAnswers: dbAttempt.user_answers || [],
    result: dbAttempt.result,
    difficulty: dbAttempt.difficulty as 'easy' | 'medium' | 'hard',
    topics: dbAttempt.topics || []
  };
};
