
import { supabase } from './supabaseClient';
import { v4 as uuidv4 } from 'uuid';

// Get a quiz by ID
export const getQuizById = async (quizId) => {
  try {
    const { data, error } = await supabase
      .from('quizzes')
      .select('*')
      .eq('id', quizId)
      .single();
    
    if (error) {
      console.error('Error fetching quiz:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching quiz:', error);
    return null;
  }
};

// Save a new quiz
export const saveQuiz = async (quiz, userId) => {
  try {
    const quizId = quiz.id || uuidv4();
    
    const { data, error } = await supabase
      .from('quizzes')
      .insert([
        {
          id: quizId,
          title: quiz.title,
          questions: quiz.questions,
          created_by: userId,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();
    
    if (error) {
      console.error('Error saving quiz:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error saving quiz:', error);
    return null;
  }
};

// Save a quiz attempt
export const saveQuizAttempt = async (quizId, userId, userAnswers, result) => {
  try {
    const { data, error } = await supabase
      .from('quiz_attempts')
      .insert([
        {
          id: uuidv4(),
          quiz_id: quizId,
          user_id: userId,
          user_answers: userAnswers,
          result: result,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();
    
    if (error) {
      console.error('Error saving quiz attempt:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error saving quiz attempt:', error);
    return null;
  }
};

// Get all quizzes for a user
export const getUserQuizzes = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('quizzes')
      .select('*')
      .eq('created_by', userId);
    
    if (error) {
      console.error('Error fetching user quizzes:', error);
      return [];
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching user quizzes:', error);
    return [];
  }
};

// Get quiz attempts for a user
export const getUserQuizAttempts = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('quiz_attempts')
      .select('*, quizzes(title)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching user quiz attempts:', error);
      return [];
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching user quiz attempts:', error);
    return [];
  }
};

// Delete a quiz
export const deleteQuiz = async (quizId) => {
  try {
    const { error } = await supabase
      .from('quizzes')
      .delete()
      .eq('id', quizId);
    
    if (error) {
      console.error('Error deleting quiz:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting quiz:', error);
    return false;
  }
};
