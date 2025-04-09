
export type SubscriptionTier = 'free' | 'premium';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  questionLimit: number;
  tier: SubscriptionTier;
}

export interface UserSubscription {
  tier: SubscriptionTier;
  questionCount: number;
  subscriptionEndDate?: string;
  isActive: boolean;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}
