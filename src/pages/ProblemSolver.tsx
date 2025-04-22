import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { processImageWithOCR, initWasmIfNeeded } from '@/utils/wasm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Check } from "lucide-react";
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";

import ProblemSolverHeader from '@/components/ProblemSolver/ProblemSolverHeader';
import SubjectSelector from '@/components/ProblemSolver/SubjectSelector';
import ProblemImageUpload from '@/components/ProblemSolver/ProblemImageUpload';
import SolutionDisplay from '@/components/ProblemSolver/SolutionDisplay';

const ProblemSolver = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [recognizedText, setRecognizedText] = useState<string | null>(null);
  const [solution, setSolution] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('upload');
  const [subject, setSubject] = useState<string>('math');

  const handleProcess = async () => {
    if (!selectedImage) {
      toast.error("Please upload an image first");
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
      
      // In a real implementation, we would send the OCR result to a backend
      // service to get the solution steps. For now, we'll simulate this with a delay.
      setTimeout(() => {
        if (subject === 'math') {
          setSolution(`
Step 1: Identify the integral \\int_{0}^{\\pi} \\sin(x) dx
Step 2: Recall the antiderivative of sine is negative cosine: \\int \\sin(x) dx = -\\cos(x) + C
Step 3: Apply the fundamental theorem of calculus: \\int_{0}^{\\pi} \\sin(x) dx = -\\cos(\\pi) - (-\\cos(0))
Step 4: Evaluate: -\\cos(\\pi) - (-\\cos(0)) = -(-1) - (-1) = 1 + 1 = 2
          `);
        } else if (subject === 'physics') {
          setSolution(`
Step 1: Identify the kinematic equation v = u + at
Step 2: Given initial velocity u = 5 m/s, acceleration a = 2 m/s², time t = 3 s
Step 3: Substitute values: v = 5 + 2 × 3
Step 4: Calculate: v = 5 + 6 = 11 m/s
          `);
        } else if (subject === 'chemistry') {
          setSolution(`
Step 1: Balance the chemical equation 2H₂ + O₂ → 2H₂O
Step 2: Count atoms on each side
   - Left side: 4 H atoms, 2 O atoms
   - Right side: 4 H atoms, 2 O atoms
Step 3: The equation is balanced
          `);
        } else {
          setSolution(`
Step 1: Calculate the probability of event A and event B
Step 2: P(A) = 0.4, P(B) = 0.3
Step 3: Calculate P(A and B) = P(A) × P(B) = 0.4 × 0.3 = 0.12
Step 4: Calculate P(A or B) = P(A) + P(B) - P(A and B) = 0.4 + 0.3 - 0.12 = 0.58
          `);
        }
        
        setIsLoading(false);
      }, 2000);
      
    } catch (error) {
      console.error('Error processing image:', error);
      toast.error("Error processing image. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-20 px-4 bg-gradient-to-br from-indigo-50 via-blue-50 to-emerald-50 dark:from-indigo-950/20 dark:via-blue-950/20 dark:to-emerald-950/20">
      <div className="max-w-4xl mx-auto">
        <ProblemSolverHeader />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="result" className="flex items-center gap-2">
              <Check className="h-4 w-4" />
              Result
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload">
            <Card className="glass-effect border border-white/20">
              <CardHeader>
                <CardTitle>Upload Your STEM Problem</CardTitle>
                <CardDescription>
                  Take a photo or upload an image of your math, physics, chemistry, or biology problem
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <SubjectSelector subject={subject} setSubject={setSubject} />
                
                <ProblemImageUpload 
                  selectedImage={selectedImage} 
                  setSelectedImage={setSelectedImage}
                  isLoading={isLoading}
                  onProcess={handleProcess}
                />
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
                <CardTitle>Problem Solution</CardTitle>
                <CardDescription>
                  Step-by-step solution to your {subject} problem
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SolutionDisplay 
                  selectedImage={selectedImage}
                  recognizedText={recognizedText}
                  solution={solution}
                  isLoading={isLoading}
                  onBackClick={() => setActiveTab('upload')}
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
