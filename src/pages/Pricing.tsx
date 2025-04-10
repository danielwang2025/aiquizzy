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


const Pricing = () => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

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

    if (planId === "free-tier" || planId === "registered-tier") {
      toast.success(`You are already on the ${planId === "free-tier" ? "Free" : "Registered"} plan!`);






      return;
    }

    setIsProcessing(true);


    try {
      const user = await getCurrentUser();
      
      if (!user) {
        toast.error("Authentication error. Please sign in again.");
        setIsProcessing(false);
        return;
      }

      // Use a fixed price ID for the premium plan
      // In production, you would fetch this from your Stripe dashboard
      const stripePriceId = "price_premium"; // Replace with your actual Stripe price ID
      
      const checkoutUrl = await createCheckoutSession(user.id, stripePriceId);

      if (checkoutUrl) {
        // Redirect to Stripe Checkout
        window.location.href = checkoutUrl;
      } else {
        setIsProcessing(false);
        toast.error("Failed to create checkout session. Please try again.");
      }
    } catch (error) {
      console.error("Subscription error:", error);
      setIsProcessing(false);
      toast.error("Failed to process subscription. Please try again.");


    }
  };






  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-grow py-20 px-4">
        <div className="max-w-6xl mx-auto space-y-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <span className="px-4 py-1.5 text-sm font-medium bg-blue-100 text-blue-700 rounded-full inline-block mb-4">Pricing Plans</span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight text-gradient-primary">Choose Your Plan</h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Select the plan that best suits your quiz generation needs
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan) => (
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
                        disabled={isProcessing}
                      >
                        {isProcessing ? 'Processing...' : 
                          plan.id === "free-tier" ? 'Current Plan' : 
                          plan.id === "registered-tier" ? 'Registered Plan' :
                          'Subscribe'}
                      </Button>
                    </CardFooter>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="mt-24 max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <span className="px-4 py-1.5 text-sm font-medium bg-purple-100 text-purple-700 rounded-full inline-block mb-4">Questions</span>
              <h2 className="text-2xl md:text-3xl font-semibold mb-6 tracking-tight">Frequently Asked Questions</h2>
            </div>

            <div className="glass-effect rounded-2xl overflow-hidden">
              <Accordion type="single" collapsible className="border-none">
                <AccordionItem value="item-1" className="border-b border-slate-200 dark:border-slate-700">
                  <AccordionTrigger className="px-6 py-5 hover:no-underline hover:bg-secondary/50 text-lg">
                    How does the question limit work?
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-5 text-muted-foreground text-base leading-relaxed">
                    Your question limit resets every month. The count is based on the number of questions you generate. 
                    Free users can generate 5 questions per month, registered users can generate 50 questions, 
                    and premium subscribers can generate up to 1000 questions per month. Unused questions don't roll over.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2" className="border-b border-slate-200 dark:border-slate-700">
                  <AccordionTrigger className="px-6 py-5 hover:no-underline hover:bg-secondary/50 text-lg">
                    Can I upgrade or downgrade my plan?
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-5 text-muted-foreground text-base leading-relaxed">
                    Yes, you can change your plan at any time. Changes to your subscription will take effect at the start of your next billing cycle. 
                    There's no penalty for changing plans.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3" className="border-b border-slate-200 dark:border-slate-700">
                  <AccordionTrigger className="px-6 py-5 hover:no-underline hover:bg-secondary/50 text-lg">
                    Is there a refund policy?
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-5 text-muted-foreground text-base leading-relaxed">
                    We offer a 7-day money-back guarantee for all new subscriptions. If you're not satisfied with our service, 
                    please contact our support team within 7 days of your purchase for a full refund.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4" className="border-b border-slate-200 dark:border-slate-700">
                  <AccordionTrigger className="px-6 py-5 hover:no-underline hover:bg-secondary/50 text-lg">
                    What payment methods do you accept?
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-5 text-muted-foreground text-base leading-relaxed">
                    We accept all major credit cards, including Visa, Mastercard, and American Express. We also support PayPal for your convenience.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-5" className="border-b border-slate-200 dark:border-slate-700">
                  <AccordionTrigger className="px-6 py-5 hover:no-underline hover:bg-secondary/50 text-lg">
                    Is my payment information secure?
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-5 text-muted-foreground text-base leading-relaxed">
                    Yes, all payment processing is handled by Stripe, one of the most secure payment processors in the world.
                    We never store your full credit card details on our servers.
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
