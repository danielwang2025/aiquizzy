
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Check, Crown, Loader2 } from "lucide-react";
import { getSubscriptionPlans, createCheckoutSession, getUserSubscription } from "@/utils/subscriptionService";
import { useNavigate } from "react-router-dom";
import { isAuthenticated } from "@/utils/authService";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { UserSubscription } from "@/types/subscription";

const Pricing = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null);
  const navigate = useNavigate();
  
  // Get subscription plans
  const plans = getSubscriptionPlans();
  
  useEffect(() => {
    const fetchUserSubscription = async () => {
      if (isAuthenticated()) {
        try {
          const session = await supabase.auth.getSession();
          if (session.data.session?.user) {
            const subscription = await getUserSubscription(session.data.session.user.id);
            setCurrentSubscription(subscription);
          }
        } catch (error) {
          console.error("Error fetching user subscription:", error);
        }
      }
    };
    
    fetchUserSubscription();
  }, []);
  
  const handleSubscribe = async (planId: string, priceId: string) => {
    if (!isAuthenticated()) {
      toast.error("请先登录");
      navigate("/");
      return;
    }
    
    setProcessingPlanId(planId);
    setIsLoading(true);
    
    try {
      const session = await supabase.auth.getSession();
      if (!session.data.session?.user) {
        toast.error("未找到用户会话");
        return;
      }
      
      const userId = session.data.session.user.id;
      const checkoutUrl = await createCheckoutSession(userId, priceId);
      
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        toast.error("创建结账会话失败");
      }
    } catch (error) {
      console.error("Subscription error:", error);
      toast.error("订阅处理时出错");
    } finally {
      setIsLoading(false);
      setProcessingPlanId(null);
    }
  };
  
  const isCurrentPlan = (planTier: string): boolean => {
    if (!currentSubscription) return false;
    return currentSubscription.tier === planTier as 'premium' | 'free';
  };

  return (
    <div className="container max-w-6xl py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-2">选择适合您的计划</h1>
        <p className="text-muted-foreground">
          根据您的需求选择合适的套餐，获取更多题目生成额度
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => {
          const isCurrent = isCurrentPlan(plan.tier);
          
          return (
            <div 
              key={plan.id}
              className={`rounded-xl border bg-card p-6 shadow-sm transition-all ${
                plan.tier === 'premium' 
                  ? 'border-amber-200 shadow-amber-100' 
                  : 'hover:border-primary/20 hover:shadow-md'
              }`}
            >
              {plan.tier === 'premium' && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center">
                  <Crown className="h-3 w-3 mr-1" /> 推荐
                </div>
              )}
              
              <div className="mb-4">
                <h2 className="text-xl font-semibold">{plan.name}</h2>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>
              
              <div className="mb-6">
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold">¥{plan.price}</span>
                  {plan.price > 0 && <span className="text-sm text-muted-foreground ml-1">/ 月</span>}
                </div>
              </div>
              
              <div className="space-y-2 mb-6">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-primary flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
              
              <Button
                onClick={() => handleSubscribe(plan.id, plan.tier === 'premium' ? 'price_1OP4etKfkkTK3nF4QH29LwXp' : '')}
                className="w-full"
                disabled={isLoading || isCurrent || (plan.tier !== 'premium')}
                variant={plan.tier === 'premium' ? 'default' : 'outline'}
              >
                {isLoading && processingPlanId === plan.id ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    处理中...
                  </>
                ) : isCurrent ? (
                  '当前方案'
                ) : plan.tier === 'premium' ? (
                  '订阅'
                ) : (
                  '免费'
                )}
              </Button>
            </div>
          );
        })}
      </div>
      
      <div className="mt-12 text-center">
        <h3 className="text-xl font-semibold mb-4">常见问题</h3>
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="bg-secondary/50 p-4 rounded-lg text-left">
            <h4 className="font-medium mb-1">我可以随时取消订阅吗？</h4>
            <p className="text-sm text-muted-foreground">是的，您可以随时取消订阅。取消后，您可以继续使用当前订阅周期内的服务，直到订阅到期。</p>
          </div>
          <div className="bg-secondary/50 p-4 rounded-lg text-left">
            <h4 className="font-medium mb-1">如何更改我的订阅？</h4>
            <p className="text-sm text-muted-foreground">您可以在个人资料页面管理您的订阅。如果您想升级或降级，系统将自动计算剩余时间的价格差异。</p>
          </div>
          <div className="bg-secondary/50 p-4 rounded-lg text-left">
            <h4 className="font-medium mb-1">题目生成额度会重置吗？</h4>
            <p className="text-sm text-muted-foreground">是的，每个月的额度会在您的订阅日期自动重置。例如，如果您在5月10日订阅，那么每个月的10日额度都会重置。</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
