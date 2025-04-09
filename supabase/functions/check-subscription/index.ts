
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@11.18.0";

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
    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization')!;
    
    // Create a Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    );
    
    // Get the current user
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      return new Response(
        JSON.stringify({ 
          error: "User not authenticated",
          subscription: {
            tier: "free",
            isActive: true,
            questionLimit: 5
          }
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    // Get user subscription from database
    const { data: subscription } = await supabaseClient
      .from("user_subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (!subscription) {
      // No subscription found, user is on free tier
      return new Response(
        JSON.stringify({
          subscription: {
            tier: "free",
            isActive: true,
            questionCount: 0,
            questionLimit: 50  // Registered users get 50
          }
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Check if subscription is active and non-expired
    let isActive = subscription.is_active;
    if (subscription.subscription_end_date) {
      const endDate = new Date(subscription.subscription_end_date);
      if (endDate < new Date()) {
        isActive = false;
      }
    }

    // Get the appropriate question limit
    const questionLimit = subscription.tier === "premium" ? 1000 : 50;

    return new Response(
      JSON.stringify({
        subscription: {
          tier: subscription.tier,
          isActive,
          questionCount: subscription.question_count,
          questionLimit,
          subscriptionEndDate: subscription.subscription_end_date
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Subscription check error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
