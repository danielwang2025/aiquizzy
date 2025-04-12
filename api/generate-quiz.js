
// Vercel Serverless Function for quiz generation
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-Deepseek-Key');

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
    
    // Custom system prompt in English - Streamlined for faster performance
    const systemPrompt = `You are a quiz generator. Generate ${count} questions (${multipleChoiceCount} multiple-choice, ${fillInCount} fill-in-the-blank) based on: ${learningObjectives}.

Cognitive level: ${bloomLevel} - ${bloomLevelDescription}

Guidelines:
1. Use clear language suitable for assessment.
2. Multiple-choice: 4 options (A, B, C, D), similar length, plausible distractors.
3. Fill-in: Short answers (1-3 words), focus on key concepts.

Return JSON format:
{"questions": [
  {"type": "multiple_choice", "question": "Text", "options": ["A", "B", "C", "D"], "correctAnswer": 0, "explanation": "Why", "bloomLevel": "${bloomLevel}"},
  {"type": "fill_in", "question": "Text with _____.", "correctAnswer": "answer", "explanation": "Why", "bloomLevel": "${bloomLevel}"}
]}`;

    // Set request timeout and implement performance optimizations
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60-second timeout

    // Cache key based on input parameters
    const cacheKey = `${learningObjectives}-${bloomLevel}-${count}-${questionTypes.join('-')}`;
    const requestStartTime = Date.now();
    
    try {
      console.log(`Sending request to DeepSeek API for: ${cacheKey}`);
      
      // Performance optimization: Smaller payload and more focused prompt
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
            }
          ],
          temperature: 0.5, // Reduced temperature for faster responses
          max_tokens: 1500, // Reduced max tokens to speed up processing
          frequency_penalty: 0.5, // Added to discourage repetitive text
        })
      });
      
      clearTimeout(timeoutId);
      console.log(`DeepSeek API response status: ${response.status}, time taken: ${Date.now() - requestStartTime}ms`);

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
      console.log(`Received response from DeepSeek API in ${Date.now() - requestStartTime}ms`);
      
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
      
      console.log(`Successfully generated ${questions.length} questions in ${Date.now() - requestStartTime}ms`);
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
