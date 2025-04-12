
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Crown } from "lucide-react";
import { UserSubscription } from "@/types/subscription";
import { useIsMobile } from "@/hooks/use-mobile";

interface SubscriptionBannerProps {
  subscription: UserSubscription | null;
}

const SubscriptionBanner: React.FC<SubscriptionBannerProps> = ({ 
  subscription
}) => {
  const isMobile = useIsMobile();
  
  if (!subscription) return null;
  
  const isPremium = subscription.tier === 'premium';
  
  return (
    <div className={`p-4 rounded-lg mb-6 ${isPremium ? 'bg-amber-50 border border-amber-200' : 'bg-blue-50 border border-blue-200'}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
        <div className="flex items-center">
          {isPremium ? (
            <Crown className="h-5 w-5 text-amber-600 mr-2" />
          ) : null}
          <div>
            <h3 className={`font-medium ${isPremium ? 'text-amber-800' : 'text-blue-800'}`}>
              {isPremium ? 'Premium Plan' : 'Free Plan'}
            </h3>
          </div>
        </div>
        
        {!isPremium && !isMobile && (
          <Link to="/pricing">
            <Button variant="outline" size="sm" className="bg-white hover:bg-amber-50 border-amber-200 text-amber-800">
              <Crown className="h-4 w-4 mr-1" />
              Upgrade
            </Button>
          </Link>
        )}
      </div>
      
      {!isPremium && isMobile && (
        <div className="mt-3 flex justify-end">
          <Link to="/pricing">
            <Button variant="outline" size="sm" className="bg-white hover:bg-amber-50 border-amber-200 text-amber-800 w-full">
              <Crown className="h-4 w-4 mr-1" />
              Upgrade to Premium
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default SubscriptionBanner;
