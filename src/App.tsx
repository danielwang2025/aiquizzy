
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import QuizCustomizer from "./pages/QuizCustomizer";
import Practice from "./pages/Practice";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import ReviewHub from "./pages/ReviewHub";
import Contact from "./pages/Contact";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import ApiKeyNotice from "./components/ApiKeyNotice";
import PaymentSuccess from "./pages/PaymentSuccess";
import Layout from "./components/Layout";
import SharedQuiz from "./pages/SharedQuiz";
import ProblemSolver from "./pages/ProblemSolver";
import { useEffect } from "react";

// Hidden features flag - only UI elements are hidden, routes remain accessible
const HIDE_FEATURES = true;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

const App = () => {
  // Add viewport meta tag dynamically for mobile devices
  useEffect(() => {
    const viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) {
      const meta = document.createElement('meta');
      meta.name = 'viewport';
      meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
      document.head.appendChild(meta);
    }
    
    // Add a comment to the console to indicate hidden features
    if (HIDE_FEATURES) {
      console.info("Note: Review and Dashboard features are hidden in the UI but their routes remain accessible with disabled functionality.");
    }

    // Add a notice about the OCR Solver feature
    console.info("OCR Solver is available at /problem-solver - Upload an image of a math problem to get step-by-step solutions");
  }, []);

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <ApiKeyNotice />
          <Routes>
            <Route path="/" element={<Layout><Index /></Layout>} />
            <Route path="/customize" element={<Layout><QuizCustomizer /></Layout>} />
            <Route path="/practice/:quizId?" element={<Layout><Practice /></Layout>} />
            <Route path="/shared/:quizId" element={<Layout><SharedQuiz /></Layout>} />
            <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
            <Route path="/profile" element={<Layout><Profile /></Layout>} />
            <Route path="/review" element={<Layout><ReviewHub /></Layout>} />
            <Route path="/problem-solver" element={<Layout><ProblemSolver /></Layout>} />
            <Route path="/contact" element={<Layout><Contact /></Layout>} />
            <Route path="/terms" element={<Layout><Terms /></Layout>} />
            <Route path="/privacy" element={<Layout><Privacy /></Layout>} />
            <Route path="/payment-success" element={<Layout><PaymentSuccess /></Layout>} />
            <Route path="*" element={<Layout><NotFound /></Layout>} />
          </Routes>
        </TooltipProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

export default App;
