
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Check, Settings } from "lucide-react";
import { LearningPreferences } from "@/types/quiz";
import { loadQuizHistory, saveQuizHistory } from "@/utils/historyService";

interface PreferencesFormProps {
  preferences: LearningPreferences;
  setPreferences: React.Dispatch<React.SetStateAction<LearningPreferences>>;
}

const PreferencesForm: React.FC<PreferencesFormProps> = ({ preferences, setPreferences }) => {
  const [newTopic, setNewTopic] = useState("");
  
  const handleSavePreferences = () => {
    const history = loadQuizHistory();
    history.learningPreferences = preferences;
    saveQuizHistory(history);
    
    // Also update user preferences if we had user auth backend
    toast.success("Learning preferences saved successfully!");
  };
  
  const handleAddTopic = () => {
    if (!newTopic.trim()) return;
    
    if (!preferences.topicsOfInterest?.includes(newTopic)) {
      setPreferences(prev => ({
        ...prev,
        topicsOfInterest: [...(prev.topicsOfInterest || []), newTopic.trim()]
      }));
      setNewTopic("");
    }
  };
  
  const handleRemoveTopic = (topic: string) => {
    setPreferences(prev => ({
      ...prev,
      topicsOfInterest: prev.topicsOfInterest?.filter(t => t !== topic) || []
    }));
  };
  
  const handleToggleQuestionType = (type: 'multiple_choice' | 'fill_in') => {
    setPreferences(prev => {
      const currentTypes = prev.preferredQuestionTypes || [];
      
      if (currentTypes.includes(type)) {
        // Don't allow removing if it's the last type
        if (currentTypes.length === 1) {
          return prev;
        }
        return {
          ...prev,
          preferredQuestionTypes: currentTypes.filter(t => t !== type)
        };
      } else {
        return {
          ...prev,
          preferredQuestionTypes: [...currentTypes, type]
        };
      }
    });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Settings className="h-5 w-5 mr-2" />
          Edit Your Learning Preferences
        </CardTitle>
        <CardDescription>
          Customize how you want to learn and what you want to focus on
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="difficulty">Preferred Difficulty</Label>
            <Select
              value={preferences.preferredDifficulty}
              onValueChange={(value) => setPreferences(prev => ({
                ...prev,
                preferredDifficulty: value as 'easy' | 'medium' | 'hard'
              }))}
            >
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
          
          <div className="space-y-3">
            <Label>Preferred Question Types</Label>
            <div className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="multiple_choice" 
                  checked={preferences.preferredQuestionTypes?.includes('multiple_choice')}
                  onCheckedChange={() => handleToggleQuestionType('multiple_choice')}
                />
                <label 
                  htmlFor="multiple_choice"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Multiple Choice Questions
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="fill_in" 
                  checked={preferences.preferredQuestionTypes?.includes('fill_in')}
                  onCheckedChange={() => handleToggleQuestionType('fill_in')}
                />
                <label 
                  htmlFor="fill_in"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Fill-in-the-blank Questions
                </label>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="daily_goal">Daily Goal (questions)</Label>
            <Input
              id="daily_goal"
              type="number"
              min="1"
              max="100"
              value={preferences.dailyGoal}
              onChange={(e) => setPreferences(prev => ({
                ...prev,
                dailyGoal: parseInt(e.target.value) || 10
              }))}
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="topics">Topics of Interest</Label>
            </div>
            <div className="flex">
              <Input
                id="topics"
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                placeholder="Add a topic (e.g., JavaScript, Physics)"
                className="rounded-r-none"
              />
              <Button
                type="button"
                onClick={handleAddTopic}
                className="rounded-l-none"
              >
                Add
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-3">
              {preferences.topicsOfInterest?.map((topic, index) => (
                <div 
                  key={index} 
                  className="bg-secondary rounded-full px-3 py-1 text-sm flex items-center"
                >
                  {topic}
                  <button 
                    className="ml-2 text-muted-foreground hover:text-foreground"
                    onClick={() => handleRemoveTopic(topic)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="reminders"
              checked={preferences.reminderEnabled}
              onCheckedChange={(checked) => setPreferences(prev => ({
                ...prev,
                reminderEnabled: checked === true
              }))}
            />
            <label 
              htmlFor="reminders"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Enable daily practice reminders
            </label>
          </div>
          
          <Button 
            className="w-full"
            onClick={handleSavePreferences}
          >
            <Check className="mr-2 h-4 w-4" />
            Save Preferences
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PreferencesForm;
