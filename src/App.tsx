
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
import { useEffect, useState } from "react";
import { supabase } from "./integrations/supabase/client";
import { toast } from "sonner";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

const App = () => {
  const [connectionStatus, setConnectionStatus] = useState<"checking" | "connected" | "error">("checking");
  
  // 添加更强大的连接检测逻辑
  useEffect(() => {
    const checkSupabaseConnection = async () => {
      try {
        console.log("开始测试Supabase连接...");
        setConnectionStatus("checking");
        
        // 尝试获取会话而不是检查profiles表，避免权限问题
        const { data, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Supabase会话检查错误:', sessionError.message);
          setConnectionStatus("error");
          toast.error("无法连接到Supabase服务");
          return;
        }
        
        console.log('Supabase连接成功!', data ? "有会话" : "无会话");
        setConnectionStatus("connected");
      } catch (err) {
        console.error('Supabase连接异常:', err);
        setConnectionStatus("error");
        toast.error("连接到Supabase服务时发生异常");
      }
    };
    
    checkSupabaseConnection();
    
    // 设置连接状态监听器
    const channel = supabase.channel('system');
    channel
      .on('presence', { event: 'sync' }, () => {
        console.log('Supabase realtime连接已同步');
      })
      .on('presence', { event: 'join' }, () => {
        console.log('已加入Supabase realtime连接');
        setConnectionStatus("connected");
      })
      .on('presence', { event: 'leave' }, () => {
        console.log('已离开Supabase realtime连接');
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('已订阅Supabase realtime通道');
        }
      });
    
    return () => {
      channel.unsubscribe();
    };
  }, []);

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <ApiKeyNotice />
          {connectionStatus === "error" && (
            <div className="fixed top-0 left-0 right-0 bg-red-500 text-white p-2 text-center z-50">
              无法连接到Supabase服务，部分功能可能受限
            </div>
          )}
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
