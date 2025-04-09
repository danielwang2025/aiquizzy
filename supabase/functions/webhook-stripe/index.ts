
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@11.18.0";

// Set verifyJWT to false in config.toml for this function since Stripe will call it directly
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client - no auth needed for webhook
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2022-11-15",
    });

    // Get the signature from the headers
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      return new Response(
        JSON.stringify({ error: "No signature" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const body = await req.text();
    const endpointSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    let event;

    // Verify the signature
    try {
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret || "");
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return new Response(
        JSON.stringify({ error: `Webhook signature verification failed: ${err.message}` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object;
        
        // Get customer details
        const customer = await stripe.customers.retrieve(subscription.customer as string);
        const userId = customer.metadata.user_id;
        
        if (!userId) {
          console.error("No user ID found in customer metadata");
          break;
        }

        // Check the subscription status
        const isActive = subscription.status === "active" || subscription.status === "trialing";
        const currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString();
        
        // Update the subscription in the database
        await supabaseClient.from("user_subscriptions").update({
          tier: isActive ? "premium" : "free",
          is_active: isActive,
          stripe_subscription_id: subscription.id,
          subscription_end_date: currentPeriodEnd,
        }).eq("user_id", userId);
        
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        
        // Get customer details
        const customer = await stripe.customers.retrieve(subscription.customer as string);
        const userId = customer.metadata.user_id;
        
        if (!userId) {
          console.error("No user ID found in customer metadata");
          break;
        }
        
        // Downgrade the user to free
        await supabaseClient.from("user_subscriptions").update({
          tier: "free",
          is_active: false,
          subscription_end_date: new Date().toISOString(),
        }).eq("stripe_subscription_id", subscription.id);
        
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), { 
      headers: { ...corsHeaders, "Content-Type": "application/json" }, 
      status: 200 
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
