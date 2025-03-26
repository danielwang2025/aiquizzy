
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

const SUPABASE_URL = 'https://hkpbkyduhowjadzhgdmq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhrcGJreWR1aG93amFkemhnZG1xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Mjg5MTc2NSwiZXhwIjoyMDU4NDY3NzY1fQ.alJGJVqe-wekibYX12A0Z1dux8iKgNz0qNn-JYS6a-k';

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_KEY);
