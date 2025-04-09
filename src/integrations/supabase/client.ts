
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// 使用固定值以确保在所有环境中连接一致
const SUPABASE_URL = "https://rdkpdfjmaigrpaiqszol.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJka3BkZmptYWlncnBhaXFzem9sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQwMTgwNDksImV4cCI6MjA1OTU5NDA0OX0.uVBunKqAhLK5GZ-ehSuC27x1NBIbm5yRvfTRKFw-Woc";

// 创建并配置Supabase客户端，确保在所有环境下正确工作
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage, // 使用localStorage存储会话
    autoRefreshToken: true, // 启用自动令牌刷新
    persistSession: true, // 保持会话持久化
    detectSessionInUrl: true, // 从URL检测会话
    flowType: 'pkce' // 使用PKCE流程，更安全且避免某些验证码问题
  },
});
