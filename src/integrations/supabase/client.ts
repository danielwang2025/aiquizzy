// This file is kept as a placeholder but with minimal functionality
// All authentication functionality has been removed
import { createClient } from '@supabase/supabase-js';

// Empty client that won't connect to any real Supabase instance
export const supabase = createClient('', '', {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
