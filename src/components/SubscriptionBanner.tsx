
import React from "react";
import { Link } from "react-router-dom";
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
            You're using AI Quizzy in demo mode (limited to 5 quizzes). Sign in for unlimited access.
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
  
  // For logged in users, show their subscription status
  const isPremium = subscription.tier === 'premium';
  
  return (
    <div className={`w-full mb-6 p-4 rounded-lg ${isPremium ? 'bg-gradient-to-r from-amber-500/80 to-orange-600/80' : 'bg-gradient-to-r from-blue-500/80 to-indigo-600/80'} text-white shadow-md`}>
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center">
          <Crown className="h-5 w-5 mr-2" />
          <span className="font-medium">{isPremium ? 'Premium Account' : 'Free Account'}</span>
        </div>
        
        {isPremium ? (
          <div className="text-sm">
            Enjoy unlimited access to all premium features
          </div>
        ) : (
          <div className="text-sm">
            {typeof remainingQuestions === 'number' ? (
              <span>{remainingQuestions} {remainingQuestions === 1 ? 'quiz' : 'quizzes'} remaining today</span>
            ) : (
              <span>Limited access to quiz generation</span>
            )}
          </div>
        )}
        
        {!isPremium && (
          <Button 
            variant="secondary" 
            size={isMobile ? "sm" : "default"} 
            asChild 
            className="whitespace-nowrap"
          >
            <Link to="/pricing">Upgrade to Premium</Link>
          </Button>
        )}
      </div>
    </div>
  );
};

export default SubscriptionBanner;
