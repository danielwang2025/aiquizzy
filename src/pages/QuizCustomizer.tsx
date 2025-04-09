
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
import { 
  getUserSubscription, 
  getRemainingQuestions,
  getUnregisteredQuestionCount,
  canGenerateQuestions 
} from "@/utils/subscriptionService";
import { UserSubscription } from "@/types/subscription";

const QuizCustomizer = () => {
  const navigate = useNavigate();
  const [isAuth, setIsAuth] = useState<boolean>(false);
  const [searchParams] = useSearchParams();
  const topicFromUrl = searchParams.get("topic") || "";
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [remainingQuestions, setRemainingQuestions] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const loadSubscriptionData = async () => {
      try {
        const authStatus = await isAuthenticated();
        setIsAuth(authStatus);
        
        if (authStatus) {
          const user = await getCurrentUser();
          setCurrentUser(user);
          
          if (user) {
            const userSubscription = await getUserSubscription(user.id);
            setSubscription(userSubscription);
            
            const remaining = await getRemainingQuestions(user.id);
            setRemainingQuestions(remaining);
          }
        } else {
          // For unregistered users
          const unregisteredCount = getUnregisteredQuestionCount();
          const remaining = 5 - unregisteredCount;
          
          setSubscription({
            tier: 'free',
            questionCount: unregisteredCount,
            isActive: true
          });
          
          setRemainingQuestions(remaining);
          
          if (remaining <= 0) {
            toast.info("You've reached the question limit for unregistered users", {
              action: {
                label: "Sign In",
                onClick: handleLoginClick,
              },
            });
          }
        }
      } catch (error) {
        console.error("Error loading subscription data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadSubscriptionData();
  }, []);

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

  // Show appropriate banner for unregistered users as well
  const renderBanner = () => {
    if (loading) return null;
    
    if (isAuth) {
      return (
        <SubscriptionBanner 
          subscription={subscription} 
          remainingQuestions={remainingQuestions} 
        />
      );
    } else {
      return (
        <div className="p-4 rounded-lg mb-6 bg-blue-50 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-blue-800">
                Unregistered User
              </h3>
              <p className="text-sm text-blue-700">
                {remainingQuestions} of 5 questions remaining
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-white hover:bg-amber-50 border-amber-200 text-amber-800"
              onClick={handleLoginClick}
            >
              Sign In for More
            </Button>
          </div>
        </div>
      );
    }
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
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {!loading && renderBanner()}
            
            <div className="glass-effect rounded-2xl border border-white/20 shadow-lg overflow-hidden">
              <QuizGenerator 
                initialTopic={topicFromUrl} 
                isAuthenticated={isAuth}
                userId={currentUser?.id}
              />
            </div>
            
            {!isAuth && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mt-8 p-5 neo-card rounded-xl"
              >
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-2">Get More Questions</h3>
                  <p className="mb-4 text-muted-foreground">
                    Sign up for a free account to generate up to 50 questions per month
                  </p>
                  <Button onClick={handleLoginClick}>
                    Sign Up Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default QuizCustomizer;
