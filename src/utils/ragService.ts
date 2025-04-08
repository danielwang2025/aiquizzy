
import { Document } from "langchain/document";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "@langchain/openai";
import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { getApiKey } from "@/utils/envVars";

// In-memory storage for FAISS instances
let vectorStore: FaissStore | null = null;

// Document interface to standardize document format
export interface DocumentMetadata {
  source: string;
  page?: number;
}

// Initialize embeddings model
const getEmbeddings = () => {
  const apiKey = getApiKey("OPENAI_API_KEY");
  if (!apiKey) {
    console.error("OpenAI API key not found");
    throw new Error("OpenAI API key is required for embeddings");
  }
  return new OpenAIEmbeddings({ openAIApiKey: apiKey });
};

// Create text splitter for document chunking
const createTextSplitter = () => {
  return new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });
};

// Process document text and create chunks
export const chunkDocument = async (text: string, source: string): Promise<Document<DocumentMetadata>[]> => {
  const splitter = createTextSplitter();
  
  // Create a document with metadata
  const doc = new Document({
    pageContent: text,
    metadata: { source }
  });
  
  // Split document into chunks
  const chunks = await splitter.splitDocuments([doc]);
  
  console.log(`Document split into ${chunks.length} chunks`);
  return chunks;
};

// Initialize or update vector store with documents
export const addDocumentsToVectorDB = async (documents: Document<DocumentMetadata>[]): Promise<void> => {
  try {
    const embeddings = getEmbeddings();
    
    if (!vectorStore) {
      // Initialize new vector store
      console.log("Initializing new vector store");
      vectorStore = await FaissStore.fromDocuments(documents, embeddings);
    } else {
      // Add documents to existing vector store
      console.log("Adding documents to existing vector store");
      await vectorStore.addDocuments(documents);
    }
    
    console.log(`Added ${documents.length} chunks to vector database`);
  } catch (error) {
    console.error("Error adding documents to vector store:", error);
    throw new Error("Failed to add documents to vector store");
  }
};

// Search for similar documents based on query
export const searchSimilarDocuments = async (query: string, topK: number = 3): Promise<Document<DocumentMetadata>[]> => {
  if (!vectorStore) {
    console.warn("Vector store not initialized, returning empty results");
    return [];
  }
  
  try {
    console.log(`Searching for documents similar to: "${query}"`);
    const results = await vectorStore.similaritySearch(query, topK);
    console.log(`Found ${results.length} relevant documents`);
    return results;
  } catch (error) {
    console.error("Error searching vector store:", error);
    return [];
  }
};

// Process file content with RAG
export const processFileWithRAG = async (fileContent: string, source: string): Promise<string> => {
  try {
    // 1. Chunk the document
    const chunks = await chunkDocument(fileContent, source);
    
    // 2. Add to vector database
    await addDocumentsToVectorDB(chunks);
    
    // 3. Return a summary of the process
    return `
      Successfully processed ${chunks.length} chunks from ${source}.
      Content indexed and ready for quiz generation.
      The system will use this content to enhance quiz questions.
    `;
  } catch (error) {
    console.error("Error processing file with RAG:", error);
    throw new Error("Failed to process file with RAG");
  }
};

// Get relevant context for quiz generation
export const getRelevantContext = async (topic: string): Promise<string> => {
  try {
    if (!vectorStore) {
      return "No documents have been uploaded yet.";
    }
    
    const relevantDocs = await searchSimilarDocuments(topic);
    
    if (relevantDocs.length === 0) {
      return "No relevant information found in the uploaded documents.";
    }
    
    // Combine the content from relevant documents
    return relevantDocs
      .map(doc => doc.pageContent)
      .join('\n\n');
  } catch (error) {
    console.error("Error getting relevant context:", error);
    return "Error retrieving context from documents.";
  }
};

// Save vector store to disk (optional feature for persistence)
export const saveVectorStore = async (directory: string = "./vector_db"): Promise<void> => {
  if (!vectorStore) {
    throw new Error("No vector store to save");
  }
  
  try {
    await vectorStore.save(directory);
    console.log(`Vector store saved to ${directory}`);
  } catch (error) {
    console.error("Error saving vector store:", error);
    throw new Error("Failed to save vector store");
  }
};

// Load vector store from disk (optional feature for persistence)
export const loadVectorStore = async (directory: string = "./vector_db"): Promise<void> => {
  try {
    const embeddings = getEmbeddings();
    vectorStore = await FaissStore.load(directory, embeddings);
    console.log(`Vector store loaded from ${directory}`);
  } catch (error) {
    console.error("Error loading vector store:", error);
    throw new Error("Failed to load vector store");
  }
};
