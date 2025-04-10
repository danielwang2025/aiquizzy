import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { generateQuizQuestions } from "@/utils/quizService";
import { Question } from "@/types/quiz";
import { saveQuiz } from "@/utils/historyService";
import { useNavigate } from "react-router-dom";
import { useSubscription } from "@/hooks/use-subscription";
import SubscriptionBanner from "@/components/SubscriptionBanner";
import { checkApiKeysValid } from "@/utils/apiService";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Copy, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";

const formSchema = z.object({
  objectives: z.string().min(10, {
    message: "Objectives must be at least 10 characters.",
  }),
  questionCount: z.number().min(1, {
    message: "You must generate at least one question.",
  }),
  questionType: z.string().optional(),
  difficulty: z.string().optional(),
  bloomsTaxonomyLevel: z.string().optional(),
  useCase: z.string().optional(),
  includeExplanations: z.boolean().default(true).optional(),
  apiKey: z.string().optional(),
});

const QuizGenerator = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const subscription = useSubscription();
  const isPro = subscription?.tier === "premium";
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [isApiKeyValid, setIsApiKeyValid] = useState(true);
  const [apiKey, setApiKey] = useState<string | undefined>(localStorage.getItem('openAiApiKey') || undefined);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isApiKeySaved, setIsApiKeySaved] = useState(!!localStorage.getItem('openAiApiKey'));

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      objectives: "",
      questionCount: 5,
      questionType: "Multiple Choice",
      difficulty: "Medium",
      bloomsTaxonomyLevel: "Understand",
      useCase: "Test Preparation",
      includeExplanations: true,
      apiKey: apiKey,
    },
  });

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setApiKey(e.target.value);
  };

  const saveApiKeyToLocalStorage = () => {
    if (apiKey) {
      localStorage.setItem('openAiApiKey', apiKey);
      setIsApiKeySaved(true);
      toast({
        title: "API Key Saved",
        description: "Your API key has been successfully saved.",
      });
    }
  };

  const removeApiKeyFromLocalStorage = () => {
    localStorage.removeItem('openAiApiKey');
    setApiKey(undefined);
    setIsApiKeySaved(false);
    toast({
      title: "API Key Removed",
      description: "Your API key has been successfully removed.",
    });
  };

  useEffect(() => {
    const storedApiKey = localStorage.getItem('openAiApiKey');
    if (storedApiKey) {
      setApiKey(storedApiKey);
      form.setValue('apiKey', storedApiKey);
      setIsApiKeySaved(true);
    }
  }, [form]);

  const checkApiKeyStatus = async () => {
    try {
      const isValid = await checkApiKeysValid();
      setIsApiKeyValid(isValid); // Fix: don't set Promise as state
    } catch (error) {
      console.error("Error checking API key status:", error);
      setIsApiKeyValid(false);
    }
  };

  useEffect(() => {
    checkApiKeyStatus();
  }, []);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!isPro && values.questionCount > 5) {
      return toast({
        title: "Too many questions",
        description: "Free users can only generate up to 5 questions. Upgrade to premium to generate more.",
      });
    }

    setIsLoading(true);
    setGenerationProgress(0);
    setQuestions([]);

    try {
      const generatedQuestions = await generateQuizQuestions(
        values.objectives,
        values.questionCount,
        values.questionType,
        values.difficulty,
        values.bloomsTaxonomyLevel,
        values.useCase,
        values.includeExplanations,
        (progress: number) => {
          setGenerationProgress(progress);
        }
      );

      setQuestions(generatedQuestions);

      // Save quiz to history
      saveQuiz(values.objectives, generatedQuestions);

      toast({
        title: "Quiz Generated",
        description: "Your quiz has been successfully generated.",
      });

      // Redirect to practice page
      navigate(`/practice`);
    } catch (error: any) {
      console.error("Error generating quiz:", error);

      let errorMessage = "Failed to generate quiz. Please try again.";

      if (error.message.includes("OPENAI_API_KEY")) {
        errorMessage = "Invalid OpenAI API Key. Please check your API key and try again.";
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setGenerationProgress(0);
    }
  };

  const copyQuestionToClipboard = (questionText: string) => {
    navigator.clipboard.writeText(questionText);
    toast({
      title: "Question Copied",
      description: "The question has been copied to your clipboard.",
    });
  };

  return (
    <div className="container mx-auto py-10">
      <SubscriptionBanner remainingQuestions={subscription?.remainingQuestions || 0} subscription={subscription} />

      <Card className="glass-card mb-8">
        <CardHeader>
          <CardTitle>Quiz Generator</CardTitle>
          <CardDescription>Enter your quiz parameters to generate custom questions.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="objectives"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Learning Objectives</FormLabel>
                    <FormDescription>
                      What specific topics or skills should the quiz cover?
                    </FormDescription>
                    <FormControl>
                      <Textarea placeholder="E.g., React basics, JavaScript ES6 syntax..." className="resize-none" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="questionCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Questions</FormLabel>
                      <FormDescription>How many questions do you want to generate?</FormDescription>
                      <FormControl>
                        <Input type="number" defaultValue={5} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="questionType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Question Type</FormLabel>
                      <FormDescription>What type of questions do you prefer?</FormDescription>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a question type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Multiple Choice">Multiple Choice</SelectItem>
                          <SelectItem value="Fill in the Blank">Fill in the Blank</SelectItem>
                          <SelectItem value="True/False">True/False</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="difficulty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Difficulty</FormLabel>
                      <FormDescription>How difficult should the questions be?</FormDescription>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select difficulty" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Easy">Easy</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="Hard">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bloomsTaxonomyLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bloom's Taxonomy Level</FormLabel>
                      <FormDescription>What level of cognitive skill should the questions target?</FormDescription>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Remember">Remember</SelectItem>
                          <SelectItem value="Understand">Understand</SelectItem>
                          <SelectItem value="Apply">Apply</SelectItem>
                          <SelectItem value="Analyze">Analyze</SelectItem>
                          <SelectItem value="Evaluate">Evaluate</SelectItem>
                          <SelectItem value="Create">Create</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="useCase"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Use Case</FormLabel>
                    <FormDescription>What is the intended use case for the quiz?</FormDescription>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a use case" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Test Preparation">Test Preparation</SelectItem>
                        <SelectItem value="Knowledge Assessment">Knowledge Assessment</SelectItem>
                        <SelectItem value="Training">Training</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="includeExplanations"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-md border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>Include Explanations</FormLabel>
                      <FormDescription>Should the quiz include explanations for the correct answers?</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    Generating...
                    <Progress value={generationProgress} className="mt-2" />
                  </>
                ) : (
                  "Generate Quiz"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {questions.length > 0 && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Generated Questions</CardTitle>
            <CardDescription>Review the generated questions and start practicing.</CardDescription>
          </CardHeader>
          <CardContent>
            <Separator className="my-4" />
            <ol className="list-decimal pl-6 space-y-4">
              {questions.map((question, index) => (
                <li key={index} className="mb-4">
                  <div className="flex justify-between items-start">
                    <p className="font-semibold">{question.text}</p>
                    <Button variant="ghost" size="icon" onClick={() => copyQuestionToClipboard(question.text)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  {question.options && question.options.length > 0 && (
                    <ul className="list-none pl-0 mt-2">
                      {question.options.map((option, optionIndex) => (
                        <li key={optionIndex} className="flex items-center">
                          <span className="mr-2">{String.fromCharCode(65 + optionIndex)}.</span>
                          <span>{option}</span>
                          {question.correctAnswer === option && (
                            <Badge className="ml-2 bg-green-100 text-green-700 border-none">
                              Correct
                              <CheckCircle className="h-4 w-4 ml-1" />
                            </Badge>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                  {question.explanation && (
                    <Accordion type="single" collapsible className="w-full mt-3">
                      <AccordionItem value={`explanation-${index}`}>
                        <AccordionTrigger>Explanation</AccordionTrigger>
                        <AccordionContent>{question.explanation}</AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  )}
                </li>
              ))}
            </ol>
          </CardContent>
          <CardFooter>
            <Button onClick={() => navigate(`/practice`)} className="w-full">Start Practice</Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default QuizGenerator;
