
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import { LearningPreferences } from "@/types/quiz";

interface LearningStatsCardProps {
  preferences: LearningPreferences;
}

const LearningStatsCard: React.FC<LearningStatsCardProps> = ({ preferences }) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-lg">
          <BookOpen className="h-5 w-5 mr-2 text-emerald-500" />
          Learning Stats
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Daily Goal</p>
            <p className="font-medium">{preferences.dailyGoal} questions</p>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Preferred Difficulty</p>
            <p className="font-medium capitalize">{preferences.preferredDifficulty}</p>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Question Types</p>
            <p className="font-medium capitalize">{preferences.preferredQuestionTypes?.map(t => 
              t === 'multiple_choice' ? 'Multiple Choice' : 'Fill-in-the-blank'
            ).join(', ')}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LearningStatsCard;
