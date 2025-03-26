
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
import ApiKeysManager from "./components/ApiKeysManager";
import { AuthProvider } from "./contexts/AuthContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <div className="fixed top-4 right-4 z-50">
          <ApiKeysManager />
        </div>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/customize" element={<QuizCustomizer />} />
            <Route path="/practice/:quizId?" element={<Practice />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/review" element={<ReviewHub />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
