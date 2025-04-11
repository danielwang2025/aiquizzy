
// Vercel Serverless Function to check if API keys are configured
export default async function handler(req, res) {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // 处理 OPTIONS 请求
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 检查必需的 API 密钥是否设置
  const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
  const BREVO_API_KEY = process.env.BREVO_API_KEY;
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  
  return res.status(200).json({ 
    success: true,
    apiKeysStatus: {
      DEEPSEEK_API_KEY: !!DEEPSEEK_API_KEY,
      BREVO_API_KEY: !!BREVO_API_KEY,
      OPENAI_API_KEY: !!OPENAI_API_KEY
    }
  });
}
