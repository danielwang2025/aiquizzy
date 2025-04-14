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
  if (!subscription) return null;
  const isPremium = subscription.tier === 'premium';
  return;
};
export default SubscriptionBanner;