import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { generateQuestions } from "@/utils/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Slider
} from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { saveQuizToDatabase } from "@/utils/databaseService";
import { toast } from "sonner";
import FileUploader from "@/components/FileUploader";
import { getRelevantContext } from "@/utils/ragService";
import { isAuthenticated } from "@/utils/authService";
import { QuizState, QuizQuestion } from "@/types/quiz";

interface QuizGeneratorProps {
  initialTopic?: string;
}

// Component to generate quizzes
const QuizGenerator: React.FC<QuizGeneratorProps> = ({ initialTopic = "" }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [learningObjectives, setLearningObjectives] = useState(initialTopic);
  const [difficultyLevel, setDifficultyLevel] = useState<"easy" | "medium" | "hard">("medium");
  const [questionCount, setQuestionCount] = useState(5);
  const [questionTypes, setQuestionTypes] = useState<("multiple_choice" | "fill_in")[]>(["multiple_choice", "fill_in"]);
  const [uploadedContent, setUploadedContent] = useState<string | null>(null);
  const [useUploadedContent, setUseUploadedContent] = useState(false);
  const [isDemo, setIsDemo] = useState(!isAuthenticated());
  const uploadRef = useRef<HTMLInputElement>(null);

  // Maximum number of questions allowed in demo mode
  const MAX_DEMO_QUESTIONS = 5;

  // Toggle for question types
  const toggleQuestionType = (type: "multiple_choice" | "fill_in") => {
    if (questionTypes.includes(type)) {
      // Don't allow removing the last question type
      if (questionTypes.length > 1) {
        setQuestionTypes(questionTypes.filter(t => t !== type));
      }
    } else {
      setQuestionTypes([...questionTypes, type]);
    }
  };

  // Process uploaded content for quiz context
  const handleFileProcessed = (extractedText: string) => {
    setUploadedContent(extractedText);
    toast.success(`File processed successfully!`);
    setUseUploadedContent(true);
  };

  // Generate the quiz questions
  const generateQuiz = async () => {
    if (!learningObjectives.trim()) {
      toast.error("请输入学习目标");
      return;
    }

    // Apply demo mode restriction
    if (isDemo && questionCount > MAX_DEMO_QUESTIONS) {
      toast.info(`Demo version is limited to ${MAX_DEMO_QUESTIONS} questions. Adjusting count automatically.`);
      setQuestionCount(MAX_DEMO_QUESTIONS);
    }

    setIsLoading(true);
    
    try {
      // Get any relevant context from uploaded content if enabled
      let fullPrompt = learningObjectives;
      if (useUploadedContent && uploadedContent) {
        const relevantContext = getRelevantContext(learningObjectives);
        if (relevantContext && !relevantContext.includes("No relevant information found")) {
          fullPrompt = `${learningObjectives}\n\nAdditional context:\n${relevantContext}`;
        }
      }

      // Generate questions based on learning objectives
      const finalQuestionCount = isDemo ? Math.min(questionCount, MAX_DEMO_QUESTIONS) : questionCount;
      
      const generatedQuestions = await generateQuestions(
        fullPrompt, 
        {
          count: finalQuestionCount,
          difficulty: difficultyLevel,
          questionTypes: questionTypes
        }
      );

      // Create quiz for local storage
      const quizId = uuidv4();
      const quiz: QuizState = {
        questions: generatedQuestions.map(q => ({
          ...q,
          // Generate a hint for each question based on its content and type
          hint: generateHintForQuestion(q)
        })),
        currentQuestion: 0,
        answers: Array(generatedQuestions.length).fill(null),
        result: null,
        status: 'active',
        error: null,
        startTime: Date.now()
      };

      // Save quiz to local storage
      saveQuizToDatabase(quizId, {
        id: quizId,
        title: learningObjectives.substring(0, 50) + (learningObjectives.length > 50 ? "..." : ""),
        objectives: learningObjectives,
        createdAt: new Date().toISOString(),
        questions: quiz.questions,
        difficulty: difficultyLevel,
        isComplete: false
      });

      // Navigate to the quiz practice page
      navigate(`/practice/${quizId}`);
    } catch (error) {
      console.error("Error generating quiz:", error);
      toast.error("生成测试失败。请重试。");
    } finally {
      setIsLoading(false);
    }
  };

  // Generate a hint for each question based on its content and type
  const generateHintForQuestion = (question: QuizQuestion): string => {
    // If the question already has a hint, use it
    if (question.hint) return question.hint;
    
    // Otherwise, generate a hint based on the question type
    if (question.type === 'multiple_choice') {
      return "Try to eliminate obviously incorrect options first. Focus on the key terms in the question.";
    } else {
      const answer = String(question.correctAnswer);
      return `The answer starts with "${answer.charAt(0)}" and has ${answer.length} characters.`;
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>创建自定义测试</CardTitle>
          <CardDescription>
            输入您的学习目标，我们将为您生成相关的测试问题
            {isDemo && (
              <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800 text-sm">
                您正在使用演示版本，最多可生成 {MAX_DEMO_QUESTIONS} 个问题。
                <Button variant="link" className="p-0 h-auto text-blue-600" onClick={() => navigate("/login")}>
                  登录或注册
                </Button> 
                以解锁完整功能。
              </div>
            )}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="learning-objectives" className="text-base">
              学习目标
            </Label>
            <Textarea
              id="learning-objectives"
              placeholder="例如：了解光合作用的过程和重要性"
              value={learningObjectives}
              onChange={(e) => setLearningObjectives(e.target.value)}
              className="mt-1.5 min-h-[100px]"
            />
          </div>
          
          <FileUploader 
            onTextExtracted={handleFileProcessed} 
          />
          
          {uploadedContent && (
            <div className="flex items-center space-x-2">
              <Switch
                id="use-uploaded"
                checked={useUploadedContent}
                onCheckedChange={setUseUploadedContent}
              />
              <Label htmlFor="use-uploaded" className="font-medium">
                将上传的���容用于生成更精确的问题
              </Label>
            </div>
          )}
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Label className="text-base">测试难度</Label>
              <Select
                value={difficultyLevel}
                onValueChange={(value) => setDifficultyLevel(value as "easy" | "medium" | "hard")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">简单</SelectItem>
                  <SelectItem value="medium">中等</SelectItem>
                  <SelectItem value="hard">困难</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-base">问题数量</Label>
                <span className="text-sm font-medium">{isDemo ? Math.min(questionCount, MAX_DEMO_QUESTIONS) : questionCount}</span>
              </div>
              <Slider
                min={1}
                max={isDemo ? MAX_DEMO_QUESTIONS : 15}
                step={1}
                value={[isDemo ? Math.min(questionCount, MAX_DEMO_QUESTIONS) : questionCount]}
                onValueChange={(value) => setQuestionCount(value[0])}
              />
              {isDemo && questionCount > MAX_DEMO_QUESTIONS && (
                <p className="text-sm text-amber-600">
                  演示版本最多允许 {MAX_DEMO_QUESTIONS} 个问题
                </p>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="text-base">问题类型</Label>
            <div className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="multiple-choice"
                  checked={questionTypes.includes("multiple_choice")}
                  onCheckedChange={() => toggleQuestionType("multiple_choice")}
                />
                <label
                  htmlFor="multiple-choice"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  选择题
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="fill-in"
                  checked={questionTypes.includes("fill_in")}
                  onCheckedChange={() => toggleQuestionType("fill_in")}
                />
                <label
                  htmlFor="fill-in"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  填空题
                </label>
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter>
          <Button
            onClick={generateQuiz}
            disabled={isLoading || !learningObjectives.trim()}
            className="w-full"
          >
            {isLoading ? "生成中..." : "生成测试题"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default QuizGenerator;
