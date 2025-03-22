
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import QuizGenerator from "@/components/QuizGenerator";
import { isAuthenticated } from "@/utils/authService";
import { Button } from "@/components/ui/button";
import { LockKeyhole } from "lucide-react";
import { toast } from "sonner";

const QuizCustomizer = () => {
  const navigate = useNavigate();
  const isAuth = isAuthenticated();

  useEffect(() => {
    if (!isAuth) {
      toast.info("Please log in to create quizzes");
    }
  }, [isAuth]);

  const handleLoginClick = () => {
    // This will open the auth sheet from the Navigation component
    document.querySelector<HTMLButtonElement>('[aria-label="Login / Register"]')?.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <Navigation />
      
      <main className="py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-center">
            Customize Your Quiz
          </h1>
          <p className="text-center text-muted-foreground mb-8">
            Create personalized practice questions tailored to your learning objectives
          </p>
          
          {isAuth ? (
            <QuizGenerator />
          ) : (
            <div className="bg-white p-8 rounded-xl shadow-sm border border-border text-center">
              <LockKeyhole className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">Login Required</h2>
              <p className="mb-6 text-muted-foreground">
                You need to be logged in to create custom quizzes.
              </p>
              <Button onClick={handleLoginClick}>
                Login or Register
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default QuizCustomizer;
