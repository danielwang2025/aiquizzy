
// Vercel Serverless Function for quiz generation
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
    const { learningObjectives, options = {} } = req.body;
    
    if (!learningObjectives || learningObjectives.trim() === "") {
      return res.status(400).json({ error: "Learning objectives cannot be empty" });
    }
    
    // Get API key from Vercel environment variables
    const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || req.headers['x-deepseek-key'];
    
    if (!DEEPSEEK_API_KEY) {
      return res.status(500).json({ error: 'DeepSeek API key not configured. Please add it in API settings.' });
    }

    // Simple check for potential prompt injection
    if (containsPromptInjection(learningObjectives)) {
      return res.status(400).json({ error: "Potential prompt injection detected" });
    }
    
    // Set Bloom's taxonomy level descriptions in English
    const bloomLevelDescriptions = {
      remember: "Basic recall level - Tests students' ability to remember and recognize facts, terms, and concepts. Question types: Define terms, list points, identify correct statements, etc.",
      understand: "Comprehension level - Tests students' ability to understand content and explain it in their own words. Question types: Explain concepts, summarize content, classify, compare differences, etc.",
      apply: "Application level - Tests students' ability to apply knowledge to solve problems in new situations. Question types: Apply formulas, use concepts to solve practical problems, demonstrate methods, etc.",
      analyze: "Analysis level - Tests students' ability to break down information into components and understand their relationships. Question types: Analyze causes and effects, find patterns, distinguish main points and supporting evidence, etc.",
      evaluate: "Evaluation level - Tests students' ability to make judgments based on criteria and evidence. Question types: Evaluate method effectiveness, defend positions, critically analyze arguments, make decisions and justify, etc.",
      create: "Creation level - Tests students' ability to combine elements to form a new whole. Question types: Design solutions, propose hypotheses, create models, develop plans, etc."
    };
    
    // Set default options
    const count = options.count || 5;
    const bloomLevel = options.bloomLevel || 'understand';
    const questionTypes = options.questionTypes || ['multiple_choice', 'fill_in'];
    
    // Calculate multiple choice and fill-in question counts
    let multipleChoiceCount = count;
    let fillInCount = 0;
    
    if (questionTypes.includes('multiple_choice') && questionTypes.includes('fill_in')) {
      multipleChoiceCount = Math.ceil(count * 0.6); // 60% multiple choice
      fillInCount = count - multipleChoiceCount;
    } else if (questionTypes.includes('fill_in')) {
      multipleChoiceCount = 0;
      fillInCount = count;
    }
    
    const bloomLevelDescription = bloomLevelDescriptions[bloomLevel];
    
    // Custom system prompt in English
    const systemPrompt = `You are a quiz generator. Please create ${count} practice questions (${multipleChoiceCount} multiple-choice and ${fillInCount} fill-in-the-blank) based on the provided learning objectives.

The questions should align with the "${bloomLevel}" cognitive level of Bloom's Taxonomy:
${bloomLevelDescription}

IMPORTANT GUIDELINES FOR CREATING EFFECTIVE QUESTIONS:
1. Use clear, concise language suitable for educational assessment.
2. For multiple-choice questions:
   - Keep correct answers relatively short and concise
   - Make all options similar in length to avoid giving away the answer
   - Ensure distractors (wrong answers) are plausible but clearly incorrect
   - Avoid obviously wrong options that can be eliminated easily
   - Use 4 options for each multiple-choice question (A, B, C, D)

3. For fill-in-the-blank questions:
   - Keep the answer short (1-3 words maximum)
   - Focus on key concepts rather than lengthy definitions
   - Avoid using blank spaces that could accept multiple correct answers

Return your response in JSON format as follows:
{"questions": [
  {"id": "q1", "type": "multiple_choice", "question": "Question text", "options": ["Option A", "Option B", "Option C", "Option D"], "correctAnswer": 0, "explanation": "Explanation", "bloomLevel": "${bloomLevel}"},
  {"id": "q2", "type": "fill_in", "question": "Question with blank ________.", "correctAnswer": "answer", "explanation": "Explanation", "bloomLevel": "${bloomLevel}"}
]}

Remember to ensure all questions are in English, regardless of what language the learning objectives are provided in.`;

    // Set request timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60-second timeout
    
    try {
      console.log("Sending request to DeepSeek API...");
      // Call DeepSeek API with signal control
      const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            {
              role: "system",
              content: systemPrompt
            },
            {
              role: "user",
              content: `Create test questions based on these learning objectives: ${learningObjectives}`
            }
          ],
          temperature: 0.7,
          max_tokens: 2000
        })
      });
      
      clearTimeout(timeoutId);
      console.log("DeepSeek API response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("DeepSeek API error response:", errorData);
        
        // Provide more specific error messages
        if (response.status === 401) {
          return res.status(401).json({ error: `DeepSeek API authentication failed: Invalid or expired API key` });
        } else if (response.status === 429) {
          return res.status(429).json({ error: `DeepSeek API rate limit exceeded` });
        } else {
          return res.status(500).json({ error: errorData.error?.message || response.statusText || "Unknown error with DeepSeek API" });
        }
      }

      const data = await response.json();
      console.log("Received response from DeepSeek API");
      
      // Parse content
      const content = data.choices[0].message.content;
      // Sometimes API returns markdown with ```json blocks, so we need to extract JSON
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```([\s\S]*?)```/);
      const jsonString = jsonMatch ? jsonMatch[1] : content;
      
      let parsedContent;
      try {
        parsedContent = JSON.parse(jsonString.trim());
      } catch (jsonError) {
        console.error("JSON parse error:", jsonError);
        console.log("Raw content that failed to parse:", jsonString);
        return res.status(500).json({ error: "Failed to parse DeepSeek API response as JSON" });
      }
      
      if (!parsedContent.questions || !Array.isArray(parsedContent.questions)) {
        console.error("Invalid response format:", parsedContent);
        return res.status(500).json({ error: "Invalid response format from DeepSeek API" });
      }
      
      // Validate and transform questions
      const questions = parsedContent.questions.map((q, index) => {
        // Ensure each question has a valid ID
        const id = q.id || `q${index + 1}`;
        
        // For multiple_choice questions, ensure correctAnswer is a number
        let correctAnswer = q.correctAnswer;
        if (q.type === "multiple_choice" && typeof correctAnswer === "string") {
          // If correctAnswer is a string like "A", "B", convert to index
          const optionIndex = q.options.findIndex((opt) => 
            opt.trim().toLowerCase() === correctAnswer.trim().toLowerCase()
          );
          
          if (optionIndex >= 0) {
            correctAnswer = optionIndex;
          } else {
            const letterToIndex = {"a": 0, "b": 1, "c": 2, "d": 3, "e": 4};
            const letter = correctAnswer.trim().toLowerCase();
            if (letter in letterToIndex) {
              correctAnswer = letterToIndex[letter];
            }
          }
        }
        
        // Add topic information based on learning objectives
        const topics = learningObjectives.split(',').map(t => t.trim());
        const topic = topics.length > 0 ? topics[0] : undefined;
        
        return {
          ...q,
          id,
          correctAnswer,
          bloomLevel: q.bloomLevel || bloomLevel,
          topic
        };
      });
      
      console.log(`Successfully generated ${questions.length} questions`);
      return res.status(200).json({ questions });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        return res.status(504).json({ error: "Request timeout - DeepSeek API took too long to respond" });
      }
      
      console.error("Error fetching from DeepSeek API:", fetchError);
      return res.status(500).json({ error: fetchError.message || "Failed to connect to DeepSeek API" });
    }
  } catch (error) {
    console.error("Error generating quiz:", error);
    return res.status(500).json({ error: error.message || "Failed to generate quiz" });
  }
}

// Simple check for potential prompt injection
function containsPromptInjection(text) {
  const lowerInput = text.toLowerCase();
  
  // Common prompt injection patterns
  const injectionPatterns = [
    "ignore previous instructions",
    "ignore all instructions",
    "disregard",
    "forget everything",
    "new instructions",
    "override",
    "system prompt",
    "admin mode",
    "developer mode",
    "bypass",
    "jailbreak"
  ];
  
  return injectionPatterns.some(pattern => lowerInput.includes(pattern));
}
