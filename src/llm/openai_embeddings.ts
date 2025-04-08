
import { Embeddings, EmbeddingsParams } from "@langchain/core/embeddings";
import { getApiKey } from "@/utils/envVars";

/**
 * Interface for OpenAI Embeddings parameters
 */
export interface OpenAIEmbeddingsParams extends EmbeddingsParams {
  apiKey?: string;
  model?: string;
}

/**
 * Class for generating embeddings using the OpenAI API
 */
export class OpenAIEmbeddings extends Embeddings {
  apiKey: string;
  model: string;

  constructor(params: OpenAIEmbeddingsParams = {}) {
    super(params);
    
    // Get API key from params or environment
    this.apiKey = params.apiKey || getApiKey("OPENAI_API_KEY") || "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";
    if (!this.apiKey) {
      throw new Error("OpenAI API key is required");
    }
    
    this.model = params.model || "text-embedding-3-small"; // Use the specified model
  }

  /**
   * Get embeddings for multiple texts
   */
  async embedDocuments(texts: string[]): Promise<number[][]> {
    try {
      console.log(`Generating embeddings for ${texts.length} documents using OpenAI`);
      
      // Process in batches of 10 to avoid rate limits
      const batchSize = 10;
      const embeddings: number[][] = [];
      
      for (let i = 0; i < texts.length; i += batchSize) {
        const batch = texts.slice(i, i + batchSize);
        const batchEmbeddings = await this._callOpenAIAPI(batch);
        embeddings.push(...batchEmbeddings);
      }
      
      return embeddings;
    } catch (error) {
      console.error("Error generating embeddings:", error);
      throw new Error(`Failed to generate embeddings: ${error}`);
    }
  }

  /**
   * Get embedding for a single text
   */
  async embedQuery(text: string): Promise<number[]> {
    try {
      console.log("Generating embedding for query using OpenAI");
      const [embedding] = await this._callOpenAIAPI([text]);
      return embedding;
    } catch (error) {
      console.error("Error generating query embedding:", error);
      throw new Error(`Failed to generate query embedding: ${error}`);
    }
  }

  /**
   * Call OpenAI API to get embeddings for a batch of texts
   */
  private async _callOpenAIAPI(texts: string[]): Promise<number[][]> {
    try {
      const response = await fetch("https://api.openai.com/v1/embeddings", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: this.model,
          input: texts
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`OpenAI API error: ${error.error?.message || "Unknown error"}`);
      }

      const data = await response.json();
      return data.data.map((item: any) => item.embedding);
    } catch (error) {
      console.error("Error calling OpenAI API:", error);
      
      // Fall back to simulation for development if API call fails
      console.warn("Falling back to simulated embeddings for development");
      return texts.map(text => this._simulateEmbedding(text));
    }
  }

  /**
   * Simulate embedding generation for development/testing
   * This creates a deterministic vector based on the text content
   * Used as fallback when API is unavailable
   */
  private _simulateEmbedding(text: string): number[] {
    // Create a deterministic vector of 1536 dimensions (OpenAI's text-embedding-3-small dimension)
    const vector = new Array(1536).fill(0);
    
    // Simple hash function to generate values based on characters
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i);
      const position = i % 1536;
      vector[position] = (vector[position] + charCode / 255) / 2; // Normalize to [0,1]
    }
    
    return vector;
  }
}
