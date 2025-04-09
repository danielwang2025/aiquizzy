
import { supabase } from "@/integrations/supabase/client";
import { UserSubscription, SubscriptionTier } from "@/types/subscription";
import { toast } from "sonner";

// Default subscription limits
const LIMITS = {
  free: 50,      // 50 questions per month for free registered users
  premium: 5000, // 5000 questions per month for premium users
  unregistered: 5 // 5 questions for unregistered users (per IP/browser)
};

/**
 * Get the current user's subscription data
 */
export const getUserSubscription = async (userId?: string): Promise<UserSubscription> => {
  if (!userId) {
    // For unregistered users, check localStorage for usage
    const demoUsage = localStorage.getItem("demoQuizUsage");
    const usage = demoUsage ? JSON.parse(demoUsage) : { count: 0, timestamp: Date.now() };
    
    // Check if we need to reset (for a new day)
    const oneDayMs = 24 * 60 * 60 * 1000;
    if (Date.now() - usage.timestamp > oneDayMs) {
      localStorage.setItem("demoQuizUsage", JSON.stringify({ count: 0, timestamp: Date.now() }));
      return {
        tier: 'free',
        questionCount: 0,
        isActive: true
      };
    }
    
    return {
      tier: 'free',
      questionCount: usage.count,
      isActive: true
    };
  }

  try {
    // Using 'from' method with type assertion to address the TypeScript error
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
      // For unregistered users, check localStorage for usage
      const demoUsage = localStorage.getItem("demoQuizUsage");
      const usage = demoUsage ? JSON.parse(demoUsage) : { count: 0, timestamp: Date.now() };
      
      // Check if we need to reset (for a new day)
      const oneDayMs = 24 * 60 * 60 * 1000;
      if (Date.now() - usage.timestamp > oneDayMs) {
        return true; // Allow if it's a new day
      }
      
      return usage.count + count <= LIMITS.unregistered;
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
    // For unregistered users, update localStorage
    if (!userId) {
      const demoUsage = localStorage.getItem("demoQuizUsage");
      const usage = demoUsage ? JSON.parse(demoUsage) : { count: 0, timestamp: Date.now() };
      
      // Check if we need to reset (for a new day)
      const oneDayMs = 24 * 60 * 60 * 1000;
      if (Date.now() - usage.timestamp > oneDayMs) {
        localStorage.setItem("demoQuizUsage", JSON.stringify({ count, timestamp: Date.now() }));
      } else {
        const newCount = usage.count + count;
        localStorage.setItem("demoQuizUsage", JSON.stringify({ 
          count: newCount, 
          timestamp: usage.timestamp 
        }));
      }
      return;
    }
    
    // For registered users, update in database
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
        "Generate up to 50 questions per month",
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
        "Generate up to 5,000 questions per month",
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
      // For unregistered users, check localStorage
      const demoUsage = localStorage.getItem("demoQuizUsage");
      const usage = demoUsage ? JSON.parse(demoUsage) : { count: 0, timestamp: Date.now() };
      
      // Check if we need to reset (for a new day)
      const oneDayMs = 24 * 60 * 60 * 1000;
      if (Date.now() - usage.timestamp > oneDayMs) {
        return LIMITS.unregistered;
      }
      
      return Math.max(0, LIMITS.unregistered - usage.count);
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
 * Check if user is within their unregistered usage limit
 */
export const checkUnregisteredLimit = (): boolean => {
  const demoUsage = localStorage.getItem("demoQuizUsage");
  const usage = demoUsage ? JSON.parse(demoUsage) : { count: 0, timestamp: Date.now() };
  
  // Check if we need to reset (for a new day)
  const oneDayMs = 24 * 60 * 60 * 1000;
  if (Date.now() - usage.timestamp > oneDayMs) {
    localStorage.setItem("demoQuizUsage", JSON.stringify({ count: 0, timestamp: Date.now() }));
    return true;
  }
  
  return usage.count < LIMITS.unregistered;
};
