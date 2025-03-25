
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import { Lightbulb, ArrowRight, BookOpen, Brain, HelpCircle, School, FileText, Upload } from "lucide-react";
import { generateQuestions } from "@/utils/api";
import { saveQuiz } from "@/utils/databaseService";
import { getRelevantContext, processFileWithRAG } from "@/utils/ragService";
import FileUploader from "./FileUploader";
import { motion } from "framer-motion";
import { hasAllRequiredEnvVars } from "@/utils/envConfig";

interface QuizGeneratorProps {
  initialTopic?: string;
  isDemoMode?: boolean;
}

const QuizGenerator: React.FC<QuizGeneratorProps> = ({ 
  initialTopic = "",
  isDemoMode = false
}) => {
  const [learningObjectives, setLearningObjectives] = useState(initialTopic);
  const [count, setCount] = useState(isDemoMode ? 5 : 10);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [isLoading, setIsLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [questionTypes, setQuestionTypes] = useState<('multiple_choice' | 'fill_in')[]>(['multiple_choice', 'fill_in']);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const fileUploaderRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // In demo mode, limit question count to 5
  useEffect(() => {
    if (isDemoMode && count > 5) {
      setCount(5);
    }
  }, [isDemoMode, count]);

  const handleTopicChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLearningObjectives(e.target.value);
  };

  const handleCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCount = parseInt(e.target.value);
    if (!isNaN(newCount) && newCount > 0) {
      // Limit to 5 questions in demo mode
      if (isDemoMode && newCount > 5) {
        setCount(5);
        toast.info("演示版本限制为最多 5 个问题");
        return;
      }
      setCount(newCount);
    }
  };

  const handleDifficultyChange = (value: string) => {
    setDifficulty(value as 'easy' | 'medium' | 'hard');
  };

  const toggleQuestionType = (type: 'multiple_choice' | 'fill_in') => {
    setQuestionTypes(prev => {
      if (prev.includes(type)) {
        // Don't allow removing the last type
        if (prev.length === 1) {
          return prev;
        }
        return prev.filter(t => t !== type);
      } else {
        return [...prev, type];
      }
    });
  };

  const handleFileUpload = async (content: string, filename: string) => {
    try {
      setIsUploading(true);
      const result = processFileWithRAG(content, filename);
      setUploadedFiles(prev => [...prev, filename]);
      toast.success(`文件 ${filename} 已成功上传并处理`);
    } catch (error) {
      console.error("Error processing file:", error);
      toast.error(`处理文件时出错: ${error}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!learningObjectives.trim()) {
      toast.error("请输入学习目标");
      return;
    }
    
    if (!hasAllRequiredEnvVars()) {
      toast.error("缺少必要的API密钥。请先配置环境变量。");
      document.querySelector<HTMLButtonElement>('[title="配置环境变量"]')?.click();
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Get context from uploaded documents
      let enhancedPrompt = learningObjectives;
      if (uploadedFiles.length > 0) {
        const relevantContext = getRelevantContext(learningObjectives);
        if (relevantContext && relevantContext !== "No relevant information found in the uploaded documents.") {
          enhancedPrompt += "\n\n参考资料:\n" + relevantContext;
        }
      }
      
      // Generate the questions
      const questions = await generateQuestions(enhancedPrompt, {
        count,
        difficulty,
        questionTypes
      });
      
      if (!questions || questions.length === 0) {
        throw new Error("未能生成问题");
      }
      
      const quizTitle = learningObjectives.split(',')[0].trim();
      const quizId = saveQuiz(quizTitle, questions);
      
      toast.success("测验已创建！");
      
      // Navigate to the quiz page
      navigate(`/practice/${quizId}`);
    } catch (error) {
      console.error("Error creating quiz:", error);
      toast.error(`创建测验时出错: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-border"
    >
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="topic" className="block text-lg font-medium">
              你想学习什么？
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className="ml-2 h-6 w-6 p-0 rounded-full">
                    <HelpCircle className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-2">
                    <h4 className="font-medium">提示:</h4>
                    <p className="text-sm">
                      输入具体的学习目标、主题或概念。你越具体，生成的问题就越相关。
                    </p>
                    <p className="text-sm">
                      例如：
                    </p>
                    <ul className="text-sm space-y-1 list-disc pl-4">
                      <li>JavaScript中的闭包概念</li>
                      <li>初级SQL查询和JOIN操作</li>
                      <li>法国大革命的原因和影响</li>
                    </ul>
                  </div>
                </PopoverContent>
              </Popover>
            </label>
            <Textarea
              id="topic"
              placeholder="输入你的学习目标，如：'Python基础语法'、'十九世纪法国文学'、'微积分导数规则'"
              className="resize-none h-28"
              value={learningObjectives}
              onChange={handleTopicChange}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="count" className="block font-medium">
                问题数量
              </label>
              <Input
                id="count"
                type="number"
                min="1"
                max={isDemoMode ? 5 : 20}
                value={count}
                onChange={handleCountChange}
                className="w-full"
              />
              {isDemoMode && (
                <p className="text-xs text-amber-600">演示版本限制为最多 5 个问题</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label htmlFor="difficulty" className="block font-medium">
                难度级别
              </label>
              <Select value={difficulty} onValueChange={handleDifficultyChange}>
                <SelectTrigger id="difficulty">
                  <SelectValue placeholder="选择难度" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">简单</SelectItem>
                  <SelectItem value="medium">中等</SelectItem>
                  <SelectItem value="hard">困难</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full justify-between"
            >
              高级选项
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </Button>
            
            {showAdvanced && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4 space-y-4 border-t pt-4"
              >
                <div className="space-y-2">
                  <label className="block font-medium">问题类型</label>
                  <div className="flex space-x-2">
                    <Button
                      type="button"
                      variant={questionTypes.includes('multiple_choice') ? "default" : "outline"}
                      onClick={() => toggleQuestionType('multiple_choice')}
                      className="flex-1"
                    >
                      <BookOpen className="w-4 h-4 mr-2" />
                      选择题
                    </Button>
                    <Button
                      type="button"
                      variant={questionTypes.includes('fill_in') ? "default" : "outline"}
                      onClick={() => toggleQuestionType('fill_in')}
                      className="flex-1"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      填空题
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="block font-medium">学习资料（可选）</label>
                  <p className="text-sm text-gray-500">
                    上传相关学习材料，以帮助AI生成更有针对性的问题
                  </p>
                  <div ref={fileUploaderRef}>
                    <FileUploader onFileProcessed={handleFileUpload} isLoading={isUploading} />
                  </div>
                  {uploadedFiles.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs font-medium text-gray-500 mb-1">已上传文件:</p>
                      <ul className="text-xs space-y-1">
                        {uploadedFiles.map((file, index) => (
                          <li key={index} className="flex items-center">
                            <Upload className="w-3 h-3 mr-1 text-green-600" />
                            {file}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
          
          <Button 
            type="submit" 
            className="w-full py-6 font-medium shadow-button hover:shadow-button-hover"
            disabled={isLoading || !learningObjectives.trim()}
            data-loading={isLoading}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                生成中...
              </>
            ) : (
              <>
                <Brain className="mr-2 h-5 w-5" />
                生成练习题
              </>
            )}
          </Button>
          
          {isDemoMode && (
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <div className="flex items-start">
                <Lightbulb className="w-5 h-5 text-amber-600 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-amber-800 mb-1">演示模式</h4>
                  <p className="text-sm text-amber-700 mb-2">
                    你正在使用演示版本，最多可生成 5 个问题。注册后可解锁完整功能。
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200"
                    onClick={() => document.querySelector<HTMLButtonElement>('[aria-label="Login / Register"]')?.click()}
                  >
                    <School className="w-4 h-4 mr-1" />
                    注册解锁完整功能
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </form>
    </motion.div>
  );
};

export default QuizGenerator;
