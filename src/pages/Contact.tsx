
import React from "react";
import Navigation from "@/components/Navigation";
import ContactUs from "@/components/ContactUs";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";

const Contact = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20">
      <Navigation />
      <main className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <span className="px-4 py-1.5 text-sm font-medium bg-blue-100 text-blue-700 rounded-full inline-block mb-4">Get In Touch</span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight gradient-text">Contact Us</h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Have a question or feedback? We'd love to hear from you.
            </p>
          </motion.div>
          
          <div className="glass-effect rounded-2xl overflow-hidden border border-white/20 shadow-lg">
            <ContactUs />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
