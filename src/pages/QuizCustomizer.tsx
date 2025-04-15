import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { isAuthenticated, getCurrentUser } from "@/utils/authService";
import { Button } from "@/components/ui/button";
import { LockKeyhole, FileText, ArrowRight, Share2, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import SubscriptionBanner from "@/components/SubscriptionBanner";
import { getUserSubscription, getRemainingQuestions } from "@/utils/subscriptionService";
import { UserSubscription } from "@/types/subscription";
import LoadingSpinner from "@/components/LoadingSpinner";
import { getQuizById } from "@/utils/databaseService";
import QuizGenerator from "@/components/QuizGenerator";

const QuizCustomizer = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const topicFromUrl = searchParams.get("topic") || "";
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [remainingQuestions, setRemainingQuestions] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState<boolean | null>(null);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [quizId, setQuizId] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    const checkAuth = async () => {
      try {
        const authStatus = await isAuthenticated();
        
        if (!isMounted) return;
        setIsAuth(authStatus);
        
        // If authenticated, load subscription data
        if (authStatus) {
          try {
            const user = await getCurrentUser();
            if (!isMounted) return;
            
            if (user) {
              const [userSubscription, remaining] = await Promise.all([
                getUserSubscription(user.id),
                getRemainingQuestions(user.id)
              ]);
              
              if (isMounted) {
                setSubscription(userSubscription);
                setRemainingQuestions(remaining);
              }
            }
          } catch (error) {
            console.error("Error loading subscription data:", error);
            if (isMounted) {
              setLoadingError("Failed to load subscription data. Please try refreshing the page.");
            }
          }
        } else {
          // For non-authenticated users, set subscription to null
          // The SubscriptionBanner component will show demo mode
          setSubscription(null);
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
        if (isMounted) {
          setLoadingError("Authentication check failed. Please try again.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    checkAuth();
    
    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const handleLoginClick = () => {
    document.querySelector<HTMLButtonElement>('[aria-label="Login / Register"]')?.click();
  };

  const handleQuizGenerated = (generatedQuizId: string) => {
    setQuizId(generatedQuizId);
  };

  const handleShareQuiz = () => {
    if (!quizId) {
      toast.error("No quiz available to share. Please generate a quiz first.");
      return;
    }
    
    // Generate a shareable link
    const shareableLink = `${window.location.origin}/shared/${quizId}`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(shareableLink)
      .then(() => {
        setCopySuccess(true);
        toast.success("Quiz link copied! Ready to share.");
        
        // Reset copy success status after 2 seconds
        setTimeout(() => {
          setCopySuccess(false);
        }, 2000);
      })
      .catch(() => {
        toast.error("Failed to copy link to clipboard");
      });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20">
        <main className="py-20 px-4 md:py-24 flex-grow flex items-center justify-center">
          <LoadingSpinner />
        </main>
      </div>
    );
  }

  if (loadingError) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20">
        <main className="py-20 px-4 md:py-24 flex-grow flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-500 mb-4">{loadingError}</p>
            <Button onClick={() => window.location.reload()}>Refresh Page</Button>
          </div>
        </main>
      </div>
    );
  }

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

            {quizId && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-8"
              >
                <Button 
                  onClick={handleShareQuiz} 
                  className={`${copySuccess ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'} text-white flex items-center gap-2 mx-auto`}
                >
                  {copySuccess ? (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Share2 className="h-4 w-4" />
                      Share Quiz
                    </>
                  )}
                </Button>
                <p className="text-sm text-muted-foreground mt-2">
                  Share this quiz with your friends or colleagues
                </p>
              </motion.div>
            )}
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="mb-8">
              <SubscriptionBanner 
                subscription={subscription} 
                remainingQuestions={remainingQuestions} 
              />
            </div>
            <div className="glass-effect rounded-2xl border border-white/20 shadow-lg overflow-hidden">
              <QuizGenerator initialTopic={topicFromUrl} onGenerationComplete={handleQuizGenerated} />
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default QuizCustomizer;
