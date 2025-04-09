
import { supabase } from "@/integrations/supabase/client";
import { UserSubscription, SubscriptionTier } from "@/types/subscription";
import { toast } from "sonner";

// Default subscription limits
const LIMITS = {
  unregistered: 5,
  free: 50,
  premium: 5000
};

// Local storage key for unregistered users
const UNREGISTERED_COUNT_KEY = 'unregistered_question_count';

/**
 * Get the current user's subscription data
 */
export const getUserSubscription = async (userId?: string): Promise<UserSubscription> => {
  if (!userId) {
    // For unregistered users, track usage in localStorage
    const questionCount = getUnregisteredQuestionCount();
    return {
      tier: 'free',
      questionCount,
      isActive: true
    };
  }

  try {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      // If no subscription record exists, return free tier
      return {
        tier: 'free',
        questionCount: 0,
        isActive: true
      };
    }

    return {
      tier: data.tier as SubscriptionTier,
      questionCount: data.question_count,
      subscriptionEndDate: data.subscription_end_date,
      isActive: data.is_active
    };
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return {
      tier: 'free',
      questionCount: 0,
      isActive: true
    };
  }
};

/**
 * Check if user can generate more questions
 */
export const canGenerateQuestions = async (userId?: string, count = 1): Promise<boolean> => {
  try {
    if (!userId) {
      // For unregistered users, check localStorage limit
      const currentCount = getUnregisteredQuestionCount();
      return currentCount + count <= LIMITS.unregistered;
    }
    
    const subscription = await getUserSubscription(userId);
    const limit = subscription.tier === 'premium' ? LIMITS.premium : LIMITS.free;
    
    return subscription.questionCount + count <= limit;
  } catch (error) {
    console.error("Error checking question limit:", error);
    return false;
  }
};

/**
 * Increment the user's question count
 */
export const incrementQuestionCount = async (userId?: string, count: number = 1): Promise<void> => {
  try {
    if (!userId) {
      // For unregistered users, update localStorage
      const currentCount = getUnregisteredQuestionCount();
      localStorage.setItem(UNREGISTERED_COUNT_KEY, String(currentCount + count));
      return;
    }

    // First check if subscription record exists
    const { data } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (!data) {
      // Create new subscription record if it doesn't exist
      await supabase
        .from('user_subscriptions')
        .insert({
          user_id: userId,
          tier: 'free',
          question_count: count,
          is_active: true
        } as any); // Using type assertion to bypass TypeScript error
    } else {
      // Update existing record
      await supabase
        .from('user_subscriptions')
        .update({
          question_count: data.question_count + count
        } as any) // Using type assertion to bypass TypeScript error
        .eq('user_id', userId);
    }
  } catch (error) {
    console.error("Error incrementing question count:", error);
    toast.error("Failed to update question usage");
  }
};

/**
 * Reset the user's question count (typically at renewal)
 */
export const resetQuestionCount = async (userId: string): Promise<void> => {
  try {
    await supabase
      .from('user_subscriptions')
      .update({ question_count: 0 } as any) // Using type assertion to bypass TypeScript error
      .eq('user_id', userId);
  } catch (error) {
    console.error("Error resetting question count:", error);
  }
};

/**
 * Get subscription plans
 */
export const getSubscriptionPlans = () => {
  return [
    {
      id: "free-tier",
      name: "Free",
      description: "Basic access for casual users",
      price: 0,
      features: [
        `Generate up to ${LIMITS.free} questions per month`,
        "Basic question types",
        "Access to review hub"
      ],
      questionLimit: LIMITS.free,
      tier: 'free' as SubscriptionTier
    },
    {
      id: "premium-tier",
      name: "Premium",
      description: "Full access for professionals and educators",
      price: 10,
      features: [
        `Generate up to ${LIMITS.premium} questions per month`,
        "All question types",
        "Advanced Bloom's taxonomy targeting",
        "Priority support",
        "Export to Word with custom formatting"
      ],
      questionLimit: LIMITS.premium,
      tier: 'premium' as SubscriptionTier
    }
  ];
};

/**
 * Get remaining questions for the user
 */
export const getRemainingQuestions = async (userId?: string): Promise<number> => {
  try {
    if (!userId) {
      // For unregistered users, check localStorage limit
      const currentCount = getUnregisteredQuestionCount();
      return LIMITS.unregistered - currentCount;
    }
    
    const subscription = await getUserSubscription(userId);
    const limit = subscription.tier === 'premium' ? LIMITS.premium : LIMITS.free;
    
    return Math.max(0, limit - subscription.questionCount);
  } catch (error) {
    console.error("Error calculating remaining questions:", error);
    return 0;
  }
};

/**
 * Get unregistered user question count from localStorage
 */
export const getUnregisteredQuestionCount = (): number => {
  const count = localStorage.getItem(UNREGISTERED_COUNT_KEY);
  return count ? parseInt(count, 10) : 0;
};

/**
 * Reset unregistered user question count (for testing)
 */
export const resetUnregisteredQuestionCount = (): void => {
  localStorage.removeItem(UNREGISTERED_COUNT_KEY);
};
