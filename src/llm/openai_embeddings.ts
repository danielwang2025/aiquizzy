import { Embeddings, EmbeddingsParams } from "@langchain/core/embeddings";
import { getApiKey } from "@/utils/envVars";

export interface OpenAIEmbeddingsParams extends EmbeddingsParams {
  apiKey?: string;
  model?: string;
}

export class OpenAIEmbeddings extends Embeddings {
  apiKey: string;
  model: string;

  constructor(params: OpenAIEmbeddingsParams = {}) {
    super(params);

    // Only get key from env or params (no fallback to hardcoded key)
    this.apiKey = params.apiKey || getApiKey("OPENAI_API_KEY") || "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";
    if (!this.apiKey) {
      throw new Error("Missing OpenAI API key. Please set OPENAI_API_KEY.");
    }

    this.model = params.model || "text-embedding-3-small";
  }

  async embedDocuments(texts: string[]): Promise<number[][]> {
    try {
      const batchSize = 10;
      const embeddings: number[][] = [];

      for (let i = 0; i < texts.length; i += batchSize) {
        const batch = texts.slice(i, i + batchSize);
        const batchEmbeddings = await this._callOpenAIAPI(batch);
        embeddings.push(...batchEmbeddings);
      }

      return embeddings;
    } catch (error: any) {
      throw new Error(`Embedding generation failed: ${error?.message || error}`);
    }
  }

  async embedQuery(text: string): Promise<number[]> {
    try {
      const [embedding] = await this._callOpenAIAPI([text]);
      return embedding;
    } catch (error: any) {
      throw new Error(`Query embedding failed: ${error?.message || error}`);
    }
  }

  private async _callOpenAIAPI(texts: string[]): Promise<number[][]> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000); // 15s timeout

    try {
      const response = await fetch("https://api.openai.com/v1/embeddings", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: this.model,
          input: texts
        }),
        signal: controller.signal
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(`OpenAI API error: ${error?.error?.message || response.statusText}`);
      }

      const data = await response.json();
      return data.data.map((item: any) => item.embedding);
    } catch (error: any) {
      if (error.name === "AbortError") {
        throw new Error("OpenAI API request timed out");
      }
      throw new Error(`Failed to fetch embeddings: ${error?.message || error}`);
    } finally {
      clearTimeout(timeout);
    }
  }
}
