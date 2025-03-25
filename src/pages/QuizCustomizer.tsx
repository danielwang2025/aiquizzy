
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import QuizGenerator from "@/components/QuizGenerator";
import { isAuthenticated } from "@/utils/authService";
import { Button } from "@/components/ui/button";
import { LockKeyhole, Lightbulb, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import EnvConfig from "@/components/EnvConfig";
import { hasAllRequiredEnvVars } from "@/utils/envConfig";

const QuizCustomizer = () => {
  const navigate = useNavigate();
  const isAuth = isAuthenticated();
  const [searchParams] = useSearchParams();
  const topicFromUrl = searchParams.get("topic") || "";
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    // Check if all required environment variables are set
    if (!hasAllRequiredEnvVars()) {
      toast.warning("请配置必要的API密钥以使用完整功能", {
        action: {
          label: "立即配置",
          onClick: () => {
            document.querySelector<HTMLButtonElement>('[title="配置环境变量"]')?.click();
          }
        },
        duration: 5000,
      });
    }

    if (!isAuth) {
      toast.info("请登录以创建个性化的测验", {
        action: {
          label: "登录",
          onClick: handleLoginClick,
        },
      });
    }
  }, [isAuth]);

  const handleLoginClick = () => {
    // This will open the auth sheet from the Navigation component
    document.querySelector<HTMLButtonElement>('[aria-label="Login / Register"]')?.click();
  };

  const handleDemoClick = () => {
    setIsDemo(true);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <Navigation />
      
      <main className="py-8 px-4 md:py-12">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-2xl font-bold"
            >
              学习助手
            </motion.h1>
            <EnvConfig />
          </div>
          
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="text-center mb-10"
          >
            <motion.h1 
              variants={itemVariants} 
              className="text-3xl md:text-4xl font-bold mb-3 text-gradient-primary"
            >
              定制你的测验
            </motion.h1>
            <motion.p 
              variants={itemVariants} 
              className="text-center text-muted-foreground mb-8 text-lg max-w-xl mx-auto"
            >
              输入你的学习目标，获取个性化的练习题
            </motion.p>
          </motion.div>
          
          {isAuth || isDemo ? (
            <QuizGenerator initialTopic={topicFromUrl} isDemoMode={isDemo} />
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white p-8 rounded-xl shadow-sm border border-border"
            >
              <div className="max-w-md mx-auto">
                <div className="flex justify-center mb-8">
                  <motion.div 
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center"
                  >
                    <LockKeyhole className="w-10 h-10 text-blue-600" />
                  </motion.div>
                </div>
                
                <h2 className="text-2xl font-semibold mb-4 text-center">需要登录</h2>
                <p className="mb-8 text-muted-foreground text-center text-lg leading-relaxed">
                  登录以创建自定义测验并保存你的学习进度
                </p>
                
                <div className="grid gap-6">
                  <Button 
                    onClick={handleLoginClick} 
                    size="lg" 
                    className="w-full py-6 text-lg btn-scale font-medium shadow-button hover:shadow-button-hover"
                  >
                    登录或注册
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t"></span>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-4 py-1 text-muted-foreground font-medium">或者</span>
                    </div>
                  </div>
                  
                  <motion.div 
                    className="bg-amber-50 p-5 rounded-lg border border-amber-200 card-hover"
                    whileHover={{ y: -5 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <div className="flex items-start">
                      <Lightbulb className="w-6 h-6 text-amber-600 mr-3 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-amber-800 mb-2 text-lg">无需登录也能尝试</h4>
                        <p className="text-amber-700 mb-4 leading-relaxed">
                          你可以尝试我们的基础版本，无需注册即可生成多达 5 个问题
                        </p>
                        <Button 
                          variant="outline" 
                          className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200 hover:text-amber-900 btn-scale shadow-sm"
                          onClick={handleDemoClick}
                        >
                          尝试演示版本
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
    </div>
  );
};

export default QuizCustomizer;
