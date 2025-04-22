
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { processImageWithOCR, initWasmIfNeeded } from '@/utils/wasm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Check } from "lucide-react";
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { generateSolution } from '@/utils/aiSolver';

import ProblemSolverHeader from '@/components/ProblemSolver/ProblemSolverHeader';
import SubjectSelector from '@/components/ProblemSolver/SubjectSelector';
import ProblemImageUpload from '@/components/ProblemSolver/ProblemImageUpload';
import SolutionDisplay from '@/components/ProblemSolver/SolutionDisplay';
import ImageUploader from '@/components/ImageUploader';

const ProblemSolver = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [recognizedText, setRecognizedText] = useState<string | null>(null);
  const [solution, setSolution] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('upload');
  const [subject, setSubject] = useState<string>('math');
  const [showCamera, setShowCamera] = useState(false);

  const handleProcess = async () => {
    if (!selectedImage) {
      toast.error("Please upload a problem image first");
      return;
    }

    try {
      setIsLoading(true);
      
      // Initialize WebAssembly if needed
      await initWasmIfNeeded();
      
      // Process the image with OCR
      const ocrResult = await processImageWithOCR(selectedImage);
      setRecognizedText(ocrResult);
      
      // Move to the next tab
      setActiveTab('result');
      
      // Send the OCR result to AI for solving
      const solutionResult = await generateSolution(ocrResult, subject);
      setSolution(solutionResult);
      
    } catch (error) {
      console.error('Error processing image:', error);
      toast.error("Error processing image, please try again");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageCaptured = (dataUrl: string) => {
    setSelectedImage(dataUrl);
    setShowCamera(false);
  };

  return (
    <div className="min-h-screen py-20 px-4 bg-gradient-to-br from-indigo-50 via-blue-50 to-emerald-50 dark:from-indigo-950/20 dark:via-blue-950/20 dark:to-emerald-950/20">
      <div className="max-w-4xl mx-auto">
        <ProblemSolverHeader />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload Problem
            </TabsTrigger>
            <TabsTrigger value="result" className="flex items-center gap-2">
              <Check className="h-4 w-4" />
              Solution
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload">
            <Card className="glass-effect border border-white/20">
              <CardHeader>
                <CardTitle>Upload STEM Problem</CardTitle>
                <CardDescription>
                  Upload or take a photo of a math, physics, chemistry or biology problem
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <SubjectSelector subject={subject} setSubject={setSubject} />
                
                {showCamera ? (
                  <ImageUploader onImageCaptured={handleImageCaptured} />
                ) : (
                  <ProblemImageUpload 
                    selectedImage={selectedImage} 
                    setSelectedImage={setSelectedImage}
                    isLoading={isLoading}
                    onProcess={handleProcess}
                    onCameraClick={() => setShowCamera(true)}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="result">
            <Card className="glass-effect border border-white/20">
              <CardHeader className="relative">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="absolute right-4 top-4"
                  onClick={() => setActiveTab('upload')}
                >
                  Back to Upload
                </Button>
                <CardTitle>Solution Results</CardTitle>
                <CardDescription>
                  Step-by-step solution to your {subject === 'math' ? 'mathematics' : subject === 'physics' ? 'physics' : subject === 'chemistry' ? 'chemistry' : 'biology'} problem
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SolutionDisplay 
                  selectedImage={selectedImage}
                  recognizedText={recognizedText}
                  solution={solution}
                  isLoading={isLoading}
                  onBackClick={() => setActiveTab('upload')}
                  subject={subject}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProblemSolver;
