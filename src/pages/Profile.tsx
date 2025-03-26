
import React, { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { loadQuizHistory, saveQuizHistory } from "@/utils/historyService";
import { getCurrentUser } from "@/utils/authService";
import { LearningPreferences, User } from "@/types/quiz";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { BookOpen, User as UserIcon, Settings, Clock, Target, Check } from "lucide-react";

const Profile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState<LearningPreferences>({
    preferredDifficulty: "medium",
    preferredQuestionTypes: ["multiple_choice", "fill_in"],
    topicsOfInterest: [],
    dailyGoal: 10,
    reminderEnabled: false
  });
  const [newTopic, setNewTopic] = useState("");
  
  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      const currentUser = await getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        
        // Load learning preferences
        const history = loadQuizHistory();
        if (history.learningPreferences) {
          setPreferences(history.learningPreferences);
        }
      }
      setLoading(false);
    };
    
    fetchUser();
  }, []);
  
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
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <Navigation />
        <div className="max-w-md mx-auto text-center py-12">
          <h1 className="text-3xl font-bold mb-6">Loading profile...</h1>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <Navigation />
        
        <main className="py-8 px-4 max-w-screen-xl mx-auto">
          <div className="max-w-md mx-auto text-center">
            <h1 className="text-3xl font-bold mb-6">Your Profile</h1>
            <p className="text-muted-foreground mb-8">
              Please log in to view and update your profile.
            </p>
          </div>
        </main>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <Navigation />
      
      <main className="py-8 px-4 max-w-screen-xl mx-auto">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center">Your Learning Profile</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-lg">
                  <UserIcon className="h-5 w-5 mr-2 text-blue-500" />
                  User Info
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{user.email}</p>
                  
                  {user.displayName && (
                    <>
                      <p className="text-sm text-muted-foreground mt-4">Display Name</p>
                      <p className="font-medium">{user.displayName}</p>
                    </>
                  )}
                  
                  <p className="text-sm text-muted-foreground mt-4">Member Since</p>
                  <p className="font-medium">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
            
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
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-lg">
                  <Target className="h-5 w-5 mr-2 text-red-500" />
                  Focus Topics
                </CardTitle>
              </CardHeader>
              <CardContent>
                {preferences.topicsOfInterest && preferences.topicsOfInterest.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {preferences.topicsOfInterest.map((topic, index) => (
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
          </div>
          
          <h2 className="text-2xl font-semibold mb-6">Learning Preferences</h2>
          
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
        </div>
      </main>
    </div>
  );
};

export default Profile;
