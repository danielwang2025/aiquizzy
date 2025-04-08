
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Crown } from "lucide-react";
import { UserSubscription } from "@/types/subscription";

interface SubscriptionBannerProps {
  subscription: UserSubscription | null;
  remainingQuestions: number;
}

const SubscriptionBanner: React.FC<SubscriptionBannerProps> = ({ 
  subscription, 
  remainingQuestions 
}) => {
  if (!subscription) return null;
  
  const isPremium = subscription.tier === 'premium';
  
  return (
    <div className={`p-4 rounded-lg mb-6 ${isPremium ? 'bg-amber-50 border border-amber-200' : 'bg-blue-50 border border-blue-200'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {isPremium ? (
            <Crown className="h-5 w-5 text-amber-600 mr-2" />
          ) : null}
          <div>
            <h3 className={`font-medium ${isPremium ? 'text-amber-800' : 'text-blue-800'}`}>
              {isPremium ? 'Premium Plan' : 'Free Plan'}
            </h3>
            <p className={`text-sm ${isPremium ? 'text-amber-700' : 'text-blue-700'}`}>
              {remainingQuestions} questions remaining this month
            </p>
          </div>
        </div>
        
        {!isPremium && (
          <Link to="/pricing">
            <Button variant="outline" size="sm" className="bg-white hover:bg-amber-50 border-amber-200 text-amber-800">
              <Crown className="h-4 w-4 mr-1" />
              Upgrade
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default SubscriptionBanner;
