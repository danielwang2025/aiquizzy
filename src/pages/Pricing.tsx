
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X, Plus, Minus } from "lucide-react";
import { motion } from "framer-motion";
import { getSubscriptionPlans } from "@/utils/subscriptionService";
import { isAuthenticated } from "@/utils/authService";
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
    
    if (planId === "free-tier") {
      toast.success("You are already on the Free plan!");
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // In a real implementation, this would redirect to a Stripe checkout page
      toast.info("This would redirect to payment processing. Feature coming soon!");
      
      // For now we'll just mock the subscription process
      setTimeout(() => {
        setIsProcessing(false);
        toast.success("Subscription demo: You now have Premium access!");
      }, 1500);
    } catch (error) {
      console.error("Subscription error:", error);
      setIsProcessing(false);
      toast.error("Failed to process subscription. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-grow py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold mb-4 text-gradient-primary">Choose Your Plan</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Select the plan that best suits your quiz generation needs
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {plans.map((plan) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: plan.tier === 'premium' ? 0.2 : 0 }}
                whileHover={{ y: -5 }}
              >
                <Card className={`overflow-hidden ${plan.tier === 'premium' ? 'border-primary shadow-lg' : ''}`}>
                  {plan.tier === 'premium' && (
                    <div className="bg-primary text-white text-center py-1 text-sm font-medium">
                      RECOMMENDED
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="mt-4">
                      <span className="text-4xl font-bold">${plan.price}</span>
                      {plan.price > 0 && <span className="text-muted-foreground ml-1">/month</span>}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start">
                          <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full" 
                      variant={plan.tier === 'free' ? "outline" : "default"}
                      onClick={() => handleSubscribe(plan.id)}
                      disabled={isProcessing}
                    >
                      {plan.tier === 'free' ? 'Current Plan' : 'Subscribe'}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-16 max-w-4xl mx-auto">
            <h2 className="text-2xl font-semibold mb-6 text-center">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="bg-card border rounded-lg">
              <AccordionItem value="item-1">
                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                  How does the question limit work?
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4 text-muted-foreground">
                  Your question limit resets every month. The count is based on the number of questions you generate. Unused questions don't roll over to the next month.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                  Can I upgrade or downgrade my plan?
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4 text-muted-foreground">
                  Yes, you can change your plan at any time. Changes to your subscription will take effect at the start of your next billing cycle. There's no penalty for changing plans.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                  Is there a refund policy?
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4 text-muted-foreground">
                  We offer a 7-day money-back guarantee for all new subscriptions. If you're not satisfied with our service, please contact our support team within 7 days of your purchase for a full refund.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                  What payment methods do you accept?
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4 text-muted-foreground">
                  We accept all major credit cards, including Visa, Mastercard, and American Express. We also support PayPal for your convenience.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-5">
                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                  Is my payment information secure?
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4 text-muted-foreground">
                  Yes, all payment processing is handled by our secure payment processors. We never store your full credit card details on our servers.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Pricing;
