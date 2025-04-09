
// Vercel Serverless Function for quiz generation
import { supabase } from "../src/integrations/supabase/client.js";
import { 
  canGenerateQuestions, 
  incrementQuestionCount, 
  getUnregisteredQuestionCount 
} from "../src/utils/subscriptionService.js";

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Ensure request method is POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { learningObjectives, options = {}, userId } = req.body;
    
    if (!learningObjectives || learningObjectives.trim() === "") {
      return res.status(400).json({ error: "Learning objectives cannot be empty" });
    }

    // Check if user can generate questions
    const count = options.count || 5;
    const canGenerate = await canGenerateQuestions(userId, count);
    
    if (!canGenerate) {
      return res.status(403).json({ 
        error: "Question limit reached. Please upgrade your subscription for more questions." 
      });
    }
    
    // Get API key from environment
    const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
    
    if (!DEEPSEEK_API_KEY) {
      return res.status(500).json({ error: 'DeepSeek API key not configured in environment variables' });
    }

    // Simple check for prompt injection
    if (containsPromptInjection(learningObjectives)) {
      return res.status(400).json({ error: "Potential prompt injection detected" });
    }
    
    // Set Bloom's taxonomy level descriptions
    const bloomLevelDescriptions = {
      remember: "Basic memory level - Tests students' ability to recall and recognize facts, terms, and concepts. Question types: Define terms, list points, identify correct statements, etc.",
      understand: "Comprehension level - Tests students' ability to understand and explain learned content in their own words. Question types: Explain concepts, summarize content, classify, compare differences, etc.",
      apply: "Application level - Tests students' ability to apply knowledge to solve problems in new situations. Question types: Apply formulas, use concepts to solve practical problems, demonstrate methods, etc.",
      analyze: "Analysis level - Tests students' ability to break information into parts and understand relationships. Question types: Analyze causes and effects, find patterns, distinguish main points and supporting evidence, etc.",
      evaluate: "Evaluation level - Tests students' ability to make judgments based on criteria and evidence. Question types: Assess method effectiveness, defend viewpoints, critically analyze arguments, make decisions with justification, etc.",
      create: "Creation level - Tests students' ability to combine elements into a new whole. Question types: Design solutions, propose hypotheses, create models, develop plans, etc."
    };
    
    // Set default options
    const bloomLevel = options.bloomLevel || 'understand';
    const questionTypes = options.questionTypes || ['multiple_choice', 'fill_in'];
    
    // Calculate number of multiple choice and fill-in questions
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
    
    // Custom system prompt
    const systemPrompt = `You are a quiz generator. Please create ${count} practice questions (${multipleChoiceCount} multiple choice and ${fillInCount} fill-in-the-blank) based on the learning objectives provided.

The questions should align with the "${bloomLevel}" cognitive level in Bloom's taxonomy:
${bloomLevelDescription}

Return your response in JSON format with the following structure: {"questions": [{"id": "q1", "type": "multiple_choice", "question": "Question text", "options": ["Option A", "Option B", "Option C", "Option D"], "correctAnswer": 0, "explanation": "Explanation", "bloomLevel": "${bloomLevel}"}, {"id": "q2", "type": "fill_in", "question": "Question with blank ________.", "correctAnswer": "answer", "explanation": "Explanation", "bloomLevel": "${bloomLevel}"}]}`;

    // Call DeepSeek API
    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
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
            content: `Create a test based on these learning objectives: ${learningObjectives}`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("DeepSeek API error response:", errorData);
      
      // Provide more specific error messages
      if (response.status === 401) {
        return res.status(401).json({ error: `DeepSeek API authentication failed: Invalid or expired API key` });
      } else if (response.status === 429) {
        return res.status(429).json({ error: `DeepSeek API rate limit exceeded` });
      } else {
        return res.status(500).json({ error: errorData.error?.message || response.statusText || "Unknown error" });
      }
    }

    const data = await response.json();
    
    // Parse content
    const content = data.choices[0].message.content;
    // Sometimes the API returns markdown with ```json blocks, so we need to extract the JSON
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
    
    // Increment question count after successful generation
    await incrementQuestionCount(userId, count);
    
    return res.status(200).json({ questions });
  } catch (error) {
    console.error("Error generating quiz:", error);
    return res.status(500).json({ error: error.message || "Failed to generate quiz" });
  }
}

// Simple check for prompt injection
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
