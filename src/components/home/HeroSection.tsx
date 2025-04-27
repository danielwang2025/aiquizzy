
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from 'react-i18next';

const HeroSection = () => {
  const { t } = useTranslation();
  const [topic, setTopic] = useState("");

  return (
    <section className="relative py-24 md:py-32 mb-16 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-700"></div>
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-grid-white/10"></div>
      </div>
      
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
        }}
        className="relative z-10 container mx-auto px-4"
      >
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-4 py-1.5 px-6 text-sm font-medium bg-white/20 text-white border-none">
            {t('header.aiLearning')}
          </Badge>
          
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 text-white leading-tight">
            {t('header.masterSubject')}
          </h1>
          
          <p className="text-xl md:text-2xl text-blue-100 mb-10 max-w-3xl mx-auto">
            {t('header.description')}
          </p>
          
          <div className="glass-card max-w-2xl mx-auto p-2 rounded-xl">
            <div className="flex flex-col sm:flex-row gap-3">
              <Input 
                type="text" 
                placeholder={t('header.inputPlaceholder')}
                className="bg-white/20 border-white/30 text-white placeholder:text-white/70 h-14 rounded-lg text-lg"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
              <Button 
                size="lg" 
                className="bg-white text-indigo-700 hover:bg-blue-50 hover:text-indigo-800 h-14 px-8 rounded-lg text-lg font-medium btn-3d"
                onClick={() => topic && window.location.assign(`/customize?topic=${encodeURIComponent(topic)}`)}
              >
                {t('header.startPractice')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
          
          <div className="mt-10 flex flex-wrap justify-center gap-6">
            <div className="flex items-center bg-white/10 px-4 py-2 rounded-full">
              <CheckCircle className="text-green-300 mr-2 h-5 w-5" />
              <span className="text-white">{t('features.instantGen')}</span>
            </div>
            <div className="flex items-center bg-white/10 px-4 py-2 rounded-full">
              <CheckCircle className="text-green-300 mr-2 h-5 w-5" />
              <span className="text-white">{t('features.aiExplanations')}</span>
            </div>
            <div className="flex items-center bg-white/10 px-4 py-2 rounded-full">
              <CheckCircle className="text-green-300 mr-2 h-5 w-5" />
              <span className="text-white">{t('features.personalizedLearning')}</span>
            </div>
          </div>
        </div>
      </motion.div>
      
      <div className="absolute top-1/4 -left-20 w-72 h-72 bg-blue-500 rounded-full blur-3xl opacity-20"></div>
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-indigo-600 rounded-full blur-3xl opacity-20"></div>
    </section>
  );
};

export default HeroSection;
