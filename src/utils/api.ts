
// Simulate API calls with mock data

import { QuizQuestion } from "@/types/quiz";
import { v4 as uuidv4 } from 'uuid';

// Mock function to generate questions based on learning objectives
export const generateQuestions = async (
  objectives: string, 
  difficulty: string = "medium",
  questionCount: number = 10,
  questionTypes: string[] = ["multiple_choice", "fill_in"]
): Promise<QuizQuestion[]> => {
  // This would typically be an API call to a backend service
  // For now, we'll simulate a delay and return mock data
  
  return new Promise((resolve) => {
    setTimeout(() => {
      const questions: QuizQuestion[] = [];
      
      // Generate the requested number of questions
      for (let i = 0; i < questionCount; i++) {
        // Determine question type
        const questionType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
        
        if (questionType === "multiple_choice") {
          questions.push(generateMultipleChoiceQuestion(objectives, difficulty, i));
        } else {
          questions.push(generateFillInQuestion(objectives, difficulty, i));
        }
      }
      
      resolve(questions);
    }, 1500); // Simulate API delay
  });
};

// Helper to generate multiple choice questions
function generateMultipleChoiceQuestion(objectives: string, difficulty: string, index: number): QuizQuestion {
  const topics = objectives.split(',').map(t => t.trim());
  const topic = topics[Math.floor(Math.random() * topics.length)];
  
  let questionText, options, correctAnswer, explanation;
  
  // Adjust question difficulty
  if (difficulty === "easy") {
    questionText = `What is the main purpose of ${topic}?`;
    options = [
      `To simplify development processes`,
      `To organize code more efficiently`,
      `To improve performance`,
      `To provide better user experiences`
    ];
    correctAnswer = Math.floor(Math.random() * 4);
    explanation = `${topic} is primarily designed to ${options[correctAnswer].toLowerCase()}.`;
  } 
  else if (difficulty === "medium") {
    questionText = `Which of the following is a key characteristic of ${topic}?`;
    options = [
      `It supports asynchronous operations`,
      `It follows object-oriented principles`,
      `It has strong typing`,
      `It provides built-in error handling`
    ];
    correctAnswer = Math.floor(Math.random() * 4);
    explanation = `A key characteristic of ${topic} is that ${options[correctAnswer].toLowerCase()}.`;
  }
  else { // hard
    questionText = `What advanced concept is most closely associated with ${topic}?`;
    options = [
      `Polymorphism and inheritance`,
      `Concurrency and parallelism`,
      `Metaprogramming`,
      `Memory management and optimization`
    ];
    correctAnswer = Math.floor(Math.random() * 4);
    explanation = `${topic} is closely associated with ${options[correctAnswer].toLowerCase()} especially in advanced applications.`;
  }
  
  return {
    id: uuidv4(),
    question: questionText,
    type: "multiple_choice",
    options: options,
    correctAnswer: correctAnswer,
    explanation: explanation
  };
}

// Helper to generate fill-in questions
function generateFillInQuestion(objectives: string, difficulty: string, index: number): QuizQuestion {
  const topics = objectives.split(',').map(t => t.trim());
  const topic = topics[Math.floor(Math.random() * topics.length)];
  
  let questionText, correctAnswer, explanation;
  
  // Adjust question difficulty
  if (difficulty === "easy") {
    questionText = `The full name of ${topic.substring(0, 3)}_____ is:`;
    correctAnswer = topic;
    explanation = `${topic} is a fundamental concept in this field.`;
  } 
  else if (difficulty === "medium") {
    questionText = `Complete this definition: ${topic} is a technology used for ________.`;
    correctAnswer = "data processing";
    explanation = `${topic} is commonly used for data processing in various applications.`;
  }
  else { // hard
    questionText = `In the context of ${topic}, what term describes the process of converting data between incompatible types?`;
    correctAnswer = "type coercion";
    explanation = `Type coercion is an important concept in ${topic} that handles automatic or implicit conversion of values from one data type to another.`;
  }
  
  return {
    id: uuidv4(),
    question: questionText,
    type: "fill_in",
    correctAnswer: correctAnswer,
    explanation: explanation
  };
}
