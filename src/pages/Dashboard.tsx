
import React, { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { loadQuizHistory } from "@/utils/historyService";
import { QuizAttempt, DashboardStats } from "@/types/quiz";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { format, subDays } from "date-fns";
import { Link } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
  RadialBarChart,
  RadialBar,
  Area,
  AreaChart,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, 
  BarChart2, 
  Calendar, 
  TrendingUp, 
  PieChart as PieChartIcon, 
  Clock,
  Award,
  Target,
  Brain
} from "lucide-react";

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [timeRange, setTimeRange] = useState<"week" | "month" | "all">("week");
  
  useEffect(() => {
    const history = loadQuizHistory();
    
    if (history.attempts.length === 0) {
      setStats(null);
      return;
    }
    
    // Filter attempts by time range
    let filteredAttempts = [...history.attempts];
    
    if (timeRange === "week") {
      const oneWeekAgo = subDays(new Date(), 7);
      filteredAttempts = filteredAttempts.filter(attempt => 
        new Date(attempt.date) >= oneWeekAgo
      );
    } else if (timeRange === "month") {
      const oneMonthAgo = subDays(new Date(), 30);
      filteredAttempts = filteredAttempts.filter(attempt => 
        new Date(attempt.date) >= oneMonthAgo
      );
    }
    
    // Calculate stats from filtered attempts
    const totalAttempts = filteredAttempts.length;
    let totalQuestions = 0;
    let correctAnswers = 0;
    let totalScore = 0;
    
    // Topic tracking
    const topicMap = new Map<string, { correct: number; total: number }>();
    
    // Recent scores for chart
    const recentScores: { date: string; score: number }[] = [];
    
    // Calculate daily streak
    let dailyStreak = 0;
    const dateSet = new Set<string>();
    
    // Difficulty distribution
    const difficultyDistribution = {
      easy: 0,
      medium: 0,
      hard: 0
    };
    
    filteredAttempts.forEach(attempt => {
      const formattedDate = format(new Date(attempt.date), "yyyy-MM-dd");
      dateSet.add(formattedDate);
      
      totalQuestions += attempt.questions.length;
      correctAnswers += attempt.result.correctAnswers;
      totalScore += attempt.result.score;
      
      recentScores.push({
        date: format(new Date(attempt.date), "MM/dd"),
        score: attempt.result.score
      });
      
      // Process topics
      const topics = attempt.objectives.split(',').map(t => t.trim());
      topics.forEach(topic => {
        if (!topic) return;
        
        if (!topicMap.has(topic)) {
          topicMap.set(topic, { correct: 0, total: 0 });
        }
        
        const topicStats = topicMap.get(topic)!;
        topicStats.correct += attempt.result.correctAnswers;
        topicStats.total += attempt.questions.length;
      });
      
      // Count difficulty distribution
      attempt.questions.forEach(question => {
        if (question.difficulty) {
          difficultyDistribution[question.difficulty]++;
        }
      });
    });
    
    // Convert topics to array for stats
    const topicPerformance = Array.from(topicMap.entries())
      .map(([topic, stats]) => ({
        topic,
        correctRate: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
        questionsCount: stats.total
      }))
      .sort((a, b) => b.questionsCount - a.questionsCount);
    
    // Calculate most challenged topics (lowest correctRate)
    const mostChallengedTopics = [...topicPerformance]
      .sort((a, b) => a.correctRate - b.correctRate)
      .slice(0, 3)
      .map(t => t.topic);
    
    // Calculate streak
    const dates = Array.from(dateSet).sort();
    let currentStreak = 1;
    
    for (let i = 1; i < dates.length; i++) {
      const prevDate = new Date(dates[i-1]);
      const currDate = new Date(dates[i]);
      
      // Check if dates are consecutive
      const diffTime = Math.abs(currDate.getTime() - prevDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        currentStreak++;
      } else {
        currentStreak = 1;
      }
    }
    
    dailyStreak = currentStreak;
    
    // Format difficulty distribution for chart
    const difficultyData = [
      { name: 'Easy', value: difficultyDistribution.easy },
      { name: 'Medium', value: difficultyDistribution.medium },
      { name: 'Hard', value: difficultyDistribution.hard }
    ];
    
    // Put everything together
    setStats({
      totalAttempts,
      totalQuestions,
      correctAnswers,
      averageScore: totalAttempts > 0 ? Math.round(totalScore / totalAttempts) : 0,
      topicPerformance,
      recentScores,
      dailyStreak,
      lastPracticeDate: filteredAttempts.length > 0 ? filteredAttempts[0].date : undefined,
      mostChallengedTopics
    });
    
  }, [timeRange]);
  
  const COLORS = ["#4f46e5", "#3b82f6", "#0ea5e9", "#06b6d4", "#14b8a6", "#10b981"];
  const DIFFICULTY_COLORS = {
    Easy: "#10b981", // Green
    Medium: "#f59e0b", // Amber
    Hard: "#ef4444"  // Red
  };
  
  if (!stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <Navigation />
        
        <main className="py-8 px-4 max-w-screen-xl mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl font-bold mb-6">Your Learning Dashboard</h1>
            <p className="text-muted-foreground mb-8">
              You haven't completed any quizzes yet. Take a quiz to see your progress here!
            </p>
            <Button asChild>
              <Link to="/customize">Create Your First Quiz</Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <Navigation />
      
      <main className="py-8 px-4 max-w-screen-xl mx-auto">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <h1 className="text-3xl font-bold mb-4 md:mb-0">Your Learning Dashboard</h1>
            
            <div className="flex items-center gap-4">
              <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as any)}>
                <TabsList>
                  <TabsTrigger value="week">This Week</TabsTrigger>
                  <TabsTrigger value="month">This Month</TabsTrigger>
                  <TabsTrigger value="all">All Time</TabsTrigger>
                </TabsList>
              </Tabs>
              
              <Button asChild variant="outline">
                <Link to="/customize">
                  New Quiz
                </Link>
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Quizzes Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <BookOpen className="h-5 w-5 text-blue-500 mr-2" />
                  <span className="text-3xl font-bold">{stats.totalAttempts}</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Average Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Award className="h-5 w-5 text-amber-500 mr-2" />
                  <span className="text-3xl font-bold">{stats.averageScore}%</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Daily Streak</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <TrendingUp className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-3xl font-bold">{stats.dailyStreak} day{stats.dailyStreak !== 1 ? 's' : ''}</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Brain className="h-5 w-5 text-purple-500 mr-2" />
                  <span className="text-3xl font-bold">{stats.totalQuestions}</span>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-blue-500" />
                  Learning Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ChartContainer config={{}}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={stats.recentScores.slice(-10)}>
                        <defs>
                          <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                        <YAxis 
                          domain={[0, 100]} 
                          stroke="#6b7280" 
                          fontSize={12} 
                          tickFormatter={(value) => `${value}%`}
                        />
                        <ChartTooltip 
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-white p-2 border border-gray-200 shadow-sm rounded-md">
                                  <p className="font-medium">{payload[0].payload.date}</p>
                                  <p>Score: {payload[0].value}%</p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="score" 
                          stroke="#4f46e5" 
                          fillOpacity={1}
                          fill="url(#scoreGradient)" 
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2 text-green-500" />
                  Topic Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ChartContainer config={{}}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats.topicPerformance.slice(0, 5).map(t => ({
                            name: t.topic,
                            value: t.questionsCount
                          }))}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={90}
                          innerRadius={40}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {stats.topicPerformance.slice(0, 5).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <ChartTooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="md:col-span-2 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart2 className="h-5 w-5 mr-2 text-purple-500" />
                  Topic Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ChartContainer config={{}}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={stats.topicPerformance.slice(0, 6)}
                        margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                        barCategoryGap={20}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                          dataKey="topic" 
                          stroke="#6b7280" 
                          fontSize={12} 
                          angle={-45} 
                          textAnchor="end" 
                          height={60} 
                        />
                        <YAxis 
                          domain={[0, 100]} 
                          stroke="#6b7280" 
                          fontSize={12} 
                          tickFormatter={(value) => `${value}%`}
                        />
                        <ChartTooltip 
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-white p-2 border border-gray-200 shadow-sm rounded-md">
                                  <p className="font-medium">{payload[0].payload.topic}</p>
                                  <p>Correct Rate: {payload[0].value}%</p>
                                  <p>Questions: {payload[0].payload.questionsCount}</p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Bar 
                          dataKey="correctRate" 
                          fill="url(#colorGradient)" 
                          name="Correct Rate" 
                          radius={[4, 4, 0, 0]}
                        >
                          <defs>
                            <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.8}/>
                              <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                            </linearGradient>
                          </defs>
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="h-5 w-5 mr-2 text-amber-500" />
                  Learning Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex flex-col justify-center">
                  <div className="text-center mb-8">
                    <div className="text-5xl font-bold text-blue-600 mb-2">{stats.correctAnswers}</div>
                    <div className="text-sm text-muted-foreground">Correct Answers</div>
                  </div>
                  
                  <div className="w-full bg-secondary rounded-full h-4 mb-2">
                    <div 
                      className="h-4 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600" 
                      style={{ width: `${stats.averageScore}%` }}
                    ></div>
                  </div>
                  <div className="text-sm text-center text-muted-foreground mb-6">
                    {stats.averageScore}% Average Score
                  </div>
                  
                  <div className="text-center">
                    <Button asChild>
                      <Link to="/customize">Practice More</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {stats.mostChallengedTopics.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Improvement Recommendations</h2>
              <div className="bg-white/80 backdrop-blur-sm border border-border rounded-lg p-6">
                <p className="mb-4">Based on your performance, here are topics you might want to focus on:</p>
                <ul className="list-disc pl-6 space-y-2 mb-6">
                  {stats.mostChallengedTopics.map((topic, index) => (
                    <li key={index}>{topic}</li>
                  ))}
                </ul>
                <Button asChild>
                  <Link to="/customize">Practice These Topics</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
