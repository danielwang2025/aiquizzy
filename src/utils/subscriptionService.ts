
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
      tier: data?.tier as SubscriptionTier || 'free',
      questionCount: data?.question_count || 0,
      isActive: data?.is_active || true,
      subscriptionEndDate: data?.subscription_end_date,
      stripeCustomerId: data?.stripe_customer_id,
      stripeSubscriptionId: data?.stripe_subscription_id,
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
    // First get current count
    const { data: userData, error: fetchError } = await supabase
      .from('user_subscriptions')
      .select('question_count')
      .eq('user_id', userId)
      .single();
    
    if (fetchError) {
      console.error("Error fetching question count:", fetchError);
      toast.error("无法更新问题使用量");
      return;
    }
    
    const currentCount = userData?.question_count || 0;
    
    // Update count
    const { error: updateError } = await supabase
      .from('user_subscriptions')
      .update({ 
        question_count: currentCount + count,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);
    
    if (updateError) {
      console.error("Error incrementing question count:", updateError);
      toast.error("无法更新问题使用量");
    } else {
      console.log(`Incremented question count for user ${userId} by ${count}`);
    }
  } catch (error) {
    console.error("Error incrementing question count:", error);
    toast.error("无法更新问题使用量");
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
      name: "免费版",
      description: "适合休闲用户的基本访问权限",
      price: 0,
      features: [
        "每月生成最多5个问题",
        "基本题型",
        "访问复习中心"
      ],
      questionLimit: LIMITS.free,
      tier: 'free' as SubscriptionTier
    },
    {
      id: "registered-tier",
      name: "注册用户",
      description: "注册用户的标准访问权限",
      price: 0,
      features: [
        "每月生成最多50个问题",
        "所有题型",
        "保存问题历史"
      ],
      questionLimit: LIMITS.registered,
      tier: 'free' as SubscriptionTier
    },
    {
      id: "premium-tier",
      name: "高级会员",
      description: "专业人士和教育工作者的完整访问权限",
      price: 9.99,
      features: [
        "每月生成最多1,000个问题",
        "所有题型",
        "高级布鲁姆分类学目标设置",
        "优先支持",
        "导出到Word并自定义格式"
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
      body: { 
        priceId,
        userId // Pass the userId to be stored in customer metadata
      }
    });
    
    if (error) {
      throw error;
    }
    
    return data.url;
  } catch (error) {
    console.error("Checkout error:", error);
    toast.error("创建结账会话失败");
    return null;
  }
};
