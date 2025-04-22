
import React from 'react';
import { motion } from 'framer-motion';

const ProblemSolverHeader: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center mb-10"
    >
      <span className="px-4 py-1.5 text-sm font-medium bg-blue-100 text-blue-700 rounded-full inline-block mb-4">
        STEM Problem Solver
      </span>
      <h1 className="text-4xl font-bold mb-4 gradient-text">
        Math & Science Problem Solver
      </h1>
      <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
        Upload an image of your STEM problem and get step-by-step solutions using our advanced OCR technology
      </p>
    </motion.div>
  );
};

export default ProblemSolverHeader;
