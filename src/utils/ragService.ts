import { Document } from "langchain/document";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { getApiKey } from "@/utils/envVars";
import { OpenAIEmbeddings } from "@/llm/openai_embeddings";

// In-memory storage for FAISS instances
let vectorStore: FaissStore | null = null;

// Document interface to standardize document format
export interface DocumentMetadata {
  source: string;
  page?: number;
}

// Initialize embeddings model using OpenAI API
const getEmbeddings = () => {
  const apiKey = getApiKey("OPENAI_API_KEY");
  console.log("Getting OpenAI embeddings with API key:", apiKey ? "Key exists" : "No key found");
  
  try {
    return new OpenAIEmbeddings({ apiKey });
  } catch (error) {
    console.error("Failed to initialize OpenAI embeddings:", error);
    throw error;
  }
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
  console.log(`Starting to chunk document from ${source}, text length: ${text.length} chars`);
  
  if (!text || text.trim().length === 0) {
    console.error("Empty document text received for chunking");
    throw new Error("Empty document text");
  }
  
  const splitter = createTextSplitter();

  const doc = new Document<DocumentMetadata>({
    pageContent: text,
    metadata: { source }
  });

  console.log("Created Document object, splitting into chunks...");
  const chunks = await splitter.splitDocuments([doc]) as Document<DocumentMetadata>[];

  console.log(`Document split into ${chunks.length} chunks`);
  
  // Ensure all chunks have the required metadata
  for (const chunk of chunks) {
    if (!chunk.metadata.source) {
      chunk.metadata.source = source;
    }
  }
  
  return chunks;
};

// Initialize or update vector store with documents
export const addDocumentsToVectorDB = async (documents: Document<DocumentMetadata>[]): Promise<void> => {
  try {
    console.log(`Attempting to add ${documents.length} documents to vector DB`);
    
    if (documents.length === 0) {
      console.warn("No documents to add to vector DB");
      return;
    }
    
    const embeddings = getEmbeddings();
    console.log("Embeddings model initialized successfully");

    if (!vectorStore) {
      console.log("Initializing new vector store");
      vectorStore = await FaissStore.fromDocuments(documents, embeddings);
      console.log("New vector store created successfully");
    } else {
      console.log("Adding documents to existing vector store");
      await vectorStore.addDocuments(documents);
      console.log("Documents added to existing vector store successfully");
    }
  } catch (error) {
    console.error("Error adding documents to vector store:", error);
    throw new Error(`Failed to add documents to vector store: ${error instanceof Error ? error.message : String(error)}`);
  }
};

export const searchSimilarDocuments = async (query: string, topK: number = 3): Promise<Document<DocumentMetadata>[]> => {
  if (!vectorStore) {
    console.warn("Vector store not initialized, returning empty results");
    return [];
  }

  try {
    console.log(`Searching for documents similar to: "${query}"`);
    const results = await vectorStore.similaritySearch(query, topK) as Document<DocumentMetadata>[];
    
    // Ensure all retrieved documents have the required metadata
    for (const doc of results) {
      if (!doc.metadata.source) {
        doc.metadata.source = "unknown";
      }
    }
    
    console.log(`Found ${results.length} relevant documents`);
    return results;
  } catch (error) {
    console.error("Error searching vector store:", error);
    return [];
  }
};

export const getRelevantContext = async (topic: string): Promise<string> => {
  try {
    if (!vectorStore) {
      return "No documents have been uploaded yet.";
    }

    const relevantDocs = await searchSimilarDocuments(topic);

    if (relevantDocs.length === 0) {
      return "No relevant information found in the uploaded documents.";
    }

    return relevantDocs.map(doc => doc.pageContent).join('\n\n');
  } catch (error) {
    console.error("Error getting relevant context:", error);
    return "Error retrieving context from documents.";
  }
};

export const processFileWithRAG = async (fileContent: string, source: string): Promise<string> => {
  try {
    console.log(`Processing file with RAG: ${source}, content length: ${fileContent.length} chars`);
    
    if (!fileContent || fileContent.trim().length === 0) {
      throw new Error("File content is empty");
    }
    
    const chunks = await chunkDocument(fileContent, source);
    console.log(`Successfully chunked file into ${chunks.length} chunks`);
    
    await addDocumentsToVectorDB(chunks);
    console.log("Successfully added chunks to vector database");

    return `
      Successfully processed ${chunks.length} chunks from ${source}.
      Content indexed and ready for quiz generation.
      The system will use this content to enhance quiz questions.
    `;
  } catch (error) {
    console.error("Error processing file with RAG:", error);
    throw new Error(`Failed to process file with RAG: ${error instanceof Error ? error.message : String(error)}`);
  }
};

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
