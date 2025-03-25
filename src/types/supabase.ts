
// Custom types for Supabase tables
// These complement the auto-generated types without modifying them

export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

// Type for authenticated user with profile
export interface UserWithProfile {
  id: string;
  email: string | undefined;
  profile: Profile | null;
}
