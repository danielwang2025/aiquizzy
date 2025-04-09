
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { record } = await req.json();

    if (!record?.id) {
      return new Response(
        JSON.stringify({ error: "Invalid request payload" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get user metadata
    const { data: userData, error: userError } = await supabase.auth.admin
      .getUserById(record.id);

    if (userError) {
      console.error("Error fetching user data:", userError);
      throw userError;
    }

    // Create or update user profile
    const { error: profileError } = await supabase
      .from("profiles")
      .upsert({
        id: record.id,
        email: userData.user.email,
        display_name: userData.user.user_metadata.display_name || userData.user.email?.split("@")[0] || "用户",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (profileError) {
      console.error("Error creating user profile:", profileError);
      throw profileError;
    }

    // Create default subscription
    const { error: subscriptionError } = await supabase
      .from("user_subscriptions")
      .upsert({
        user_id: record.id,
        tier: "free",
        question_count: 0,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (subscriptionError) {
      console.error("Error creating user subscription:", subscriptionError);
      throw subscriptionError;
    }

    console.log("User registration successfully processed:", record.id);

    return new Response(
      JSON.stringify({ success: true, userId: record.id }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error processing user registration:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
