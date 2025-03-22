
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Play, Star, Medal, Clock, BookOpen, Users, Lightbulb, Target } from "lucide-react";
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
              Personalized Learning Journey
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
                icon: <Star className="h-12 w-12 text-amber-500" />,
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
      </main>
    </div>
  );
};

export default Index;
