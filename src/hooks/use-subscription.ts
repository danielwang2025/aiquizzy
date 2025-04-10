
import { useState, useEffect } from 'react';
import { getUserSubscription, getRemainingQuestions } from '@/utils/subscriptionService';
import { UserSubscription } from '@/types/subscription';
import { useAuth } from '@/hooks/use-auth';

export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [remainingQuestions, setRemainingQuestions] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSubscriptionData() {
      setLoading(true);
      try {
        if (user?.id) {
          const userSubscription = await getUserSubscription(user.id);
          setSubscription(userSubscription);
          
          const remaining = await getRemainingQuestions(user.id);
          setRemainingQuestions(remaining);
        } else {
          setSubscription({
            tier: 'free',
            questionCount: 0,
            isActive: true
          });
          setRemainingQuestions(5); // Default for non-logged in users
        }
        setError(null);
      } catch (e) {
        console.error("Failed to load subscription data", e);
        setError("Failed to load subscription data");
      } finally {
        setLoading(false);
      }
    }

    loadSubscriptionData();
  }, [user]);

  return { subscription, remainingQuestions, loading, error };
}
