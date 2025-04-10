
// src/pages/Pricing.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { motion } from "framer-motion";
import { getSubscriptionPlans, createCheckoutSession } from "@/utils/subscriptionService";
import { isAuthenticated, getCurrentUser } from "@/utils/authService";
import { toast } from "sonner";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { STRIPE_PRICE_IDS } from "@/config/constants";

const Pricing = () => {
  const navigate = useNavigate();
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  const plans = getSubscriptionPlans();
  const isAuth = isAuthenticated();

  const handleSubscribe = async (planId: string) => {
    if (!isAuth) {
      toast.info("Please sign in to subscribe", {
        action: {
          label: "Sign In",
          onClick: () => {
            document.querySelector<HTMLButtonElement>('[aria-label="Login / Register"]')?.click();
          },
        },
      });
      return;
    }

    // Fix the type comparison error by using strict equality operator
    if (planId === "free-tier" || planId === "registered-tier") {
      toast.success(`You are already on the ${planId === "free-tier" ? "Free" : "Registered"} plan!`);
      return;
    }

    setProcessingPlan(planId);

    try {
      const user = await getCurrentUser();

      if (!user) throw new Error("User not found");

      const stripePriceId = STRIPE_PRICE_IDS.PREMIUM;

      const checkoutUrl = await createCheckoutSession(user.id, stripePriceId);

      if (!checkoutUrl) throw new Error("Checkout URL not returned");

      window.location.href = checkoutUrl;
    } catch (error) {
      console.error("Subscription error:", error);
      toast.error("Failed to process subscription. Please try again.");
    } finally {
      setProcessingPlan(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-grow py-20 px-4">
        <div className="max-w-6xl mx-auto space-y-24">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <span className="px-4 py-1.5 text-sm font-medium bg-blue-100 text-blue-700 rounded-full inline-block mb-4">
              Pricing Plans
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight text-gradient-primary">
              Choose Your Plan
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Select the plan that best suits your quiz generation needs
            </p>
          </motion.div>

          {/* Plan Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan) => {
              const isLoading = processingPlan === plan.id;
              const isCurrent = plan.id === "free-tier" || plan.id === "registered-tier";

              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: plan.tier === 'premium' ? 0.2 : 0 }}
                  whileHover={{ y: -5 }}
                >
                  <Card className={`overflow-hidden neo-card h-full flex flex-col justify-between ${plan.tier === 'premium' ? 'gradient-border shadow-lg' : ''}`}>
                    {plan.tier === 'premium' && (
                      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-center py-2 text-sm font-medium">
                        RECOMMENDED
                      </div>
                    )}
                    <div className="flex flex-col flex-grow">
                      <CardHeader className="space-y-4 pb-8">
                        <CardTitle className="text-2xl md:text-3xl">{plan.name}</CardTitle>
                        <CardDescription className="text-base opacity-90">{plan.description}</CardDescription>
                        <div className="mt-4 pt-2">
                          <span className="text-4xl md:text-5xl font-bold">${plan.price}</span>
                          {plan.price > 0 && <span className="text-muted-foreground ml-2">/month</span>}
                        </div>
                      </CardHeader>
                      <CardContent className="flex-grow">
                        <ul className="space-y-4">
                          {plan.features.map((feature, i) => (
                            <li key={i} className="flex items-start">
                              <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 shrink-0" />
                              <span className="opacity-90">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                      <CardFooter className="pt-8">
                        <Button
                          className={`w-full py-6 text-base font-medium btn-3d ${plan.tier === 'premium' ? 'bg-gradient-primary' : ''}`}
                          variant={plan.tier === 'free' ? "outline" : "default"}
                          onClick={() => handleSubscribe(plan.id)}
                          disabled={isLoading}
                        >
                          {isLoading
                            ? 'Processing...'
                            : isCurrent
                              ? 'Current Plan'
                              : 'Subscribe'}
                        </Button>
                      </CardFooter>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* FAQ Section */}
          <div className="mt-24 max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <span className="px-4 py-1.5 text-sm font-medium bg-purple-100 text-purple-700 rounded-full inline-block mb-4">Questions</span>
              <h2 className="text-2xl md:text-3xl font-semibold mb-6 tracking-tight">Frequently Asked Questions</h2>
            </div>

            <div className="glass-effect rounded-2xl overflow-hidden">
              <Accordion type="single" collapsible className="border-none">
                <AccordionItem value="item-1">
                  <AccordionTrigger className="px-6 py-4 text-lg">How does the subscription work?</AccordionTrigger>
                  <AccordionContent className="px-6 pb-4">
                    Our subscription is billed monthly. You can cancel anytime and your subscription will remain active until the end of the current billing period.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger className="px-6 py-4 text-lg">Can I upgrade or downgrade my plan?</AccordionTrigger>
                  <AccordionContent className="px-6 pb-4">
                    Yes, you can upgrade or downgrade your plan at any time. If you upgrade, the change takes effect immediately. If you downgrade, the change takes effect at the end of your current billing cycle.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger className="px-6 py-4 text-lg">How are question credits calculated?</AccordionTrigger>
                  <AccordionContent className="px-6 pb-4">
                    Each time you generate a quiz, the number of questions in that quiz counts against your monthly question credit limit. Credits reset on your billing date each month.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Pricing;
