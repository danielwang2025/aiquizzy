
import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import QuizGenerator from "@/components/QuizGenerator";
import { isAuthenticated, getCurrentUser } from "@/utils/authService";
import { Button } from "@/components/ui/button";
import { LockKeyhole, FileText, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import SubscriptionBanner from "@/components/SubscriptionBanner";
import { getUserSubscription, getRemainingQuestions } from "@/utils/subscriptionService";
import { UserSubscription } from "@/types/subscription";

const QuizCustomizer = () => {
  const navigate = useNavigate();
  const isAuth = isAuthenticated();
  const [searchParams] = useSearchParams();
  const topicFromUrl = searchParams.get("topic") || "";
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [remainingQuestions, setRemainingQuestions] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSubscriptionData = async () => {
      if (isAuth) {
        try {
          const user = await getCurrentUser();
          if (user) {
            const userSubscription = await getUserSubscription(user.id);
            setSubscription(userSubscription);
            
            const remaining = await getRemainingQuestions(user.id);
            setRemainingQuestions(remaining);
          }
        } catch (error) {
          console.error("Error loading subscription data:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
        toast.info("Please sign in to create personalized quizzes", {
          action: {
            label: "Sign In",
            onClick: handleLoginClick,
          },
        });
      }
    };
    
    loadSubscriptionData();
  }, [isAuth]);

  const handleLoginClick = () => {
    // This will open the auth sheet from the Navigation component
    document.querySelector<HTMLButtonElement>('[aria-label="Login / Register"]')?.click();
  };

  const handleDemoClick = () => {
    navigate("/practice/demo");
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20">
      <Navigation />
      
      <main className="py-20 px-4 md:py-24 flex-grow">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="text-center mb-16"
          >
            <motion.span 
              variants={itemVariants}
              className="px-4 py-1.5 text-sm font-medium bg-indigo-100 text-indigo-700 rounded-full inline-block mb-4"
            >
              Create Quiz
            </motion.span>
            <motion.h1 
              variants={itemVariants} 
              className="text-4xl md:text-5xl font-bold mb-6 tracking-tight text-gradient-primary"
            >
              Customize Your Quiz
            </motion.h1>
            <motion.p 
              variants={itemVariants} 
              className="text-center text-muted-foreground mb-6 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed"
            >
              Enter your learning objectives to get personalized practice questions
            </motion.p>
            <motion.div
              variants={itemVariants}
              className="flex items-center justify-center gap-2 text-sm text-blue-600 mb-8"
            >
              <FileText className="h-4 w-4" />
              <span>Create and export quizzes to Word documents with Times New Roman formatting</span>
            </motion.div>
          </motion.div>
          
          {isAuth ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {!loading && (
                <div className="mb-8">
                  <SubscriptionBanner 
                    subscription={subscription} 
                    remainingQuestions={remainingQuestions} 
                  />
                </div>
              )}
              <div className="glass-effect rounded-2xl border border-white/20 shadow-lg overflow-hidden">
                <QuizGenerator initialTopic={topicFromUrl} />
              </div>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="neo-card p-8 md:p-12 rounded-2xl shadow-lg"
            >
              <div className="max-w-md mx-auto">
                <div className="flex justify-center mb-12">
                  <motion.div 
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="w-24 h-24 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center shadow-lg"
                  >
                    <LockKeyhole className="w-12 h-12 text-white" />
                  </motion.div>
                </div>
                
                <h2 className="text-2xl md:text-3xl font-semibold mb-6 text-center tracking-tight">Sign In Required</h2>
                <p className="mb-10 text-muted-foreground text-center text-lg leading-relaxed">
                  Sign in to create custom quizzes and save your learning progress
                </p>
                
                <div className="grid gap-8">
                  <Button 
                    onClick={handleLoginClick} 
                    size="lg" 
                    className="w-full py-6 text-lg btn-3d font-medium shadow-button hover:shadow-button-hover bg-gradient-to-r from-blue-600 to-indigo-600"
                  >
                    Sign In or Register
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t"></span>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-4 py-1 text-muted-foreground font-medium">OR</span>
                    </div>
                  </div>
                  
                  <motion.div 
                    className="glass-card p-8 rounded-xl card-hover"
                    whileHover={{ y: -5 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <div className="flex items-start">
                      <div>
                        <h4 className="font-semibold text-lg mb-3">Try Without Signing Up</h4>
                        <p className="mb-6 leading-relaxed">
                          You can try our basic version and generate up to 5 questions without registration
                        </p>
                        <Button 
                          variant="outline" 
                          className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200 hover:text-amber-900 btn-scale shadow-sm"
                          onClick={handleDemoClick}
                        >
                          Try Demo Version
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default QuizCustomizer;
