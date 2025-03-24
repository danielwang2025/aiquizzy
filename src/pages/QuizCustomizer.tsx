
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import QuizGenerator from "@/components/QuizGenerator";
import { isAuthenticated } from "@/utils/authService";
import { Button } from "@/components/ui/button";
import { LockKeyhole, Lightbulb } from "lucide-react";
import { toast } from "sonner";

const QuizCustomizer = () => {
  const navigate = useNavigate();
  const isAuth = isAuthenticated();
  const [searchParams] = useSearchParams();
  const topicFromUrl = searchParams.get("topic") || "";

  useEffect(() => {
    if (!isAuth) {
      toast.info("Please sign in to create personalized quizzes", {
        action: {
          label: "Sign In",
          onClick: handleLoginClick,
        },
      });
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
          <h1 className="text-3xl font-bold mb-3 text-center">
            Customize Your Quiz
          </h1>
          <p className="text-center text-muted-foreground mb-8">
            Enter your learning objectives to get personalized practice questions
          </p>
          
          {isAuth ? (
            <QuizGenerator initialTopic={topicFromUrl} />
          ) : (
            <div className="bg-white p-8 rounded-xl shadow-sm border border-border">
              <div className="max-w-md mx-auto">
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                    <LockKeyhole className="w-10 h-10 text-blue-600" />
                  </div>
                </div>
                
                <h2 className="text-xl font-semibold mb-4 text-center">Sign In Required</h2>
                <p className="mb-6 text-muted-foreground text-center">
                  Sign in to create custom quizzes and save your learning progress
                </p>
                
                <div className="grid gap-6">
                  <Button onClick={handleLoginClick} size="lg" className="w-full">
                    Sign In or Register
                  </Button>
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t"></span>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-muted-foreground">OR</span>
                    </div>
                  </div>
                  
                  <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                    <div className="flex items-start">
                      <Lightbulb className="w-5 h-5 text-amber-600 mr-2 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-amber-800 mb-1">Try Without Signing Up</h4>
                        <p className="text-sm text-amber-700">
                          You can try our basic version and generate up to 5 questions without registration
                        </p>
                        <Button 
                          variant="outline" 
                          className="mt-3 bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200 hover:text-amber-900"
                          onClick={() => navigate("/practice/demo")}
                        >
                          Try Demo Version
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default QuizCustomizer;
