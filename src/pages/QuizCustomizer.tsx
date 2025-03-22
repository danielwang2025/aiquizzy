
import React from "react";
import Navigation from "@/components/Navigation";
import QuizGenerator from "@/components/QuizGenerator";

const QuizCustomizer = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <Navigation />
      
      <main className="py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-center">
            Customize Your Practice
          </h1>
          <p className="text-center text-muted-foreground mb-8">
            Input your learning objectives and generate personalized practice questions
          </p>
          
          <QuizGenerator />
        </div>
      </main>
    </div>
  );
};

export default QuizCustomizer;
