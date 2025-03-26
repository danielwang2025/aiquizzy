import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { QuizQuestion, QuizHistory } from "@/types/quiz";
import { saveQuizToDatabase } from "@/utils/databaseService";
import { loadQuizHistory, saveQuizAttempt } from "@/utils/historyService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Trash2 } from "lucide-react";

const QuizGenerator: React.FC = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [newQuestion, setNewQuestion] = useState<QuizQuestion>({
    id: uuidv4(),
    type: "multiple_choice",
    question: "",
    options: ["", "", "", ""],
    correctAnswer: "",
    explanation: "",
    difficulty: "medium",
    topic: "",
    subtopic: ""
  });
  const [title, setTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<QuizHistory>({ attempts: [], reviewList: [], disputedQuestions: [] });
  
  useEffect(() => {
    const loadHistoryData = async () => {
      const historyData = await loadQuizHistory();
      setHistory(historyData);
    };
    loadHistoryData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setNewQuestion({ ...newQuestion, [e.target.name]: e.target.value });
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...newQuestion.options];
    newOptions[index] = value;
    setNewQuestion({ ...newQuestion, options: newOptions });
  };

  const handleAddQuestion = () => {
    if (!newQuestion.question.trim()) {
      toast.error("Question cannot be empty");
      return;
    }
    
    if (newQuestion.type === "multiple_choice") {
      if (!newQuestion.options.every(option => option.trim())) {
        toast.error("All options must be filled");
        return;
      }
      if (newQuestion.correctAnswer === "") {
        toast.error("Please select a correct answer");
        return;
      }
    } else if (newQuestion.type === "fill_in") {
      if (!newQuestion.correctAnswer.trim()) {
        toast.error("Correct answer cannot be empty");
        return;
      }
    }

    setQuestions([...questions, newQuestion]);
    setNewQuestion({
      id: uuidv4(),
      type: "multiple_choice",
      question: "",
      options: ["", "", "", ""],
      correctAnswer: "",
      explanation: "",
      difficulty: "medium",
      topic: "",
      subtopic: ""
    });
    toast.success("Question added successfully");
  };
  
  const handleRemoveQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
    toast.success("Question removed successfully");
  };

  const handleTypeChange = (type: "multiple_choice" | "fill_in") => {
    setNewQuestion({
      ...newQuestion,
      type,
      correctAnswer: "",
      options: type === "multiple_choice" ? ["", "", "", ""] : []
    });
  };

  const handleSubmit = async () => {
    if (questions.length === 0) {
      toast.error("Please add some questions to the quiz");
      return;
    }
    
    if (!title.trim()) {
      toast.error("Please add a title to the quiz");
      return;
    }

    setIsLoading(true);
    try {
      const quizId = await saveQuizToDatabase(questions, title);
      toast.success("Quiz saved successfully");
      
      // Save a dummy attempt to record objectives
      const attemptId = uuidv4();
      const now = new Date().toISOString();
      const dummyAttempt = {
        id: attemptId,
        date: now,
        objectives: title,
        questions: questions,
        userAnswers: [],
        result: {
          totalQuestions: questions.length,
          correctAnswers: 0,
          incorrectAnswers: 0,
          score: 0
        }
      };
      await saveQuizAttempt(dummyAttempt);
      
      navigate(`/practice/${quizId}`);
    } catch (error) {
      console.error("Error saving quiz:", error);
      toast.error("Failed to save quiz");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Create Your Custom Quiz</h1>
      
      <div className="mb-4">
        <Label htmlFor="quizTitle">Quiz Title</Label>
        <Input
          type="text"
          id="quizTitle"
          placeholder="Enter quiz title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Add New Question</CardTitle>
          <CardDescription>Create a new question for your quiz</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="questionType">Question Type</Label>
            <Select onValueChange={(value) => handleTypeChange(value as "multiple_choice" | "fill_in")}>
              <SelectTrigger id="questionType">
                <SelectValue placeholder="Select question type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                <SelectItem value="fill_in">Fill in the Blank</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="questionText">Question Text</Label>
            <Textarea
              id="questionText"
              name="question"
              placeholder="Enter your question"
              value={newQuestion.question}
              onChange={handleInputChange}
            />
          </div>

          {newQuestion.type === "multiple_choice" && (
            <div className="space-y-3">
              {newQuestion.options.map((option, index) => (
                <div key={index} className="space-y-1">
                  <Label htmlFor={`option${index + 1}`}>Option {index + 1}</Label>
                  <Input
                    type="text"
                    id={`option${index + 1}`}
                    placeholder={`Enter option ${index + 1}`}
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                  />
                </div>
              ))}
              <div className="space-y-2">
                <Label htmlFor="correctAnswer">Correct Answer</Label>
                <Select onValueChange={(value) => setNewQuestion({ ...newQuestion, correctAnswer: value })}>
                  <SelectTrigger id="correctAnswer">
                    <SelectValue placeholder="Select correct answer" />
                  </SelectTrigger>
                  <SelectContent>
                    {newQuestion.options.map((option, index) => (
                      <SelectItem key={index} value={index.toString()}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {newQuestion.type === "fill_in" && (
            <div className="space-y-2">
              <Label htmlFor="correctAnswerFillIn">Correct Answer</Label>
              <Input
                type="text"
                id="correctAnswerFillIn"
                name="correctAnswer"
                placeholder="Enter the correct answer"
                value={newQuestion.correctAnswer}
                onChange={handleInputChange}
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="explanation">Explanation (optional)</Label>
            <Textarea
              id="explanation"
              name="explanation"
              placeholder="Enter explanation"
              value={newQuestion.explanation}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="difficulty">Difficulty</Label>
            <Select onValueChange={(value) => setNewQuestion({ ...newQuestion, difficulty: value as "easy" | "medium" | "hard" })}>
              <SelectTrigger id="difficulty">
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="topic">Topic (optional)</Label>
            <Input
              type="text"
              id="topic"
              name="topic"
              placeholder="Enter topic"
              value={newQuestion.topic}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="subtopic">Subtopic (optional)</Label>
            <Input
              type="text"
              id="subtopic"
              name="subtopic"
              placeholder="Enter subtopic"
              value={newQuestion.subtopic}
              onChange={handleInputChange}
            />
          </div>

          <Button onClick={handleAddQuestion}>Add Question</Button>
        </CardContent>
      </Card>

      {questions.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Quiz Questions</h2>
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {questions.map((question) => (
                <Card key={question.id}>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>{question.question}</CardTitle>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => handleRemoveQuestion(question.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <CardDescription>
                      {question.type === "multiple_choice" ? "Multiple Choice" : "Fill in the Blank"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {question.type === "multiple_choice" && (
                      <div className="space-y-2">
                        {question.options.map((option, index) => (
                          <div key={index}>
                            <Label>{option}</Label>
                            {question.correctAnswer === index.toString() && (
                              <span className="text-green-500 ml-2">(Correct Answer)</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    {question.type === "fill_in" && (
                      <div>
                        <Label>Correct Answer: {question.correctAnswer}</Label>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      <Button
        variant="primary"
        size="lg"
        className="mt-6 w-full"
        onClick={handleSubmit}
        disabled={isLoading}
      >
        {isLoading ? "Saving Quiz..." : "Save Quiz and Start Practicing"}
      </Button>
    </div>
  );
};

export default QuizGenerator;
