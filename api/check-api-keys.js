
// Vercel Serverless Function to check if API keys are configured
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle OPTIONS requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Check if required API keys are set
  const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
  const BREVO_API_KEY = process.env.BREVO_API_KEY;
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  
  // Check for required keys
  const requiredKeys = ['DEEPSEEK_API_KEY', 'BREVO_API_KEY'];
  const optionalKeys = ['OPENAI_API_KEY'];
  
  const missingRequiredKeys = requiredKeys.filter(key => !process.env[key]);
  const optionalMissingKeys = optionalKeys.filter(key => !process.env[key]);
  
  if (missingRequiredKeys.length > 0) {
    return res.status(400).json({ 
      success: false,
      missingKeys: missingRequiredKeys,
      optionalMissingKeys: optionalMissingKeys
    });
  }
  
  return res.status(200).json({ 
    success: true,
    apiKeysStatus: {
      DEEPSEEK_API_KEY: !!DEEPSEEK_API_KEY,
      BREVO_API_KEY: !!BREVO_API_KEY,
      OPENAI_API_KEY: !!OPENAI_API_KEY
    },
    optionalMissingKeys: optionalMissingKeys
  });
}
