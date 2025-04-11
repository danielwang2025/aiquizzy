import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// 环境变量验证 (构建时检查)
const assertConfig = () => {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    if (typeof window === 'undefined') {
      // 服务端错误日志
      console.error(`
        [SERVER] Supabase 配置缺失:
        URL: ${SUPABASE_URL ? '✅' : '❌'}
        KEY: ${SUPABASE_KEY ? '✅' : '❌'}
        ${process.env.VERCEL ? '检测到 Vercel 环境，请检查项目设置 -> Environment Variables' : '请检查 .env 文件'}
      `);
    }
    throw new Error('Supabase 配置不完整');
  }
};

// 生产环境专用配置
const getClientConfig = () => {
  const isBrowser = typeof window !== 'undefined';

  return {
    auth: {
      persistSession: isBrowser, // 仅浏览器端持久化会话
      autoRefreshToken: isBrowser,
      detectSessionInUrl: isBrowser,
      flowType: 'pkce' as const // 推荐的生产环境认证方式
    },
    global: {
      headers: {
        'x-application-name': 'my-vercel-app',
        'x-vercel-region': process.env.VERCEL_REGION || 'local'
      }
    }
  };
};

// 立即执行配置验证
assertConfig();

// 初始化客户端 (单例模式)
export const supabase = createClient<Database>(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!,
  getClientConfig()
);

// 开发环境类型安全提示
if (process.env.NODE_ENV === 'development') {
  console.warn(
    '开发模式已启用，如需模拟数据请手动实现服务层 Mock\n' +
    '推荐使用 MSW (Mock Service Worker) 而不是直接修改客户端'
  );
}
