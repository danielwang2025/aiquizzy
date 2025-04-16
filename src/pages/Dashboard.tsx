
import React from "react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20">
      <Navigation />
      <main className="py-20 px-4 flex-grow flex items-center justify-center">
        <div className="max-w-xl w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <span className="px-4 py-1.5 text-sm font-medium bg-blue-100 text-blue-700 rounded-full inline-block mb-4">Dashboard</span>
            <h1 className="text-4xl font-bold mb-6 tracking-tight gradient-text">Personal Dashboard</h1>
          </motion.div>
          
          <Card className="p-8 text-center border-dashed bg-white/70 backdrop-blur-md shadow-lg">
            <Lock className="h-16 w-16 mx-auto mb-6 text-muted-foreground opacity-70" />
            <h2 className="text-2xl font-semibold mb-4">Feature Temporarily Unavailable</h2>
            <p className="text-muted-foreground mb-6">
              The dashboard functionality is currently disabled. 
              Please check back later for updates.
            </p>
            <Button 
              onClick={() => navigate("/customize")}
              className="bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-700 hover:to-indigo-600"
            >
              Back to Quiz Customizer
            </Button>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
