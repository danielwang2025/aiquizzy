
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Play, 
  Star, 
  Medal, 
  Clock, 
  BookOpen, 
  Users, 
  Lightbulb, 
  Target,
  ArrowRight,
  CheckCircle,
  ChevronRight,
  Check
} from "lucide-react";
import Navigation from "@/components/Navigation";
import { loadQuizHistory } from "@/utils/historyService";
import { motion } from "framer-motion";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QuizExampleCard } from "@/components/QuizExampleCard";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Footer from "@/components/Footer";
import { getSubscriptionPlans } from "@/utils/subscriptionService";

const Index = () => {
  const history = loadQuizHistory();
  const hasHistory = history.attempts.length > 0;
  const [topic, setTopic] = useState("");
  const plans = getSubscriptionPlans();
  
  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };
  
  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      } 
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-grow">
        {/* Hero Section - 玻璃态设计 */}
        <section className="relative py-24 md:py-32 mb-16 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-700"></div>
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-grid-white/10"></div>
          </div>
          
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="relative z-10 container mx-auto px-4"
          >
            <div className="max-w-4xl mx-auto text-center">
              <Badge className="mb-4 py-1.5 px-6 text-sm font-medium bg-white/20 text-white border-none">
                AI-Powered Learning
              </Badge>
              
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 text-white leading-tight">
                Master Any Subject with <span className="text-blue-200">AI-Generated</span> Practice Questions
              </h1>
              
              <p className="text-xl md:text-2xl text-blue-100 mb-10 max-w-3xl mx-auto">
                Enter your study topic and instantly get customized practice questions that adapt to your learning style
              </p>
              
              <div className="glass-card max-w-2xl mx-auto p-2 rounded-xl">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input 
                    type="text" 
                    placeholder="E.g., React basics, JavaScript ES6 syntax..." 
                    className="bg-white/20 border-white/30 text-white placeholder:text-white/70 h-14 rounded-lg text-lg"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                  />
                  <Button 
                    size="lg" 
                    className="bg-white text-indigo-700 hover:bg-blue-50 hover:text-indigo-800 h-14 px-8 rounded-lg text-lg font-medium btn-3d"
                    onClick={() => topic && window.location.assign(`/customize?topic=${encodeURIComponent(topic)}`)}
                  >
                    Start Practice
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>
              
              <div className="mt-10 flex flex-wrap justify-center gap-6">
                <div className="flex items-center bg-white/10 px-4 py-2 rounded-full">
                  <CheckCircle className="text-green-300 mr-2 h-5 w-5" />
                  <span className="text-white">Instant Generation</span>
                </div>
                <div className="flex items-center bg-white/10 px-4 py-2 rounded-full">
                  <CheckCircle className="text-green-300 mr-2 h-5 w-5" />
                  <span className="text-white">AI Explanations</span>
                </div>
                <div className="flex items-center bg-white/10 px-4 py-2 rounded-full">
                  <CheckCircle className="text-green-300 mr-2 h-5 w-5" />
                  <span className="text-white">Personalized Learning</span>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Decorative circles */}
          <div className="absolute top-1/4 -left-20 w-72 h-72 bg-blue-500 rounded-full blur-3xl opacity-20"></div>
          <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-indigo-600 rounded-full blur-3xl opacity-20"></div>
        </section>
        
        {/* Pricing Section - 新拟态设计 */}
        <section className="container mx-auto px-4 space-section">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <Badge className="mb-4 py-1.5 px-6 bg-blue-50 text-blue-700 border-blue-100">Pricing</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">Simple, Transparent Pricing</h2>
            <p className="text-muted-foreground text-lg">
              Choose the right plan for your learning journey
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {plans.map((plan) => (
              <motion.div 
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: plan.tier === 'premium' ? 0.2 : 0 }}
                whileHover={{ y: -5 }}
              >
                <Card className={`overflow-hidden neo-card h-full flex flex-col justify-between ${plan.tier === 'premium' ? 'gradient-border shadow-lg' : ''}`}>
                  {plan.tier === 'premium' && (
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-center py-2 text-sm font-medium">
                      RECOMMENDED
                    </div>
                  )}
                  <div className="flex flex-col flex-grow">
                    <div className="space-y-4 p-6">
                      <h3 className="text-2xl font-semibold">{plan.name}</h3>
                      <p className="text-muted-foreground">{plan.description}</p>
                      <div className="mt-4 pt-2">
                        <span className="text-4xl font-bold">${plan.price}</span>
                        {plan.price > 0 && <span className="text-muted-foreground ml-1">/month</span>}
                      </div>
                    </div>
                    <div className="p-6 pt-0 flex-grow">
                      <ul className="space-y-3">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex items-start">
                            <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                            <span className="text-muted-foreground">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="p-6 pt-4">
                      <Link to="/pricing">
                        <Button 
                          className={`w-full h-11 ${plan.tier === 'premium' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700' : ''} btn-3d`}
                          variant={plan.tier === 'premium' ? 'default' : 'outline'}
                        >
                          {plan.price === 0 ? 'Get Started' : 'Subscribe Now'}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Link to="/pricing" className="text-primary hover:underline inline-flex items-center">
              View detailed pricing information
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </section>
        
        {/* AI Question Examples - 带有卡片动画效果 */}
        <section className="py-20 bg-gradient-to-b from-white to-blue-50 dark:from-background dark:to-blue-950/10">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <Badge className="mb-4 py-1.5 px-6 bg-indigo-50 text-indigo-700 border-indigo-100">Examples</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">
                AI Question Examples
              </h2>
              <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto text-lg">
                See how our AI creates tailored practice questions based on your learning objectives
              </p>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <Carousel className="w-full">
                <CarouselContent>
                  <CarouselItem>
                    <div className="p-2">
                      <QuizExampleCard 
                        type="Multiple Choice" 
                        question="In React, which hook is used for side effects after component mounting?" 
                        options={["useState", "useEffect", "useContext", "useReducer"]} 
                        correctAnswer="useEffect"
                      />
                    </div>
                  </CarouselItem>
                  <CarouselItem>
                    <div className="p-2">
                      <QuizExampleCard 
                        type="Fill in the Blank" 
                        question="In JavaScript, the data structure used to create a collection of unique values is called a ________." 
                        answer="Set"
                      />
                    </div>
                  </CarouselItem>
                  <CarouselItem>
                    <div className="p-2">
                      <QuizExampleCard 
                        type="Multiple Choice" 
                        question="Which method prevents event bubbling in React?" 
                        options={["event.stopPropagation()", "event.preventDefault()", "event.stop()", "event.halt()"]} 
                        correctAnswer="event.stopPropagation()"
                      />
                    </div>
                  </CarouselItem>
                </CarouselContent>
                <div className="hidden md:flex">
                  <CarouselPrevious className="-left-4" />
                  <CarouselNext className="-right-4" />
                </div>
              </Carousel>
            </div>
            
            <div className="text-center mt-12">
              <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 h-14 px-8 rounded-lg text-lg font-medium btn-3d">
                <Link to="/customize">
                  Create Your Practice Quiz
                  <ChevronRight className="ml-1 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
        
        {/* Trust Indicators - 玻璃态设计 */}
        <section className="container mx-auto px-4 space-section">
          <div className="relative glass-effect rounded-2xl p-12 overflow-hidden">
            {/* 装饰性背景元素 */}
            <div className="absolute -top-12 -right-12 w-64 h-64 bg-blue-500 rounded-full blur-3xl opacity-10"></div>
            <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-indigo-500 rounded-full blur-3xl opacity-10"></div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-10 gradient-text">Why Choose Us?</h2>
            
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="grid md:grid-cols-3 gap-8 relative z-10"
            >
              <motion.div 
                variants={fadeIn}
                className="text-center"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-blue-200 to-blue-300 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg transform rotate-12">
                  <Users className="h-10 w-10 text-blue-700" />
                </div>
                <h3 className="text-xl font-semibold mb-3">10,000+ Students</h3>
                <p className="text-muted-foreground">
                  Students from around the world trust our AI learning platform to improve their study efficiency
                </p>
              </motion.div>
              
              <motion.div 
                variants={fadeIn}
                className="text-center"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-green-200 to-green-300 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg transform -rotate-6">
                  <Star className="h-10 w-10 text-green-700" />
                </div>
                <h3 className="text-xl font-semibold mb-3">98% Positive Feedback</h3>
                <p className="text-muted-foreground">
                  The vast majority of users report significant improvements in learning efficiency and comprehension
                </p>
              </motion.div>
              
              <motion.div 
                variants={fadeIn}
                className="text-center"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-amber-200 to-amber-300 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg transform rotate-6">
                  <Medal className="h-10 w-10 text-amber-700" />
                </div>
                <h3 className="text-xl font-semibold mb-3">AI-Powered Recommendations</h3>
                <p className="text-muted-foreground">
                  Our AI engine intelligently recommends personalized content based on your learning progress
                </p>
              </motion.div>
            </motion.div>
            
            <div className="mt-12 text-center relative z-10">
              <div className="inline-block gradient-bg-primary rounded-full px-8 py-4 text-white font-medium">
                Try up to 5 practice questions for free, no registration required!
              </div>
            </div>
          </div>
        </section>
        
        {/* How It Works Section - 新拟态设计 */}
        <section className="container mx-auto px-4 space-section">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <Badge className="mb-4 py-1.5 px-6 bg-purple-50 text-purple-700 border-purple-100">Process</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">How It Works</h2>
            <p className="text-muted-foreground text-lg">
              Three simple steps to supercharge your learning
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: <Star className="h-12 w-12 text-amber-500" />,
                title: "Enter Learning Goals",
                description: "Tell us what you want to learn, and our AI will generate personalized practice questions"
              },
              {
                icon: <Medal className="h-12 w-12 text-emerald-500" />,
                title: "Answer Questions",
                description: "Complete the AI-generated questions and get instant feedback and detailed explanations"
              },
              {
                icon: <Clock className="h-12 w-12 text-blue-500" />,
                title: "Track Your Progress",
                description: "View your learning data and improvement over time to identify areas for growth"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                className="neo-card p-8 text-center"
              >
                <div className="mb-6 flex justify-center">
                  <div className="w-20 h-20 rounded-2xl gradient-bg-primary flex items-center justify-center">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </section>
        
        {/* Team Section - 卡片效果和动画 */}
        <section className="py-20 bg-gradient-to-b from-white to-blue-50 dark:from-background dark:to-blue-950/10">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <Badge className="mb-4 py-1.5 px-6 bg-blue-50 text-blue-700 border-blue-100">Our Team</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">Meet the Team</h2>
              <p className="text-muted-foreground text-lg">
                The experts behind AI Quizzy's learning technology
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-x-12 gap-y-16 max-w-5xl mx-auto">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-center"
              >
                <div className="relative mb-8">
                  <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mx-auto flex items-center justify-center shadow-xl">
                    <Users className="h-16 w-16 text-white" />
                  </div>
                  <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="px-4 py-1 bg-blue-50 text-blue-700 border-blue-100">
                      Education
                    </Badge>
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-3">Education Experts</h3>
                <p className="text-muted-foreground">Our team of educators brings decades of experience in creating effective learning materials.</p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-center"
              >
                <div className="relative mb-8">
                  <div className="w-32 h-32 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full mx-auto flex items-center justify-center shadow-xl">
                    <Lightbulb className="h-16 w-16 text-white" />
                  </div>
                  <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="px-4 py-1 bg-purple-50 text-purple-700 border-purple-100">
                      Research
                    </Badge>
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-3">AI Researchers</h3>
                <p className="text-muted-foreground">Our AI specialists work to create algorithms that adapt to your learning style and needs.</p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="text-center"
              >
                <div className="relative mb-8">
                  <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full mx-auto flex items-center justify-center shadow-xl">
                    <Target className="h-16 w-16 text-white" />
                  </div>
                  <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="px-4 py-1 bg-pink-50 text-pink-700 border-pink-100">
                      Design
                    </Badge>
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-3">Product Designers</h3>
                <p className="text-muted-foreground">Our UX team ensures that learning with AI Quizzy is intuitive, engaging, and effective.</p>
              </motion.div>
            </div>
          </div>
        </section>
        
        {/* Vision and Mission Section - 玻璃态设计 */}
        <section className="container mx-auto px-4 space-section">
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="glass-effect p-8 rounded-2xl relative overflow-hidden"
            >
              <div className="absolute -top-12 -right-12 w-64 h-64 bg-blue-500 rounded-full blur-3xl opacity-10"></div>
              
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <Lightbulb className="mr-3 h-6 w-6 text-amber-500" />
                <span className="gradient-text">Our Vision</span>
              </h3>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                We envision a world where personalized learning is accessible to everyone, empowering individuals to 
                achieve their full potential through customized educational experiences.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                At AI Quizzy, we believe that the future of education lies in the perfect balance of 
                human expertise and artificial intelligence, creating learning experiences that adapt to each person's unique needs.
              </p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="glass-effect p-8 rounded-2xl relative overflow-hidden"
            >
              <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-indigo-500 rounded-full blur-3xl opacity-10"></div>
              
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <Target className="mr-3 h-6 w-6 text-blue-500" />
                <span className="gradient-text">Our Mission</span>
              </h3>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Our mission is to revolutionize learning by providing AI-powered tools that create personalized 
                quizzes and practice materials tailored to individual learning objectives.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                We are committed to developing technology that adapts to diverse learning styles, identifies knowledge 
                gaps, and offers targeted practice to maximize learning efficiency and effectiveness.
              </p>
            </motion.div>
          </div>
        </section>
        
        {hasHistory && (
          <section className="container mx-auto px-4 pb-20">
            <div className="text-center max-w-3xl mx-auto mb-10">
              <Badge className="mb-4 py-1.5 px-6 bg-green-50 text-green-700 border-green-100">Your Progress</Badge>
              <h2 className="text-3xl font-bold mb-4 gradient-text">Recent Activity</h2>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-2xl mx-auto"
            >
              <Card glass className="overflow-hidden">
                <CardHeader>
                  <CardTitle>Your Learning Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <p className="text-muted-foreground mb-2">Total Quizzes Completed</p>
                    <p className="text-4xl font-bold gradient-text">{history.attempts.length}</p>
                  </div>
                  
                  {history.attempts.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="font-medium">Latest Quiz</h4>
                      <div className="bg-secondary/30 p-6 rounded-xl">
                        <p className="font-medium">{history.attempts[0].objectives}</p>
                        <div className="flex justify-between mt-3">
                          <span className="text-sm text-muted-foreground">
                            Score: {history.attempts[0].result.score}%
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {new Date(history.attempts[0].date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="text-center mt-6">
                        <Button asChild variant="outline" className="btn-3d">
                          <Link to="/dashboard">View Full Dashboard</Link>
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </section>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
