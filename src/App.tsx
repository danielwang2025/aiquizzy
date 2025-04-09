
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
import Pricing from "./pages/Pricing";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import ApiKeyNotice from "./components/ApiKeyNotice";
import PaymentSuccess from "./pages/PaymentSuccess";
import ResetPassword from "./pages/ResetPassword";
import { useEffect } from "react";
import { supabase } from "./integrations/supabase/client";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

const App = () => {
  // 添加调试日志，帮助识别连接问题
  useEffect(() => {
    const checkSupabaseConnection = async () => {
      try {
        // 简单测试Supabase连接
        const { error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
        if (error) {
          console.error('Supabase连接错误:', error.message);
        } else {
          console.log('Supabase连接成功');
        }
      } catch (err) {
        console.error('Supabase连接异常:', err);
      }
    };
    
    checkSupabaseConnection();
  }, []);

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <ApiKeyNotice />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/customize" element={<QuizCustomizer />} />
            <Route path="/practice/:quizId?" element={<Practice />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/review" element={<ReviewHub />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

export default App;
