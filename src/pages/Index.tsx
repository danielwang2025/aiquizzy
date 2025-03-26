import React, { useState, useEffect } from "react";
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
  ChevronRight
} from "lucide-react";
import Navigation from "@/components/Navigation";
import { loadQuizHistory } from "@/utils/historyService";
import { motion } from "framer-motion";
import { QuizHistory } from "@/types/quiz";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { QuizExampleCard } from "@/components/QuizExampleCard";
import { Input } from "@/components/ui/input";

const Index = () => {
  const [topic, setTopic] = useState("");
  const [history, setHistory] = useState<QuizHistory>({ attempts: [], reviewList: [], disputedQuestions: [] });
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const quizHistory = await loadQuizHistory();
        setHistory(quizHistory);
      } catch (error) {
        console.error("Error loading quiz history:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHistory();
  }, []);
  
  const hasHistory = history.attempts.length > 0;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <Navigation />
      
      <main className="py-8 px-4 max-w-screen-xl mx-auto">
        {/* Hero Section */}
        <section className="relative py-16 mb-12 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute left-0 top-0 w-full h-full bg-grid-white/10"></div>
          </div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 max-w-4xl mx-auto text-center px-4"
          >
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
              AI-Powered Practice Questions for Effective Learning
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8">
              Enter your study subject and instantly get customized practice questions
            </p>
            
            <div className="max-w-xl mx-auto flex flex-col sm:flex-row gap-3">
              <Input 
                type="text" 
                placeholder="E.g., React basics, JavaScript ES6 syntax..." 
                className="bg-white/20 border-white/30 text-white placeholder:text-white/70 h-12"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
              <Button 
                size="lg" 
                className="bg-white text-blue-700 hover:bg-blue-50 hover:text-blue-800 h-12"
                onClick={() => topic && window.location.assign(`/customize?topic=${encodeURIComponent(topic)}`)}
              >
                Start Practice
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
            
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <div className="flex items-center">
                <CheckCircle className="text-green-300 mr-2 h-5 w-5" />
                <span>Instant Question Generation</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="text-green-300 mr-2 h-5 w-5" />
                <span>AI-Powered Explanations</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="text-green-300 mr-2 h-5 w-5" />
                <span>Personalized Learning Path</span>
              </div>
            </div>
          </motion.div>
        </section>
        
        {/* AI Question Examples Carousel */}
        <section className="mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-6">
            AI Question Examples
          </h2>
          <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
            See how our AI creates tailored practice questions based on your learning objectives
          </p>
          
          <div className="max-w-4xl mx-auto px-4">
            <Carousel className="w-full">
              <CarouselContent>
                <CarouselItem>
                  <QuizExampleCard 
                    type="Multiple Choice" 
                    question="In React, which hook is used for side effects after component mounting?" 
                    options={["useState", "useEffect", "useContext", "useReducer"]} 
                    correctAnswer="useEffect"
                  />
                </CarouselItem>
                <CarouselItem>
                  <QuizExampleCard 
                    type="Fill in the Blank" 
                    question="In JavaScript, the data structure used to create a collection of unique values is called a ________." 
                    answer="Set"
                  />
                </CarouselItem>
                <CarouselItem>
                  <QuizExampleCard 
                    type="Multiple Choice" 
                    question="Which method prevents event bubbling in React?" 
                    options={["event.stopPropagation()", "event.preventDefault()", "event.stop()", "event.halt()"]} 
                    correctAnswer="event.stopPropagation()"
                  />
                </CarouselItem>
              </CarouselContent>
              <div className="hidden md:flex">
                <CarouselPrevious className="-left-4" />
                <CarouselNext className="-right-4" />
              </div>
            </Carousel>
          </div>
          
          <div className="text-center mt-8">
            <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
              <Link to="/customize">
                Create Your Practice Quiz
                <ChevronRight className="ml-1 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>
        
        {/* Trust Indicators */}
        <section className="mb-16 bg-white rounded-xl p-8 border border-border">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Why Choose Us?</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">10,000+ Students</h3>
              <p className="text-muted-foreground">
                Students from around the world trust our AI learning platform to improve their study efficiency
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">98% Positive Feedback</h3>
              <p className="text-muted-foreground">
                The vast majority of users report significant improvements in learning efficiency and comprehension
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Medal className="h-8 w-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">AI-Powered Recommendations</h3>
              <p className="text-muted-foreground">
                Our AI engine intelligently recommends personalized content based on your learning progress
              </p>
            </div>
          </div>
          
          <div className="mt-10 text-center">
            <div className="inline-block bg-blue-50 rounded-full px-6 py-3 text-blue-800 font-medium">
              Try up to 5 practice questions for free, no registration required!
            </div>
          </div>
        </section>
        
        {/* How It Works Section */}
        <section className="mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-6">
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
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                className="bg-white p-6 rounded-lg shadow-sm border border-border text-center"
              >
                <div className="mb-4 flex justify-center">{feature.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </section>
        
        {/* Team Section */}
        <section className="mb-12 bg-white rounded-xl p-8 border border-border">
          <h2 className="text-2xl font-bold text-center mb-2">Our Team</h2>
          <p className="text-center text-muted-foreground mb-8">Meet the people behind AI Quizzy</p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-center"
            >
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Users className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Education Experts</h3>
              <p className="text-muted-foreground">Our team of educators brings decades of experience in creating effective learning materials.</p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-center"
            >
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Lightbulb className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">AI Researchers</h3>
              <p className="text-muted-foreground">Our AI specialists work to create algorithms that adapt to your learning style and needs.</p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-center"
            >
              <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Target className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Product Designers</h3>
              <p className="text-muted-foreground">Our UX team ensures that learning with AI Quizzy is intuitive, engaging, and effective.</p>
            </motion.div>
          </div>
        </section>
        
        {/* Vision and Mission Section */}
        <section className="mb-12">
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white p-6 rounded-lg shadow-sm border border-border"
            >
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <Lightbulb className="mr-2 h-6 w-6 text-amber-500" />
                Our Vision
              </h3>
              <p className="text-muted-foreground mb-4">
                We envision a world where personalized learning is accessible to everyone, empowering individuals to 
                achieve their full potential through customized educational experiences.
              </p>
              <p className="text-muted-foreground">
                At AI Quizzy, we believe that the future of education lies in the perfect balance of 
                human expertise and artificial intelligence, creating learning experiences that adapt to each person's unique needs.
              </p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white p-6 rounded-lg shadow-sm border border-border"
            >
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <Target className="mr-2 h-6 w-6 text-blue-500" />
                Our Mission
              </h3>
              <p className="text-muted-foreground mb-4">
                Our mission is to revolutionize learning by providing AI-powered tools that create personalized 
                quizzes and practice materials tailored to individual learning objectives.
              </p>
              <p className="text-muted-foreground">
                We are committed to developing technology that adapts to diverse learning styles, identifies knowledge 
                gaps, and offers targeted practice to maximize learning efficiency and effectiveness.
              </p>
            </motion.div>
          </div>
        </section>
        
        {hasHistory && !loading && (
          <section>
            <h2 className="text-2xl font-bold text-center mb-8">Recent Activity</h2>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-border max-w-2xl mx-auto">
              <h3 className="text-lg font-semibold mb-4">Your Learning Progress</h3>
              <div className="mb-4">
                <p className="text-muted-foreground mb-2">Total Quizzes Completed</p>
                <p className="text-3xl font-bold">{history.attempts.length}</p>
              </div>
              
              {history.attempts.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-medium">Latest Quiz</h4>
                  <div className="bg-secondary/30 p-4 rounded-lg">
                    <p className="font-medium">{history.attempts[0].objectives}</p>
                    <div className="flex justify-between mt-2">
                      <span className="text-sm text-muted-foreground">
                        Score: {history.attempts[0].result.score}%
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(history.attempts[0].date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="text-center mt-4">
                    <Button asChild variant="outline">
                      <Link to="/dashboard">View Full Dashboard</Link>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default Index;

