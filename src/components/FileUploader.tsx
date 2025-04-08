
import React, { useState, useEffect } from "react";
import { Upload, X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { processFileWithRAG } from "@/utils/ragService";
import LoadingSpinner from "./LoadingSpinner";
import * as pdfjsLib from "pdfjs-dist";

// Need to set the worker source for PDF.js
const pdfWorkerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;

interface FileUploaderProps {
  onTextExtracted: (text: string) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onTextExtracted }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize PDF.js worker when component mounts
  useEffect(() => {
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerSrc;
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];

      if (
        selectedFile.type !== "application/pdf" &&
        selectedFile.type !== "text/plain" &&
        !selectedFile.type.includes("document")
      ) {
        toast.error("Please upload a PDF, text, or document file");
        return;
      }

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

  const extractTextFromPdf = async (file: File): Promise<string> => {
    try {
      const pdfData = new Uint8Array(await file.arrayBuffer());
      const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;

      let text = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map((item: any) => item.str).join(" ") + "\n";
      }

      return text;
    } catch (error) {
      console.error("Error extracting text from PDF:", error);
      throw new Error("Failed to extract text from PDF");
    }
  };

  const extractTextFromFile = async () => {
    if (!file) return;

    setIsLoading(true);

    try {
      let extractedText = "";

      if (file.type === "text/plain") {
        extractedText = await file.text();
      } else if (file.type === "application/pdf") {
        extractedText = await extractTextFromPdf(file);
      } else {
        toast.error("Unsupported file type for content extraction");
        setIsLoading(false);
        return;
      }

      const processedText = await processFileWithRAG(extractedText, file.name);
      onTextExtracted(processedText);

      toast.success("Text extracted and processed with RAG!");
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
            {isLoading ? (
              <span className="flex items-center">
                <LoadingSpinner size="sm" className="mr-2" />
                Processing with RAG...
              </span>
            ) : (
              "Extract Content for Quiz"
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
