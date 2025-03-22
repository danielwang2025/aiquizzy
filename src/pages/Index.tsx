
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Play, Star, Medal, Clock, BookOpen, Brain, Target, Users, Heart } from "lucide-react";
import Navigation from "@/components/Navigation";
import { loadQuizHistory } from "@/utils/historyService";
import { motion } from "framer-motion";

const Index = () => {
  const history = loadQuizHistory();
  const hasHistory = history.attempts.length > 0;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <Navigation />
      
      <main className="py-8 px-4 max-w-screen-xl mx-auto">
        <section className="mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              Personalized Learning with AI Quizzy
            </h1>
            <p className="text-xl text-slate-700 mb-8">
              Generate custom quizzes powered by AI tailored to your specific learning objectives.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                <Link to="/customize">
                  <Play className="mr-2 h-5 w-5" />
                  Create Custom Quiz
                </Link>
              </Button>
              {hasHistory && (
                <Button asChild variant="outline" size="lg">
                  <Link to="/review">
                    <BookOpen className="mr-2 h-5 w-5" />
                    Review Past Quizzes
                  </Link>
                </Button>
              )}
            </div>
          </motion.div>
        </section>
        
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-center mb-8">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <Brain className="h-12 w-12 text-amber-500" />,
                title: "AI-Generated Questions",
                description: "Input your learning objectives and get custom questions tailored to your needs."
              },
              {
                icon: <Medal className="h-12 w-12 text-emerald-500" />,
                title: "Instant Feedback",
                description: "Get immediate feedback on your answers with detailed explanations."
              },
              {
                icon: <Clock className="h-12 w-12 text-blue-500" />,
                title: "Progress Tracking",
                description: "Track your progress over time and identify areas for improvement."
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
        
        {hasHistory && (
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
        
        {/* Our Team & Mission Section */}
        <section className="mt-16 mb-12">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-4">Our Team & Mission</h2>
              <div className="h-1 w-20 bg-gradient-to-r from-blue-500 to-indigo-500 mx-auto mb-6"></div>
              <p className="text-lg text-slate-700 max-w-3xl mx-auto">
                We're passionate educators and technologists dedicated to revolutionizing how people learn through AI-powered personalized education.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-white p-6 rounded-lg shadow border border-border text-center"
              >
                <Target className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Our Vision</h3>
                <p className="text-slate-600">
                  To create a world where quality education is personalized and accessible to everyone, everywhere.
                </p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white p-6 rounded-lg shadow border border-border text-center"
              >
                <Users className="h-12 w-12 text-indigo-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Our Team</h3>
                <p className="text-slate-600">
                  A diverse group of educators, AI specialists, and software engineers committed to transforming learning experiences.
                </p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-white p-6 rounded-lg shadow border border-border text-center"
              >
                <Heart className="h-12 w-12 text-rose-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Our Values</h3>
                <p className="text-slate-600">
                  We believe in learning that adapts to you, not the other way around. Education should be engaging, effective, and enjoyable.
                </p>
              </motion.div>
            </div>
            
            <div className="bg-gradient-to-r from-blue-100 to-indigo-100 p-8 rounded-xl border border-blue-200">
              <h3 className="text-2xl font-bold mb-4 text-center">Our Mission</h3>
              <p className="text-lg text-center">
                To harness the power of artificial intelligence to create personalized learning experiences that adapt to each learner's needs, goals, and learning style.
              </p>
              <div className="mt-6 text-center">
                <Link to="/customize" className="inline-flex items-center text-blue-600 font-medium hover:text-blue-800 transition-colors">
                  Start Your Learning Journey
                  <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
