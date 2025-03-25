import { Database } from "@/integrations/supabase/types";
import { User as SupabaseUser } from "@supabase/supabase-js";

// Custom User type that extends the Supabase User
export interface User extends SupabaseUser {
  displayName?: string;
  avatarUrl?: string;
  createdAt: string; // Add this to match with quiz User type
}

// Profile type from the profiles table
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

// Auth state interface
export interface AuthState {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  error: string | null;
}
