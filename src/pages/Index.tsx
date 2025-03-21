
import React from "react";
import QuizGenerator from "@/components/QuizGenerator";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <header className="py-6 px-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            DeepSeek Quiz Generator
          </h1>
          <p className="text-center text-muted-foreground mt-2">
            Generate personalized practice questions and track your progress
          </p>
        </div>
      </header>
      
      <main className="py-8">
        <QuizGenerator />
      </main>
      
      <footer className="py-8 px-6 text-center text-sm text-muted-foreground">
        <div className="max-w-3xl mx-auto">
          <p>
            This application uses DeepSeek AI to generate customized quiz questions based on your specific learning objectives.
          </p>
          <p className="mt-2">
            Save your progress, review past quizzes, and focus on questions you need to practice more.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
