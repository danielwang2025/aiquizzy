
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
import { getUserSubscription, getRemainingQuestions, checkUnregisteredLimit } from "@/utils/subscriptionService";
import { UserSubscription } from "@/types/subscription";

const QuizCustomizer = () => {
  const navigate = useNavigate();
  const isAuth = isAuthenticated();
  const [searchParams] = useSearchParams();
  const topicFromUrl = searchParams.get("topic") || "";
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [remainingQuestions, setRemainingQuestions] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [unregisteredLimitReached, setUnregisteredLimitReached] = useState(false);

  useEffect(() => {
    const loadSubscriptionData = async () => {
      try {
        if (isAuth) {
          const user = await getCurrentUser();
          if (user) {
            const userSubscription = await getUserSubscription(user.id);
            setSubscription(userSubscription);
            
            const remaining = await getRemainingQuestions(user.id);
            setRemainingQuestions(remaining);
          }
        } else {
          // For unregistered users
          const withinLimit = checkUnregisteredLimit();
          setUnregisteredLimitReached(!withinLimit);
          
          const remaining = await getRemainingQuestions();
          setRemainingQuestions(remaining);
          
          if (!withinLimit) {
            toast.info("您已达到访客模式的生成题目限制（5题）。请登录以获取更多功能。", {
              action: {
                label: "登录",
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
              创建测试
            </motion.span>
            <motion.h1 
              variants={itemVariants} 
              className="text-4xl md:text-5xl font-bold mb-6 tracking-tight text-gradient-primary"
            >
              自定义您的测验
            </motion.h1>
            <motion.p 
              variants={itemVariants} 
              className="text-center text-muted-foreground mb-6 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed"
            >
              输入您的学习目标，获取个性化练习题
            </motion.p>
            <motion.div
              variants={itemVariants}
              className="flex items-center justify-center gap-2 text-sm text-blue-600 mb-8"
            >
              <FileText className="h-4 w-4" />
              <span>创建并导出测验到Word文档，使用Times New Roman格式</span>
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
              className={unregisteredLimitReached ? "neo-card p-8 md:p-12 rounded-2xl shadow-lg" : ""}
            >
              {unregisteredLimitReached ? (
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
                  
                  <h2 className="text-2xl md:text-3xl font-semibold mb-6 text-center tracking-tight">访客模式已达上限</h2>
                  <p className="mb-10 text-muted-foreground text-center text-lg leading-relaxed">
                    您已使用完每日5道题的访客限额，请登录以解锁更多功能和额度
                  </p>
                  
                  <div className="grid gap-8">
                    <Button 
                      onClick={handleLoginClick} 
                      size="lg" 
                      className="w-full py-6 text-lg btn-3d font-medium shadow-button hover:shadow-button-hover bg-gradient-to-r from-blue-600 to-indigo-600"
                    >
                      登录或注册账号
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                    
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t"></span>
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-4 py-1 text-muted-foreground font-medium">或</span>
                      </div>
                    </div>
                    
                    <motion.div 
                      className="glass-card p-8 rounded-xl card-hover"
                      whileHover={{ y: -5 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <div className="flex items-start">
                        <div>
                          <h4 className="font-semibold text-lg mb-3">查看示例测验</h4>
                          <p className="mb-6 leading-relaxed">
                            您可以查看示例测验，了解我们的功能
                          </p>
                          <Button 
                            variant="outline" 
                            className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200 hover:text-amber-900 btn-scale shadow-sm"
                            onClick={handleDemoClick}
                          >
                            查看示例测验
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="mb-8">
                    <div className="p-4 bg-amber-50 rounded-lg border border-amber-200 mb-4">
                      <h3 className="font-medium mb-2">访客模式</h3>
                      <p className="text-sm text-amber-800 mb-2">您正在使用访客模式，每日可生成最多 <strong>5道题目</strong>。</p>
                      <p className="text-sm text-amber-800">剩余数量: <strong>{remainingQuestions}</strong> 题</p>
                      <div className="mt-3">
                        <Button variant="outline" size="sm" onClick={handleLoginClick} className="text-xs">
                          登录解锁更多题目
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="glass-effect rounded-2xl border border-white/20 shadow-lg overflow-hidden">
                    <QuizGenerator initialTopic={topicFromUrl} />
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default QuizCustomizer;
