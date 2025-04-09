
// Vercel Serverless Function for sending contact messages
export default async function handler(req, res) {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // 处理 OPTIONS 请求
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 确保请求方法为 POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, subject, message } = req.body;
    
    // 从 Vercel 环境变量中获取 API 密钥
    const BREVO_API_KEY = process.env.BREVO_API_KEY;
    
    if (!BREVO_API_KEY) {
      return res.status(500).json({ error: 'API key not configured in environment variables' });
    }

    // 简单内容审核
    if (containsHarmfulContent(message)) {
      return res.status(400).json({ error: "Your message contains potentially harmful content and cannot be sent." });
    }
    
    // 创建邮件内容
    const emailContent = {
      sender: {
        name,
        email
      },
      to: [{
        email: "dickbussiness@163.com",
        name: "Website Contact"
      }],
      subject,
      htmlContent: `
        <html>
          <body>
            <h2>New Contact Form Submission</h2>
            <p><strong>From:</strong> ${name} (${email})</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <div>
              <p><strong>Message:</strong></p>
              <p>${message.replace(/\n/g, '<br/>')}</p>
            </div>
          </body>
        </html>
      `
    };
    
    // 调用 Brevo API
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "api-key": BREVO_API_KEY
      },
      body: JSON.stringify(emailContent)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return res.status(500).json({ error: errorData.message || "Failed to send email" });
    }
    
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Failed to send message:", error);
    return res.status(500).json({ error: "Failed to send message. Please try again." });
  }
}

// 简单内容审核函数
function containsHarmfulContent(text) {
  const lowerText = text.toLowerCase();
  
  // 简单的敏感词检测
  const sensitiveTerms = [
    "porn", "xxx", "sex", "nude",
    "hate", "racist", "nazi", "bigot",
    "harass", "bully", "stalk",
    "suicide", "kill myself", "self harm",
    "kill", "murder", "bomb", "shoot", "terrorist",
    "drug", "cocaine", "heroin", "illegal"
  ];
  
  return sensitiveTerms.some(term => lowerText.includes(term));
}
