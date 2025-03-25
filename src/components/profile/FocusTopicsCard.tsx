
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target } from "lucide-react";

interface FocusTopicsCardProps {
  topics: string[];
}

const FocusTopicsCard: React.FC<FocusTopicsCardProps> = ({ topics }) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-lg">
          <Target className="h-5 w-5 mr-2 text-red-500" />
          Focus Topics
        </CardTitle>
      </CardHeader>
      <CardContent>
        {topics && topics.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {topics.map((topic, index) => (
              <div key={index} className="bg-secondary rounded-full px-3 py-1 text-sm">
                {topic}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">No focus topics added yet.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default FocusTopicsCard;
