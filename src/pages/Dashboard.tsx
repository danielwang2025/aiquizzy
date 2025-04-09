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
  Brain,
  Sparkles,
  Zap,
  AreaChart as AreaChartIcon
} from "lucide-react";
import { motion } from "framer-motion";
import Footer from "@/components/Footer";

const fadeIn = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5 }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [timeRange, setTimeRange] = useState<"week" | "month" | "all">("week");
  
  useEffect(() => {
    const history = loadQuizHistory();
    
    if (history.attempts.length === 0) {
      setStats(null);
      return;
    }
    
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
    
    const totalAttempts = filteredAttempts.length;
    let totalQuestions = 0;
    let correctAnswers = 0;
    let totalScore = 0;
    
    const topicMap = new Map<string, { correct: number; total: number }>();
    
    const recentScores: { date: string; score: number }[] = [];
    
    let dailyStreak = 0;
    const dateSet = new Set<string>();
    
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
      
      attempt.questions.forEach(question => {
        if (question.difficulty) {
          difficultyDistribution[question.difficulty]++;
        }
      });
    });
    
    const topicPerformance = Array.from(topicMap.entries())
      .map(([topic, stats]) => ({
        topic,
        correctRate: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
        questionsCount: stats.total
      }))
      .sort((a, b) => b.questionsCount - a.questionsCount);
    
    const mostChallengedTopics = [...topicPerformance]
      .sort((a, b) => a.correctRate - b.correctRate)
      .slice(0, 3)
      .map(t => t.topic);
    
    const dates = Array.from(dateSet).sort();
    let currentStreak = 1;
    
    for (let i = 1; i < dates.length; i++) {
      const prevDate = new Date(dates[i-1]);
      const currDate = new Date(dates[i]);
      
      const diffTime = Math.abs(currDate.getTime() - prevDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        currentStreak++;
      } else {
        currentStreak = 1;
      }
    }
    
    dailyStreak = currentStreak;
    
    const difficultyData = [
      { name: 'Easy', value: difficultyDistribution.easy },
      { name: 'Medium', value: difficultyDistribution.medium },
      { name: 'Hard', value: difficultyDistribution.hard }
    ];
    
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20">
        <Navigation />
        
        <main className="py-20 px-4">
          <div className="container mx-auto max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-16"
            >
              <span className="px-4 py-1.5 text-sm font-medium bg-blue-100 text-blue-700 rounded-full inline-block mb-4">Your Dashboard</span>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight text-gradient-primary">Personal Dashboard</h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Track your progress and manage your learning journey
              </p>
            </motion.div>
            
            <motion.div 
              className="max-w-3xl mx-auto text-center"
              initial="hidden"
              animate="visible"
              variants={fadeIn}
            >
              <p className="text-muted-foreground mb-8">
                You haven't completed any quizzes yet. Take a quiz to see your progress here!
              </p>
              <Button asChild className="bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-700 hover:to-indigo-600 shadow-lg hover:shadow-blue-500/20 transition-all duration-300 rounded-lg">
                <Link to="/customize">Create Your First Quiz</Link>
              </Button>
            </motion.div>
          </div>
        </main>
        
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20">
      <Navigation />
      <main className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <span className="px-4 py-1.5 text-sm font-medium bg-blue-100 text-blue-700 rounded-full inline-block mb-4">Your Dashboard</span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight gradient-text">Personal Dashboard</h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Track your progress and manage your learning journey
            </p>
          </motion.div>
          
          <motion.div 
            className="flex flex-col md:flex-row justify-between items-center mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-bold mb-4 md:mb-0 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Your Learning Dashboard</h1>
            
            <div className="flex items-center gap-4">
              <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as any)} className="bg-white/30 backdrop-blur-sm p-1 rounded-lg shadow-sm border border-white/50">
                <TabsList className="bg-white/30 backdrop-blur-sm">
                  <TabsTrigger value="week" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/80 data-[state=active]:to-indigo-500/80 data-[state=active]:text-white">
                    This Week
                  </TabsTrigger>
                  <TabsTrigger value="month" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/80 data-[state=active]:to-indigo-500/80 data-[state=active]:text-white">
                    This Month
                  </TabsTrigger>
                  <TabsTrigger value="all" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/80 data-[state=active]:to-indigo-500/80 data-[state=active]:text-white">
                    All Time
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              
              <Button 
                asChild 
                variant="outline"
                className="glass-effect bg-white/20 backdrop-blur-sm border-white/30 hover:bg-white/30 transition-all shadow-sm hover:shadow-md"
              >
                <Link to="/customize">
                  New Quiz
                </Link>
              </Button>
            </div>
          </motion.div>
          
          <motion.div
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={fadeIn}>
              <Card glass neo hover className="bg-white/20 backdrop-blur-sm border-white/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Quizzes Completed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <div className="p-2 rounded-full bg-blue-100/50 mr-3">
                      <BookOpen className="h-5 w-5 text-blue-500" />
                    </div>
                    <span className="text-3xl font-bold text-blue-700">{stats.totalAttempts}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div variants={fadeIn}>
              <Card glass neo hover className="bg-white/20 backdrop-blur-sm border-white/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Average Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <div className="p-2 rounded-full bg-amber-100/50 mr-3">
                      <Award className="h-5 w-5 text-amber-500" />
                    </div>
                    <span className="text-3xl font-bold text-amber-600">{stats.averageScore}%</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div variants={fadeIn}>
              <Card glass neo hover className="bg-white/20 backdrop-blur-sm border-white/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Daily Streak</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <div className="p-2 rounded-full bg-green-100/50 mr-3">
                      <Zap className="h-5 w-5 text-green-500" />
                    </div>
                    <span className="text-3xl font-bold text-green-600">{stats.dailyStreak} <span className="text-sm font-normal">day{stats.dailyStreak !== 1 ? 's' : ''}</span></span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div variants={fadeIn}>
              <Card glass neo hover className="bg-white/20 backdrop-blur-sm border-white/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Questions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <div className="p-2 rounded-full bg-purple-100/50 mr-3">
                      <Brain className="h-5 w-5 text-purple-500" />
                    </div>
                    <span className="text-3xl font-bold text-purple-600">{stats.totalQuestions}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <Card glass gradient hover glow bordered className="overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                    <AreaChartIcon className="h-5 w-5 mr-2 text-blue-500" />
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
                                  <div className="glass-effect bg-white/70 backdrop-blur-md p-3 border border-white/30 shadow-lg rounded-md">
                                    <p className="font-medium text-gray-900">{payload[0].payload.date}</p>
                                    <p className="text-blue-600">Score: {payload[0].value}%</p>
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
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <Card glass gradient hover glow bordered className="overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-teal-600">
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
                          <ChartTooltip content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const item = payload[0];
                              return (
                                <div className="glass-effect bg-white/70 backdrop-blur-md p-3 border border-white/30 shadow-lg rounded-md">
                                  <p className="font-medium text-gray-900">{item.name}</p>
                                  <p className="text-blue-600">Questions: {item.value}</p>
                                  <p className="text-blue-600">({((item.payload as any).percent * 100).toFixed(2)}%)</p>
                                </div>
                              );
                            }
                            return null;
                          }} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div 
              className="md:col-span-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <Card glass hover gradient glow bordered className="overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
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
                                  <div className="glass-effect bg-white/70 backdrop-blur-md p-3 border border-white/30 shadow-lg rounded-md">
                                    <p className="font-medium text-gray-900">{payload[0].payload.topic}</p>
                                    <p className="text-blue-600">Correct Rate: {payload[0].value}%</p>
                                    <p className="text-blue-600">Questions: {payload[0].payload.questionsCount}</p>
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
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <Card glass hover gradient glow bordered className="overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600">
                    <Award className="h-5 w-5 mr-2 text-amber-500" />
                    Learning Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] flex flex-col justify-center">
                    <div className="text-center mb-8">
                      <div className="relative inline-block">
                        <div className="absolute inset-0 bg-blue-200 rounded-full blur-lg opacity-30"></div>
                        <div className="text-5xl font-bold text-blue-600 mb-2 relative">{stats.correctAnswers}</div>
                      </div>
                      <div className="text-sm text-muted-foreground">Correct Answers</div>
                    </div>
                    
                    <div className="w-full bg-secondary rounded-full h-4 mb-2 overflow-hidden shadow-inner">
                      <div 
                        className="h-4 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg transition-all duration-1000" 
                        style={{ width: `${stats.averageScore}%` }}
                      ></div>
                    </div>
                    <div className="text-sm text-center text-muted-foreground mb-6">
                      {stats.averageScore}% Average Score
                    </div>
                    
                    <div className="text-center">
                      <Button 
                        asChild
                        className="bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-700 hover:to-indigo-600 shadow-lg hover:shadow-blue-500/20 transition-all duration-300 rounded-lg"
                      >
                        <Link to="/customize">
                          <Sparkles className="h-4 w-4 mr-2" />
                          Practice More
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
          
          {stats.mostChallengedTopics.length > 0 && (
            <motion.div 
              className="mt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
            >
              <h2 className="text-xl font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Improvement Recommendations</h2>
              <Card glass hover gradient glow bordered className="overflow-hidden">
                <CardContent className="p-6">
                  <p className="mb-4">Based on your performance, here are topics you might want to focus on:</p>
                  <ul className="list-disc pl-6 space-y-2 mb-6">
                    {stats.mostChallengedTopics.map((topic, index) => (
                      <li key={index} className="text-gray-700">{topic}</li>
                    ))}
                  </ul>
                  <Button 
                    asChild
                    className="bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-700 hover:to-indigo-600 shadow-lg hover:shadow-blue-500/20 transition-all duration-300 rounded-lg"
                  >
                    <Link to="/customize">
                      <Target className="h-4 w-4 mr-2" />
                      Practice These Topics
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
