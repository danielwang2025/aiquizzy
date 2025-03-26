
import { v4 as uuidv4 } from "uuid";
import { QuizQuestion, QuizAttempt, QuizResult } from "@/types/quiz";
import { supabase } from "@/integrations/supabase/client";
import { isAuthenticated, getCurrentUser } from "./authService";

// In-memory storage for quizzes (fallback)
const quizzes: { [id: string]: any } = {};

// Helper function to parse a quiz question
const parseQuizQuestion = (questionData: any): QuizQuestion => {
  return {
    id: questionData.id || "",
    type: questionData.type as "multiple_choice" | "fill_in",
    question: questionData.question || "",
    options: Array.isArray(questionData.options) 
      ? questionData.options 
      : typeof questionData.options === 'string' 
        ? JSON.parse(questionData.options) 
        : [],
    correctAnswer: questionData.correct_answer || questionData.correctAnswer || "",
    explanation: questionData.explanation || "",
    difficulty: questionData.difficulty as "easy" | "medium" | "hard" || "medium",
    topic: questionData.topic || "",
    subtopic: questionData.subtopic || ""
  };
};

// Save quiz questions to database
export const saveQuizToDatabase = async (
  questions: QuizQuestion[],
  title: string
): Promise<string> => {
  try {
    const quizId = uuidv4();
    
    // If authenticated, save to Supabase
    if (isAuthenticated()) {
      const user = await getCurrentUser();
      
      // Save each question to quiz_questions
      for (const question of questions) {
        const { error } = await supabase
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
          
        if (error) throw error;
      }
      
      // Create a record of this quiz generation in quiz_history
      if (user) {
        const { error } = await supabase
          .from('quiz_history')
          .insert({
            id: quizId,
            user_id: user.id,
            objectives: title,
            questions: JSON.stringify(questions),
            date: new Date().toISOString()
          });
          
        if (error) {
          console.error("Error saving quiz to database:", error);
        }
      }
    }
    
    // Also store in memory
    quizzes[quizId] = {
      id: quizId,
      title,
      questions,
      createdAt: new Date().toISOString()
    };
    
    return quizId;
  } catch (error) {
    console.error("Error saving quiz to database:", error);
    
    // Fallback to in-memory storage
    const quizId = uuidv4();
    quizzes[quizId] = {
      id: quizId,
      title,
      questions,
      createdAt: new Date().toISOString()
    };
    
    return quizId;
  }
};

// Get a quiz by ID
export const getQuizById = async (id: string): Promise<{ id: string; title: string; questions: QuizQuestion[]; createdAt: string; } | null> => {
  // First try to get from in-memory storage
  if (quizzes[id]) {
    return quizzes[id];
  }
  
  try {
    // Try to find in Supabase
    if (isAuthenticated()) {
      const { data, error } = await supabase
        .from('quiz_history')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) {
        if (error.code !== 'PGRST116') { // not found
          console.error("Error fetching quiz:", error);
        }
      } else if (data) {
        const parsedQuestions = data.questions 
          ? (typeof data.questions === 'string' 
            ? JSON.parse(data.questions) 
            : data.questions)
          : [];
          
        const questions = Array.isArray(parsedQuestions) 
          ? parsedQuestions.map(parseQuizQuestion)
          : [];
          
        const quiz = {
          id: data.id,
          title: data.objectives || "Quiz",
          questions,
          createdAt: data.date || data.created_at
        };
        
        // Cache for future use
        quizzes[id] = quiz;
        
        return quiz;
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error getting quiz by ID:", error);
    return null;
  }
};

// Save quiz attempt result
export const saveQuizAttemptResult = async (
  quizId: string, 
  userAnswers: (string | number)[], 
  result: QuizResult
): Promise<void> => {
  try {
    if (isAuthenticated()) {
      const user = await getCurrentUser();
      if (!user) return;
      
      const attemptId = uuidv4();
      
      const { error } = await supabase
        .from('quiz_history')
        .update({
          user_answers: JSON.stringify(userAnswers),
          result: JSON.stringify(result)
        })
        .eq('id', quizId)
        .eq('user_id', user.id);
        
      if (error) throw error;
    }
  } catch (error) {
    console.error("Error saving quiz attempt result:", error);
  }
};
