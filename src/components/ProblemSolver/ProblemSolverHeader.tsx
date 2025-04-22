
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
        STEM 问题解题器
      </span>
      <h1 className="text-4xl font-bold mb-4 gradient-text">
        数学与科学问题解题助手
      </h1>
      <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
        上传学科问题图片，使用先进的OCR技术和AI获取逐步解题过程
      </p>
    </motion.div>
  );
};

export default ProblemSolverHeader;
