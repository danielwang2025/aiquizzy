
// Vercel Serverless Function for sending contact messages
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle OPTIONS requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Ensure request method is POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, subject, message } = req.body;
    
    // Get API key from Vercel environment variables
    const BREVO_API_KEY = process.env.BREVO_API_KEY;
    
    if (!BREVO_API_KEY) {
      console.error("BREVO_API_KEY not configured in environment variables");
      return res.status(500).json({ error: 'API key not configured in environment variables' });
    }

    // Content moderation
    if (containsHarmfulContent(message)) {
      return res.status(400).json({ error: "Your message contains potentially harmful content and cannot be sent." });
    }
    
    // Create email content
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
    
    console.log("Attempting to send email with Brevo API");
    
    // Call Brevo API
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
      console.error("Brevo API error:", errorData);
      return res.status(response.status).json({ error: errorData.message || "Failed to send email" });
    }
    
    const responseData = await response.json();
    console.log("Email sent successfully:", responseData);
    return res.status(200).json({ success: true, data: responseData });
  } catch (error) {
    console.error("Failed to send message:", error);
    return res.status(500).json({ error: "Failed to send message. Please try again." });
  }
}

// Simple content moderation function
function containsHarmfulContent(text) {
  if (!text) return false;
  
  const lowerText = text.toLowerCase();
  
  // Simple sensitive terms detection
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
