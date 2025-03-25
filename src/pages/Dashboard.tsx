
import React, { useState, useEffect } from 'react';
import { QuizHistory, DashboardStats } from '@/types/quiz';
import { loadQuizHistory } from '@/utils/historyService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Legend 
} from 'recharts';
import { ChartContainer } from "@/components/ui/chart";

const Dashboard: React.FC = () => {
  const [history, setHistory] = useState<QuizHistory>({ attempts: [], reviewList: [], disputedQuestions: [] });
  const [stats, setStats] = useState<DashboardStats>({
    totalAttempts: 0,
    totalQuestions: 0,
    correctAnswers: 0,
    avgScore: 0,
    topicPerformance: [],
    recentScores: [],
    dailyStreak: 0,
    mostChallengedTopics: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadedHistory = loadQuizHistory();
    setHistory(loadedHistory);
    const calculatedStats = calculateStats(loadedHistory);
    setStats(calculatedStats);
    setIsLoading(false);
  }, []);

  // Function to calculate daily streak
  const calculateStreak = (attempts: any[]): number => {
    let streak = 0;
    let lastDate = null;

    // Sort attempts by date in descending order
    const sortedAttempts = [...attempts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    for (const attempt of sortedAttempts) {
      const attemptDate = new Date(attempt.date);
      const currentDate = new Date(attemptDate.getFullYear(), attemptDate.getMonth(), attemptDate.getDate());

      if (!lastDate) {
        streak++;
        lastDate = currentDate;
      } else {
        const timeDiff = lastDate.getTime() - currentDate.getTime();
        const dayDiff = timeDiff / (1000 * 3600 * 24);

        if (dayDiff === 1) {
          streak++;
          lastDate = currentDate;
        } else {
          break; // Streak broken
        }
      }
    }

    return streak;
  };

  // Calculate dashboard statistics from quiz history
  const calculateStats = (history: QuizHistory): DashboardStats => {
    const attempts = history.attempts || [];
    
    if (attempts.length === 0) {
      return {
        totalAttempts: 0,
        totalQuestions: 0,
        correctAnswers: 0,
        avgScore: 0,
        topicPerformance: [],
        recentScores: [],
        dailyStreak: 0,
        mostChallengedTopics: []
      };
    }
    
    // Calculate total questions and correct answers
    let totalQuestions = 0;
    let correctAnswers = 0;
    
    // Track topic performance
    const topicMap = new Map<string, { correct: number; total: number }>();
    
    // Process all attempts
    attempts.forEach(attempt => {
      totalQuestions += attempt.questions.length;
      correctAnswers += attempt.result.correctAnswers;
      
      // Process topics
      attempt.questions.forEach((question, index) => {
        const topic = question.topic || 'Uncategorized';
        const isCorrect = attempt.userAnswers[index] === question.correctAnswer;
        
        if (!topicMap.has(topic)) {
          topicMap.set(topic, { correct: 0, total: 0 });
        }
        
        const topicStats = topicMap.get(topic)!;
        topicStats.total += 1;
        if (isCorrect) {
          topicStats.correct += 1;
        }
      });
    });
    
    // Calculate average score
    const avgScore = Math.round((correctAnswers / totalQuestions) * 100) || 0;
    
    // Get recent scores (last 7 attempts or fewer)
    const recentScores = attempts
      .slice(0, 7)
      .map(attempt => attempt.result.score);
    
    // Calculate daily streak
    const streak = calculateStreak(attempts);
    
    // Find most challenged topics (lowest correctness rate)
    const topicPerformance = Array.from(topicMap.entries())
      .map(([topic, stats]) => ({
        topic,
        correctRate: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
        questionsCount: stats.total
      }))
      .sort((a, b) => a.correctRate - b.correctRate);
    
    const mostChallengedTopics = topicPerformance
      .slice(0, 3)
      .map(t => t.topic);
    
    return {
      totalAttempts: attempts.length,
      totalQuestions,
      correctAnswers,
      avgScore,
      topicPerformance,
      recentScores,
      dailyStreak: streak,
      mostChallengedTopics
    };
  };

  // Format chart data for recharts
  const chartData = stats.recentScores.map((score, index) => ({
    name: `Attempt ${index + 1}`,
    score: score
  })).reverse();

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-semibold mb-6">Dashboard</h1>

      {isLoading ? (
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-card rounded-xl p-4 border">
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-12 w-20" />
            </div>
          ))}
        </div>
      ) : (
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            {/* Total Attempts */}
            <div className="bg-card rounded-xl p-4 border">
              <h3 className="font-medium text-muted-foreground mb-1 text-sm">Total Attempts</h3>
              <p className="text-3xl font-bold">{stats.totalAttempts}</p>
            </div>
            
            {/* Average Score */}
            <div className="bg-card rounded-xl p-4 border">
              <h3 className="font-medium text-muted-foreground mb-1 text-sm">Average Score</h3>
              <p className="text-3xl font-bold">{stats.avgScore}%</p>
            </div>
            
            {/* Daily Streak */}
            <div className="bg-card rounded-xl p-4 border">
              <h3 className="font-medium text-muted-foreground mb-1 text-sm">Daily Streak</h3>
              <p className="text-3xl font-bold">{stats.dailyStreak}</p>
            </div>
            
            {/* Total Questions */}
            <div className="bg-card rounded-xl p-4 border">
              <h3 className="font-medium text-muted-foreground mb-1 text-sm">Total Questions</h3>
              <p className="text-3xl font-bold">{stats.totalQuestions}</p>
            </div>
          </div>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Recent Scores</CardTitle>
          <CardDescription>Your performance over the last 7 attempts</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-[300px]" />
          ) : (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    name="Score" 
                    stroke="#3b82f6" 
                    fill="#3b82f6" 
                    strokeWidth={2}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Most Challenged Topics</CardTitle>
          <CardDescription>Topics where you have the lowest correctness rate</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
          ) : (
            <ul className="list-disc list-inside">
              {stats.mostChallengedTopics.length > 0 ? (
                stats.mostChallengedTopics.map((topic, index) => (
                  <li key={index}>{topic}</li>
                ))
              ) : (
                <li>No data available</li>
              )}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
