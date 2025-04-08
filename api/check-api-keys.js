
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
  
  const missingKeys = [];
  
  if (!DEEPSEEK_API_KEY) {
    missingKeys.push('DEEPSEEK_API_KEY');
  }
  
  if (!BREVO_API_KEY) {
    missingKeys.push('BREVO_API_KEY');
  }
  
  // 也可以检查可选的 API 密钥
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  const optionalMissingKeys = [];
  
  if (!OPENAI_API_KEY) {
    optionalMissingKeys.push('OPENAI_API_KEY');
  }
  
  // 如果有任何必需的密钥缺失，返回错误
  if (missingKeys.length > 0) {
    return res.status(400).json({ 
      error: 'API key not configured', 
      missingKeys,
      optionalMissingKeys
    });
  }
  
  // 所有必需的密钥都已配置
  return res.status(200).json({ 
    success: true,
    optionalMissingKeys: optionalMissingKeys.length > 0 ? optionalMissingKeys : undefined
  });
}
