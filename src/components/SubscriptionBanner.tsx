
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Crown, HelpCircle } from "lucide-react";
import { UserSubscription } from "@/types/subscription";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface SubscriptionBannerProps {
  subscription: UserSubscription | null;
  remainingQuestions: number;
}

const SubscriptionBanner: React.FC<SubscriptionBannerProps> = ({ 
  subscription, 
  remainingQuestions 
}) => {
  const isMobile = useIsMobile();
  
  if (!subscription) return null;
  
  const isPremium = subscription.tier === 'premium';
  const limit = isPremium ? 1000 : subscription ? 50 : 5;
  const usedQuestions = limit - remainingQuestions;
  const usagePercentage = (usedQuestions / limit) * 100;
  
  return (
    <div className={`p-4 rounded-lg mb-6 ${isPremium ? 'bg-amber-50 border border-amber-200' : 'bg-blue-50 border border-blue-200'}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
        <div className="flex items-center">
          {isPremium ? (
            <Crown className="h-5 w-5 text-amber-600 mr-2" />
          ) : null}
          <div>
            <h3 className={`font-medium ${isPremium ? 'text-amber-800' : 'text-blue-800'}`}>
              {isPremium ? '高级会员' : '免费账户'}
            </h3>
          </div>
        </div>
        
        {!isPremium && !isMobile && (
          <Link to="/pricing">
            <Button variant="outline" size="sm" className="bg-white hover:bg-amber-50 border-amber-200 text-amber-800">
              <Crown className="h-4 w-4 mr-1" />
              升级会员
            </Button>
          </Link>
        )}
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <span className={`text-sm ${isPremium ? 'text-amber-700' : 'text-blue-700'}`}>
              题目生成额度:
            </span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <HelpCircle className="h-3.5 w-3.5 ml-1 opacity-70" />
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="w-[200px] text-xs">
                    每次生成问题时，您的额度将会减少。
                    {isPremium ? " 高级用户每月可生成1,000个问题。" : " 免费用户每月可生成50个问题。"}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <span className={`font-medium text-sm ${isPremium ? 'text-amber-800' : 'text-blue-800'}`}>
            {remainingQuestions} / {limit}
          </span>
        </div>
        
        <Progress 
          value={usagePercentage} 
          className={cn(
            "h-1.5",
            isPremium ? "bg-amber-100" : "bg-blue-100"
          )}
        />
        
        {!isPremium && isMobile && (
          <div className="mt-3 flex justify-end">
            <Link to="/pricing">
              <Button variant="outline" size="sm" className="bg-white hover:bg-amber-50 border-amber-200 text-amber-800 w-full">
                <Crown className="h-4 w-4 mr-1" />
                升级高级会员
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionBanner;
