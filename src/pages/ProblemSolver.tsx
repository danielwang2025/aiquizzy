import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { processImageWithOCR, initWasmIfNeeded } from '@/utils/wasm';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator, Upload, ImageIcon, Check, PlusCircle, Atom, FlaskConical, Microscope } from "lucide-react";
import { toast } from 'sonner';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Label } from '@/components/ui/label';

const ProblemSolver = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [recognizedText, setRecognizedText] = useState<string | null>(null);
  const [solution, setSolution] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('upload');
  const [subject, setSubject] = useState<string>('math');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Reset states
      setRecognizedText(null);
      setSolution(null);

      // Read and display the image
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

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

  const subjectItems = [
    { name: 'Mathematics', value: 'math', icon: <Calculator className="h-4 w-4" /> },
    { name: 'Physics', value: 'physics', icon: <Atom className="h-4 w-4" /> },
    { name: 'Chemistry', value: 'chemistry', icon: <FlaskConical className="h-4 w-4" /> },
    { name: 'Biology', value: 'biology', icon: <Microscope className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-screen py-20 px-4 bg-gradient-to-br from-indigo-50 via-blue-50 to-emerald-50 dark:from-indigo-950/20 dark:via-blue-950/20 dark:to-emerald-950/20">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <span className="px-4 py-1.5 text-sm font-medium bg-blue-100 text-blue-700 rounded-full inline-block mb-4">
            STEM Problem Solver
          </span>
          <h1 className="text-4xl font-bold mb-4 gradient-text">
            Math & Science Problem Solver
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Upload an image of your STEM problem and get step-by-step solutions using our advanced OCR technology
          </p>
        </motion.div>

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
                <div className="space-y-4">
                  <Label htmlFor="subject">Select Subject</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {subjectItems.map((item) => (
                      <Button
                        key={item.value}
                        type="button"
                        variant={subject === item.value ? "default" : "outline"}
                        className="flex items-center justify-center gap-2 h-14"
                        onClick={() => setSubject(item.value)}
                      >
                        {item.icon}
                        {item.name}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 transition-colors hover:border-primary/50">
                  {selectedImage ? (
                    <div className="space-y-4 w-full">
                      <div className="relative aspect-video w-full max-w-sm mx-auto overflow-hidden rounded-lg">
                        <img 
                          src={selectedImage} 
                          alt="Uploaded problem" 
                          className="object-contain w-full h-full"
                        />
                      </div>
                      <div className="flex justify-center gap-4">
                        <Button 
                          variant="outline"
                          onClick={() => setSelectedImage(null)}
                        >
                          Remove
                        </Button>
                        <Button 
                          onClick={handleProcess}
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <LoadingSpinner size="sm" /> 
                              <span className="ml-2">Processing...</span>
                            </>
                          ) : (
                            <>
                              <PlusCircle className="mr-2 h-4 w-4" />
                              Solve Problem
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center space-y-4">
                      <ImageIcon className="w-12 h-12 mx-auto text-gray-400" />
                      <div>
                        <p className="text-lg font-medium">Click to upload</p>
                        <p className="text-sm text-muted-foreground">or drag and drop</p>
                        <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WEBP up to 10MB</p>
                      </div>
                      <Button 
                        variant="outline" 
                        className="relative"
                        disabled={isLoading}
                      >
                        Choose Image
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          disabled={isLoading}
                        />
                      </Button>
                    </div>
                  )}
                </div>
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
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <LoadingSpinner size="lg" />
                    <p className="mt-4 text-muted-foreground">Analyzing your problem...</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {selectedImage && (
                      <div className="border rounded-lg overflow-hidden">
                        <div className="bg-muted p-2 text-sm font-medium">Original Problem</div>
                        <div className="p-4">
                          <img 
                            src={selectedImage} 
                            alt="Original problem" 
                            className="object-contain max-h-40 mx-auto"
                          />
                        </div>
                      </div>
                    )}
                    
                    {recognizedText && (
                      <div className="border rounded-lg overflow-hidden">
                        <div className="bg-muted p-2 text-sm font-medium">Recognized Text</div>
                        <div className="p-4 font-mono text-sm">
                          {recognizedText}
                        </div>
                      </div>
                    )}
                    
                    {solution && (
                      <div className="border rounded-lg overflow-hidden">
                        <div className="bg-muted p-2 text-sm font-medium">Step-by-Step Solution</div>
                        <div className="p-4 whitespace-pre-line">
                          {solution}
                        </div>
                      </div>
                    )}
                    
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                        <Calculator className="h-5 w-5" />
                        Ask Follow-up Questions
                      </h3>
                      <p className="mb-4 text-sm text-muted-foreground">
                        Need more help understanding this solution? Ask our AI tutor!
                      </p>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder="Ask about this solution..." 
                          className="flex-1 px-3 py-2 rounded-md border"
                        />
                        <Button>Ask</Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProblemSolver;
