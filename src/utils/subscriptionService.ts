
import { toast } from "sonner";
import { UserSubscription, SubscriptionTier } from "@/types/subscription";
import { supabase } from "@/integrations/supabase/client";

// Default subscription limits
const LIMITS = {
  free: 5,        // Free (unregistered) users: 5 questions/month
  registered: 50, // Registered users: 50 questions/month
  premium: 1000   // Premium users: 1000 questions/month
};

/**
 * Get the current user's subscription data
 */
export const getUserSubscription = async (userId?: string): Promise<UserSubscription> => {
  if (!userId) {
    return {
      tier: 'free',
      questionCount: 0,
      isActive: true
    };
  }

  try {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      console.error("Error fetching subscription:", error);
      return {
        tier: 'free',
        questionCount: 0,
        isActive: true
      };
    }
    
    return {
      tier: data.tier as SubscriptionTier,
      questionCount: data.question_count,
      isActive: data.is_active,
      subscriptionEndDate: data.subscription_end_date,
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
  if (!userId) return count <= LIMITS.free; // For non-logged in users, limit to free tier
  
  try {
    const subscription = await getUserSubscription(userId);
    let limit;
    
    if (subscription.tier === 'premium') {
      limit = LIMITS.premium;
    } else {
      limit = LIMITS.registered; // Registered users
    }
    
    return subscription.questionCount + count <= limit;
  } catch (error) {
    console.error("Error checking question limit:", error);
    return false;
  }
};

/**
 * Increment the user's question count
 */
export const incrementQuestionCount = async (userId: string, count: number): Promise<void> => {
  try {
    const { data: userData } = await supabase
      .from('user_subscriptions')
      .select('question_count')
      .eq('user_id', userId)
      .single();
    
    const currentCount = userData?.question_count || 0;
    
    const { error } = await supabase
      .from('user_subscriptions')
      .update({ 
        question_count: currentCount + count,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);
    
    if (error) {
      console.error("Error incrementing question count:", error);
      toast.error("Failed to update question usage");
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
    const { error } = await supabase
      .from('user_subscriptions')
      .update({ 
        question_count: 0,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);
    
    if (error) {
      console.error("Error resetting question count:", error);
    }
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
        "Generate up to 5 questions per month",
        "Basic question types",
        "Access to review hub"
      ],
      questionLimit: LIMITS.free,
      tier: 'free' as SubscriptionTier
    },
    {
      id: "registered-tier",
      name: "Registered",
      description: "Standard access for registered users",
      price: 0,
      features: [
        "Generate up to 50 questions per month",
        "All question types",
        "Save question history"
      ],
      questionLimit: LIMITS.registered,
      tier: 'free' as SubscriptionTier
    },
    {
      id: "premium-tier",
      name: "Premium",
      description: "Full access for professionals and educators",
      price: 9.99,
      features: [
        "Generate up to 1,000 questions per month",
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
  if (!userId) return LIMITS.free; // For non-logged in users
  
  try {
    const subscription = await getUserSubscription(userId);
    let limit;
    
    if (subscription.tier === 'premium') {
      limit = LIMITS.premium;
    } else {
      limit = LIMITS.registered;
    }
    
    return Math.max(0, limit - subscription.questionCount);
  } catch (error) {
    console.error("Error calculating remaining questions:", error);
    return 0;
  }
};

/**
 * Create a Stripe checkout session for subscription
 */
export const createCheckoutSession = async (userId: string, priceId: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase.functions.invoke('create-checkout', {
      body: { priceId }
    });
    
    if (error) {
      throw error;
    }
    
    return data.url;
  } catch (error) {
    console.error("Checkout error:", error);
    toast.error("Failed to create checkout session");
    return null;
  }
};
