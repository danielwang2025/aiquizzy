
import React from "react";
import { Button } from "@/components/ui/button";
import { Crown } from "lucide-react";
import { UserSubscription } from "@/types/subscription";
import { useIsMobile } from "@/hooks/use-mobile";

interface SubscriptionBannerProps {
  subscription: UserSubscription | null;
  remainingQuestions?: number;
}

const SubscriptionBanner: React.FC<SubscriptionBannerProps> = ({
  subscription,
  remainingQuestions
}) => {
  const isMobile = useIsMobile();
  
  // If no subscription data is provided, show a demo mode banner
  if (!subscription) {
    return (
      <div className="w-full mb-6 p-4 rounded-lg bg-gradient-to-r from-blue-500/80 to-indigo-600/80 text-white shadow-md">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center">
            <Crown className="h-5 w-5 mr-2" />
            <span className="font-medium">Demo Mode</span>
          </div>
          <div className="text-sm text-white/90">
            You're using AI Quizzy in demo mode. Sign in for full access to all features.
          </div>
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={() => document.querySelector<HTMLButtonElement>('[aria-label="Login / Register"]')?.click()}
            className="whitespace-nowrap"
          >
            Sign In
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full mb-6 p-4 rounded-lg bg-gradient-to-r from-blue-500/80 to-indigo-600/80 text-white shadow-md">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center">
          <Crown className="h-5 w-5 mr-2" />
          <span className="font-medium">AI Quizzy</span>
        </div>
        
        <div className="text-sm">
          {typeof remainingQuestions === 'number' ? (
            <span>Welcome back! Enjoy unlimited access to AI Quizzy.</span>
          ) : (
            <span>Welcome back! Enjoy unlimited access to AI Quizzy.</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionBanner;
