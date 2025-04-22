
// AI Solution generator for STEM problems

/**
 * Interface for the AI solution response
 */
interface AIResponse {
  solution: string;
  confidence: number;
  steps: {
    description: string;
    formula?: string;
    explanation: string;
  }[];
}

/**
 * Sends the recognized text to the DeepSeek AI model for solving
 * @param recognizedText The OCR result from the image
 * @param subject The subject area (math, physics, chemistry, biology)
 * @returns A step-by-step solution
 */
export async function generateSolution(recognizedText: string, subject: string): Promise<string> {
  console.log(`Generating solution for ${subject} problem: ${recognizedText}`);
  
  try {
    // Prepare request payload for DeepSeek API
    const requestPayload = {
      problem: recognizedText,
      subject: subject,
      format: "json",
      requireStepByStep: true
    };
    
    // Check if we have a DeepSeek API key in localStorage
    const apiKey = localStorage.getItem("DEEPSEEK_API_KEY");
    
    if (!apiKey) {
      // If no API key, return mock response based on recognized text
      console.log("No DeepSeek API key found, using mock response");
      return generateMockSolution(recognizedText, subject);
    }
    
    // Make an API call to DeepSeek
    const response = await fetch('https://api.deepseek.com/v1/solve', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestPayload)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`DeepSeek API error (${response.status}):`, errorText);
      throw new Error(`DeepSeek API error: ${response.status}`);
    }
    
    // Parse the response
    const data = await response.json();
    
    // Return the solution
    return data.solution || generateMockSolution(recognizedText, subject);
    
  } catch (error) {
    console.error("Error generating solution:", error);
    // Fall back to mock solution in case of error
    return generateMockSolution(recognizedText, subject);
  }
}

/**
 * Generates a mock solution for demonstration when API isn't available
 */
function generateMockSolution(recognizedText: string, subject: string): string {
  // Generate different responses based on subject and recognized text
  if (subject === 'math') {
    if (recognizedText.includes("\\int")) {
      return `
Step 1: Identify the integral problem ${recognizedText}
Step 2: Recall that the antiderivative of sine is negative cosine: \\int \\sin(x) dx = -\\cos(x) + C
Step 3: Apply the Fundamental Theorem of Calculus: \\int_{0}^{\\pi} \\sin(x) dx = -\\cos(\\pi) - (-\\cos(0))
Step 4: Calculate: -\\cos(\\pi) - (-\\cos(0)) = -(-1) - (-1) = 1 + 1 = 2
Step 5: Therefore, \\int_{0}^{\\pi} \\sin(x) dx = 2
      `;
    } else if (recognizedText.includes("\\lim")) {
      return `
Step 1: Identify the limit problem ${recognizedText}
Step 2: This is a well-known limit that can be solved using L'Hôpital's rule or Taylor expansion
Step 3: Using Taylor expansion, we know that \\sin(x) = x - \\frac{x^3}{3!} + \\frac{x^5}{5!} - ...
Step 4: Therefore \\frac{\\sin(x)}{x} = 1 - \\frac{x^2}{3!} + \\frac{x^4}{5!} - ...
Step 5: As x \\to 0, the higher-order terms approach 0
Step 6: Thus, \\lim_{x \\to 0} \\frac{\\sin(x)}{x} = 1
      `;
    } else if (recognizedText.includes("\\frac{d}{dx}")) {
      return `
Step 1: Identify the derivative problem ${recognizedText}
Step 2: We need to find the derivative of sin(x²) with respect to x
Step 3: Using the chain rule: \\frac{d}{dx}[\\sin(u)] = \\cos(u) \\cdot \\frac{du}{dx}, where u = x²
Step 4: Calculate \\frac{d}{dx}[x²] = 2x
Step 5: Apply the chain rule: \\frac{d}{dx}[\\sin(x²)] = \\cos(x²) \\cdot 2x = 2x\\cos(x²)
Step 6: Therefore, \\frac{d}{dx}[\\sin(x²)] = 2x\\cos(x²)
      `;
    } else if (recognizedText.includes("\\sum")) {
      return `
Step 1: Identify the infinite series problem ${recognizedText}
Step 2: This is the famous Basel problem first posed by Pietro Mengoli in 1644
Step 3: The sum was found by Leonhard Euler in 1734 and equals \\frac{\\pi^2}{6}
Step 4: The proof involves Fourier series and the properties of the sine function
Step 5: Therefore, \\sum_{n=1}^{\\infty} \\frac{1}{n^2} = \\frac{\\pi^2}{6} ≈ 1.6449...
      `;
    } else {
      return `
Step 1: Analyzing problem ${recognizedText}
Step 2: Applying appropriate mathematical methods
Step 3: Applying relevant formulas and theorems
Step 4: Calculating and simplifying
Step 5: Deriving the final answer
      `;
    }
  } else if (subject === 'physics') {
    return `
Step 1: Analyzing the physics problem ${recognizedText}
Step 2: Identifying relevant physical law: Newton's Second Law F = ma
Step 3: Setting up the equation: If initial velocity u = 5 m/s, acceleration a = 2 m/s², time t = 3 s
Step 4: Applying the kinematic equation: v = u + at
Step 5: Substituting values: v = 5 + 2 × 3
Step 6: Calculating: v = 5 + 6 = 11 m/s
Step 7: Therefore, the final velocity is 11 m/s
    `;
  } else if (subject === 'chemistry') {
    return `
Step 1: Analyzing the chemistry problem ${recognizedText}
Step 2: Determining the balanced chemical equation 2H₂ + O₂ → 2H₂O
Step 3: Checking atom balance:
   - Left side: 4 H atoms, 2 O atoms
   - Right side: 4 H atoms, 2 O atoms
Step 4: Equation is balanced
Step 5: Calculations based on this equation: When 2 moles of H₂ are consumed, 1 mole of O₂ is required, producing 2 moles of H₂O
    `;
  } else {
    return `
Step 1: Analyzing the biology problem ${recognizedText}
Step 2: Identifying biological concepts involved: Cell Division
Step 3: Explaining the stages of mitosis: Prophase, Metaphase, Anaphase, and Telophase
Step 4: Analyzing chromosome behavior and cell division process
Step 5: Drawing conclusions and significance of the biological phenomenon
    `;
  }
}
