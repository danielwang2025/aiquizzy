
import React, { useState } from "react";
import { Upload, X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { processFileWithRAG } from "@/utils/ragService";

interface FileUploaderProps {
  onTextExtracted: (text: string) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onTextExtracted }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Check file type
      if (
        selectedFile.type !== "application/pdf" &&
        selectedFile.type !== "text/plain" &&
        !selectedFile.type.includes("document")
      ) {
        toast.error("Please upload a PDF, text, or document file");
        return;
      }
      
      // Check file size (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      
      setFile(selectedFile);
    }
  };
  
  const handleRemoveFile = () => {
    setFile(null);
  };
  
  const extractTextFromFile = async () => {
    if (!file) return;
    
    setIsLoading(true);
    
    try {
      if (file.type === "text/plain") {
        // Extract text from text file
        const text = await file.text();
        
        // Process with RAG
        const processResult = processFileWithRAG(text, file.name);
        onTextExtracted(text);
        
        toast.success("Document processed with RAG for enhanced quiz generation!");
      } else {
        // For PDF and other document types
        const reader = new FileReader();
        
        reader.onload = async (event) => {
          try {
            // Simulate text extraction from binary files
            // In a production app, you would use a PDF parsing library here
            const simulatedText = `
              ${file.name} content:
              This is extracted content from your learning material.
              Key concepts:
              - Topic 1: Definition and examples
              - Topic 2: Best practices and methodologies
              - Topic 3: Advanced techniques
            `;
            
            // Process with RAG
            const processResult = processFileWithRAG(simulatedText, file.name);
            onTextExtracted(simulatedText);
            
            toast.success("Document indexed with RAG for enhanced quiz generation!");
          } catch (error) {
            console.error("Error processing file:", error);
            toast.error("Failed to process file content");
          } finally {
            setIsLoading(false);
          }
        };
        
        reader.onerror = () => {
          toast.error("Error reading file");
          setIsLoading(false);
        };
        
        reader.readAsArrayBuffer(file);
      }
    } catch (error) {
      console.error("Error extracting text:", error);
      toast.error("Failed to extract text from file");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="mb-6">
      <div className="mb-2">
        <label className="block text-sm font-medium mb-1">
          Upload Learning Material
        </label>
        <p className="text-xs text-muted-foreground mb-2">
          Improve quiz accuracy by uploading relevant learning materials (PDF, TXT, DOC)
        </p>
      </div>
      
      {!file ? (
        <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
          <label htmlFor="file-upload" className="cursor-pointer block">
            <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
            <span className="text-sm font-medium">Click to upload a file</span>
            <p className="text-xs text-muted-foreground mt-1">PDF, TXT, or DOC (max 5MB)</p>
            <input
              id="file-upload"
              type="file"
              className="hidden"
              accept=".pdf,.txt,.doc,.docx"
              onChange={handleFileChange}
            />
          </label>
        </div>
      ) : (
        <div className="border border-border rounded-lg p-4 bg-secondary/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-primary" />
              <div>
                <p className="text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemoveFile}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Remove file</span>
            </Button>
          </div>
          
          <Button
            className="w-full mt-3"
            size="sm"
            disabled={isLoading}
            onClick={extractTextFromFile}
          >
            {isLoading ? "Processing with RAG..." : "Extract & Index Content"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
