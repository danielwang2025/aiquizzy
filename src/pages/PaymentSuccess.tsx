
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Auto-redirect after countdown
    const timer = setTimeout(() => {
      navigate("/customize");
    }, countdown * 1000);

    const countdownInterval = setInterval(() => {
      setCountdown(prev => prev - 1);
    }, 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(countdownInterval);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-grow py-20 px-4 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full glass-effect rounded-2xl p-8 text-center space-y-6"
        >
          <div className="flex justify-center">
            <motion.div 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ 
                type: "spring", 
                stiffness: 200, 
                damping: 10,
                delay: 0.2 
              }}
              className="bg-green-100 rounded-full p-4 inline-flex"
            >
              <CheckCircle className="h-16 w-16 text-green-600" />
            </motion.div>
          </div>
          
          <h1 className="text-3xl font-bold">Payment Successful!</h1>
          
          <p className="text-muted-foreground">
            Thank you for upgrading to Premium! Your account has been successfully upgraded, and you can now enjoy all premium features including generating up to 1,000 questions per month.
          </p>

          <div className="pt-4">
            <Button 
              onClick={() => navigate("/customize")}
              size="lg"
              className="w-full bg-gradient-primary"
            >
              Start Creating Questions ({countdown})
            </Button>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default PaymentSuccess;
