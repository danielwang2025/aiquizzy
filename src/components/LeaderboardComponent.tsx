
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Medal, Clock } from "lucide-react";
import LoadingSpinner from "./LoadingSpinner";

interface LeaderboardEntry {
  id: string;
  quiz_id: string;
  user_name: string;
  score: number;
  completion_time?: number;
  created_at: string;
}

interface LeaderboardComponentProps {
  quizId: string;
}

const LeaderboardComponent: React.FC<LeaderboardComponentProps> = ({ quizId }) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase.functions.invoke("leaderboard", {
          method: "GET",
          path: quizId
        });

        if (error) {
          console.error("Error fetching leaderboard:", error);
          setError("Failed to load leaderboard data");
          return;
        }

        if (data.leaderboard) {
          setLeaderboard(data.leaderboard);
        }
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
        setError("Failed to load leaderboard data");
      } finally {
        setLoading(false);
      }
    };

    if (quizId) {
      fetchLeaderboard();
    }
  }, [quizId]);

  // Format time (seconds) to MM:SS
  const formatTime = (seconds?: number) => {
    if (!seconds) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Format date (ISO string) to readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex justify-center p-4">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4 text-red-500">
        {error}
      </div>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <div className="text-center p-4 text-muted-foreground">
        No one has attempted this quiz yet. Be the first!
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Award className="mr-2 h-5 w-5 text-yellow-500" />
          Quiz Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Rank</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="text-right">Score</TableHead>
              <TableHead className="text-right">Time</TableHead>
              <TableHead className="hidden md:table-cell text-right">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaderboard.map((entry, index) => (
              <TableRow key={entry.id}>
                <TableCell className="font-medium">
                  {index === 0 ? (
                    <span className="flex items-center">
                      <Medal className="mr-1 h-4 w-4 text-yellow-500" />
                      1st
                    </span>
                  ) : index === 1 ? (
                    <span className="flex items-center">
                      <Medal className="mr-1 h-4 w-4 text-gray-400" />
                      2nd
                    </span>
                  ) : index === 2 ? (
                    <span className="flex items-center">
                      <Medal className="mr-1 h-4 w-4 text-amber-600" />
                      3rd
                    </span>
                  ) : (
                    `${index + 1}th`
                  )}
                </TableCell>
                <TableCell>{entry.user_name}</TableCell>
                <TableCell className="text-right font-semibold">{entry.score}%</TableCell>
                <TableCell className="text-right">
                  <span className="flex items-center justify-end">
                    <Clock className="mr-1 h-4 w-4 text-muted-foreground" />
                    {formatTime(entry.completion_time)}
                  </span>
                </TableCell>
                <TableCell className="hidden md:table-cell text-right text-muted-foreground">
                  {formatDate(entry.created_at)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default LeaderboardComponent;
