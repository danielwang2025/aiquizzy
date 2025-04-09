import React, { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
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
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const Profile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [preferences, setPreferences] = useState<LearningPreferences>({
    preferredDifficulty: "understand",
    preferredBloomLevel: "understand",
    preferredQuestionTypes: ["multiple_choice", "fill_in"],
    topicsOfInterest: [],
    dailyGoal: 10,
    reminderEnabled: false
  });
  const [newTopic, setNewTopic] = useState("");
  
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
        
        // Load learning preferences
        const history = loadQuizHistory();
        if (history.learningPreferences) {
          setPreferences(history.learningPreferences);
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    };
    
    loadUserData();
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
  
  if (!user) {
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
              <span className="px-4 py-1.5 text-sm font-medium bg-blue-100 text-blue-700 rounded-full inline-block mb-4">Profile</span>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight text-gradient-primary">Your Profile</h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Please log in to view and update your profile
              </p>
            </motion.div>
            
            <div className="max-w-md mx-auto text-center">
              <Button 
                asChild
                className="bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-700 hover:to-indigo-600 shadow-lg hover:shadow-blue-500/20 transition-all duration-300 rounded-lg"
              >
                <Link to="/">Go Back Home</Link>
              </Button>
            </div>
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
            <span className="px-4 py-1.5 text-sm font-medium bg-blue-100 text-blue-700 rounded-full inline-block mb-4">Profile</span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight text-gradient-primary">Your Learning Profile</h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Manage your preferences and track your learning journey
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
          >
            <Card className="hover:shadow-md transition-shadow glass-effect">
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
            
            <Card className="hover:shadow-md transition-shadow glass-effect">
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
            
            <Card className="hover:shadow-md transition-shadow glass-effect">
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
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-2xl font-semibold mb-8 text-gradient-primary">Learning Preferences</h2>
            
            <Card className="neo-card hover:shadow-lg transition-shadow">
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
                <div className="space-y-8">
                  <div className="space-y-3">
                    <Label htmlFor="difficulty" className="text-base">Preferred Difficulty (Bloom's Level)</Label>
                    <Select
                      value={preferences.preferredDifficulty}
                      onValueChange={(value) => setPreferences(prev => ({
                        ...prev,
                        preferredDifficulty: value as 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create',
                        preferredBloomLevel: value as 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create'
                      }))}
                    >
                      <SelectTrigger id="difficulty" className="bg-white/50 dark:bg-white/5 h-12">
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="remember">Remember (Basic)</SelectItem>
                        <SelectItem value="understand">Understand</SelectItem>
                        <SelectItem value="apply">Apply</SelectItem>
                        <SelectItem value="analyze">Analyze</SelectItem>
                        <SelectItem value="evaluate">Evaluate</SelectItem>
                        <SelectItem value="create">Create (Advanced)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-4">
                    <Label className="text-base">Preferred Question Types</Label>
                    <div className="flex flex-col space-y-3">
                      <div className="flex items-center space-x-3">
                        <Checkbox 
                          id="multiple_choice" 
                          checked={preferences.preferredQuestionTypes?.includes('multiple_choice')}
                          onCheckedChange={() => handleToggleQuestionType('multiple_choice')}
                          className="data-[state=checked]:bg-blue-500 h-5 w-5"
                        />
                        <label 
                          htmlFor="multiple_choice"
                          className="text-base font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Multiple Choice Questions
                        </label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Checkbox 
                          id="fill_in" 
                          checked={preferences.preferredQuestionTypes?.includes('fill_in')}
                          onCheckedChange={() => handleToggleQuestionType('fill_in')}
                          className="data-[state=checked]:bg-blue-500 h-5 w-5"
                        />
                        <label 
                          htmlFor="fill_in"
                          className="text-base font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Fill-in-the-blank Questions
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="daily_goal" className="text-base">Daily Goal (questions)</Label>
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
                      className="bg-white/50 dark:bg-white/5 h-12"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="topics" className="text-base">Topics of Interest</Label>
                    </div>
                    <div className="flex">
                      <Input
                        id="topics"
                        value={newTopic}
                        onChange={(e) => setNewTopic(e.target.value)}
                        placeholder="Add a topic (e.g., JavaScript, Physics)"
                        className="rounded-r-none bg-white/50 dark:bg-white/5 h-12"
                      />
                      <Button
                        type="button"
                        onClick={handleAddTopic}
                        className="rounded-l-none btn-3d"
                      >
                        Add
                      </Button>
                    </div>
                    
                    <div className="flex flex-wrap gap-3 mt-4">
                      {preferences.topicsOfInterest?.map((topic, index) => (
                        <div 
                          key={index} 
                          className="bg-secondary rounded-full px-4 py-2 text-sm flex items-center hover:bg-secondary/80 transition-colors"
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
                  
                  <div className="flex items-center space-x-3">
                    <Checkbox 
                      id="reminders"
                      checked={preferences.reminderEnabled}
                      onCheckedChange={(checked) => setPreferences(prev => ({
                        ...prev,
                        reminderEnabled: checked === true
                      }))}
                      className="data-[state=checked]:bg-blue-500 h-5 w-5"
                    />
                    <label 
                      htmlFor="reminders"
                      className="text-base font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Enable daily practice reminders
                    </label>
                  </div>
                  
                  <Button 
                    className="w-full py-6 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-colors btn-3d"
                    onClick={handleSavePreferences}
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Save Preferences
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Profile;
