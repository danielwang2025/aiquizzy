
import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Camera, Upload, WandSparkles, Image as ImageIcon, MessageCircle } from "lucide-react";
import ImageUploader from "@/components/ImageUploader";
import StepByStepSolution from "@/components/StepByStepSolution";
import AIFollowupChat from "@/components/AIFollowupChat";
import { toast } from "sonner";

const ProblemSolver: React.FC = () => {
  const [imageData, setImageData] = useState<string | null>(null);
  const [recognizedText, setRecognizedText] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [solution, setSolution] = useState<{steps: Array<{text: string, explanation: string}>} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        toast.error("Please upload an image file");
        return;
      }
      
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setImageData(e.target.result as string);
          setRecognizedText("");
          setSolution(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImageUpload = (dataUrl: string) => {
    setImageData(dataUrl);
    setRecognizedText("");
    setSolution(null);
  };

  const processImage = async () => {
    if (!imageData) {
      toast.error("Please upload an image first");
      return;
    }

    setIsProcessing(true);
    try {
      // This would be replaced with actual WebAssembly Mathpix OCR processing
      toast.loading("Analyzing image with OCR...");
      
      // Simulate OCR processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock OCR result for demonstration purposes
      // In a real implementation, this would come from the WebAssembly Mathpix model
      const mockText = "\\int_{0}^{\\pi} \\sin(x) dx";
      setRecognizedText(mockText);
      toast.dismiss();
      toast.success("Text extracted successfully!");
      
      // Simulate solution generation delay
      toast.loading("Generating step-by-step solution...");
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock solution for demonstration purposes
      const mockSolution = {
        steps: [
          {
            text: "Start with the integral $\\int_{0}^{\\pi} \\sin(x) dx$",
            explanation: "We need to find the antiderivative of sin(x) which is -cos(x) + C"
          },
          {
            text: "Apply the fundamental theorem of calculus",
            explanation: "$\\int_{0}^{\\pi} \\sin(x) dx = [-\\cos(x)]_{0}^{\\pi}$"
          },
          {
            text: "Evaluate at the bounds",
            explanation: "$[-\\cos(\\pi)] - [-\\cos(0)] = -(-1) - (-1) = 1 + 1 = 2$"
          },
          {
            text: "Final answer",
            explanation: "$\\int_{0}^{\\pi} \\sin(x) dx = 2$"
          }
        ]
      };
      setSolution(mockSolution);
      toast.dismiss();
      toast.success("Solution generated!");
      
    } catch (error) {
      console.error("Error processing image:", error);
      toast.dismiss();
      toast.error("Failed to process image. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20">
      <Navigation />
      <main className="py-12 px-4 flex-grow">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <span className="px-4 py-1.5 text-sm font-medium bg-purple-100 text-purple-700 rounded-full inline-block mb-4">
              Problem Solver
            </span>
            <h1 className="text-4xl font-bold mb-6 tracking-tight gradient-text">
              Visual Problem Solver
            </h1>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Upload an image of a math problem and get a step-by-step solution. 
              Ask follow-up questions for deeper understanding.
            </p>
          </motion.div>

          <Card className="bg-white/70 backdrop-blur-md shadow-lg border-dashed mb-8">
            <CardHeader>
              <CardTitle className="flex items-center justify-center">
                <ImageIcon className="h-5 w-5 mr-2 text-purple-600" />
                Upload Problem Image
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Tabs defaultValue="upload" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="upload">Upload Image</TabsTrigger>
                    <TabsTrigger value="camera">Take Photo</TabsTrigger>
                  </TabsList>
                  <TabsContent value="upload" className="space-y-4">
                    <div className="flex flex-col items-center justify-center">
                      <div 
                        className="border-2 border-dashed border-slate-200 rounded-lg p-8 w-full max-w-md hover:border-purple-300 transition-colors cursor-pointer"
                        onClick={triggerFileInput}
                      >
                        {imageData ? (
                          <div className="relative">
                            <img 
                              src={imageData} 
                              alt="Uploaded problem" 
                              className="max-h-64 mx-auto rounded-md"
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              className="absolute top-2 right-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                setImageData(null);
                                setRecognizedText("");
                                setSolution(null);
                              }}
                            >
                              Change
                            </Button>
                          </div>
                        ) : (
                          <div className="text-center">
                            <Upload className="h-12 w-12 text-slate-300 mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground mb-1">
                              Click to upload or drag and drop
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Supports JPG, PNG, GIF (max 5MB)
                            </p>
                          </div>
                        )}
                      </div>
                      <Input 
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </div>
                  </TabsContent>
                  <TabsContent value="camera">
                    <ImageUploader onImageCaptured={handleImageUpload} />
                  </TabsContent>
                </Tabs>

                <div className="flex justify-center">
                  <Button
                    onClick={processImage}
                    disabled={!imageData || isProcessing}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                  >
                    {isProcessing ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <WandSparkles className="h-4 w-4 mr-2" />
                        Solve Problem
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {recognizedText && (
            <Card className="mb-8 bg-white/70 backdrop-blur-md shadow-lg border-dashed">
              <CardHeader>
                <CardTitle>Recognized Problem</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-50 p-4 rounded-md border border-slate-200 font-mono text-center">
                  {recognizedText}
                </div>
              </CardContent>
            </Card>
          )}

          {solution && (
            <>
              <StepByStepSolution solution={solution} />
              <div className="mt-8">
                <AIFollowupChat context={recognizedText} solution={solution} />
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProblemSolver;
