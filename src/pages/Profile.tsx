import React, { useState, useEffect } from "react";
import { loadQuizHistory, saveQuizHistory } from "@/utils/historyService";
import { getCurrentUser, updateUserProfile } from "@/utils/authService";
import { LearningPreferences, User } from "@/types/quiz";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { BookOpen, User as UserIcon, Settings, Clock, Target, Check, Edit2, Save } from "lucide-react";
import { motion } from "framer-motion";
import { Link, Navigate } from "react-router-dom";
import PasswordManager from "@/components/auth/PasswordManager";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import LoadingSpinner from "@/components/LoadingSpinner";

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
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileEditing, setIsProfileEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
        
        if (userData) {
          setDisplayName(userData.displayName || "");
        }
        
        const history = loadQuizHistory();
        if (history.learningPreferences) {
          setPreferences(history.learningPreferences);
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUserData();
  }, []);
  
  const handleSavePreferences = () => {
    const history = loadQuizHistory();
    history.learningPreferences = preferences;
    saveQuizHistory(history);
    
    toast.success("Learning preferences successfully saved!");
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
  
  const handleUpdateProfile = async () => {
    if (!displayName.trim()) {
      toast.error("Display name cannot be empty");
      return;
    }
    
    try {
      setIsUpdatingProfile(true);
      const updatedUser = await updateUserProfile(displayName);
      setUser(updatedUser);
      setIsProfileEditing(false);
      toast.success("Profile successfully updated");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update profile";
      toast.error(errorMessage);
    } finally {
      setIsUpdatingProfile(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20">
      <main className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <span className="px-4 py-1.5 text-sm font-medium bg-blue-100 text-blue-700 rounded-full inline-block mb-4">Profile Center</span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight text-gradient-primary">Your Profile</h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Manage your account information and learning preference settings
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
          >
            <Card className="hover:shadow-md transition-shadow glass-effect">
              <CardHeader className="pb-2 flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center text-lg">
                    <UserIcon className="h-5 w-5 mr-2 text-blue-500" />
                    User Information
                  </CardTitle>
                </div>
                {!isProfileEditing && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    onClick={() => setIsProfileEditing(true)}
                  >
                    <Edit2 className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {isProfileEditing ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="display_name">Display Name</Label>
                      <Input
                        id="display_name"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Your display name"
                        className="bg-white/50 dark:bg-white/5"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        value={user.email}
                        disabled
                        className="bg-muted/50"
                      />
                      <p className="text-xs text-muted-foreground">Email address cannot be changed</p>
                    </div>
                    
                    <div className="flex justify-end space-x-2 pt-2">
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setIsProfileEditing(false);
                          setDisplayName(user.displayName || "");
                        }}
                        disabled={isUpdatingProfile}
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleUpdateProfile}
                        disabled={isUpdatingProfile}
                      >
                        {isUpdatingProfile ? (
                          <>
                            <LoadingSpinner size="sm" className="mr-2" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Save
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{user.email}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-muted-foreground">Display Name</p>
                      <p className="font-medium">{user.displayName || user.email?.split('@')[0]}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-muted-foreground">Registration Date</p>
                      <p className="font-medium">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-md transition-shadow glass-effect">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-lg">
                  <BookOpen className="h-5 w-5 mr-2 text-emerald-500" />
                  Learning Statistics
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
                    <p className="font-medium capitalize">
                      {preferences.preferredDifficulty === "remember" ? "Remember (Basic)" : 
                       preferences.preferredDifficulty === "understand" ? "Understand" :
                       preferences.preferredDifficulty === "apply" ? "Apply" :
                       preferences.preferredDifficulty === "analyze" ? "Analyze" :
                       preferences.preferredDifficulty === "evaluate" ? "Evaluate" :
                       preferences.preferredDifficulty === "create" ? "Create (Advanced)" : ""}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Preferred Question Types</p>
                    <p className="font-medium capitalize">{preferences.preferredQuestionTypes?.map(t => 
                      t === 'multiple_choice' ? 'Multiple Choice' : 'Fill In'
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
                  <p className="text-muted-foreground text-sm">No focus topics added yet</p>
                )}
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16"
          >
            <div className="space-y-8">
              <h2 className="text-2xl font-semibold text-gradient-primary">Account Security</h2>
              <PasswordManager />
            </div>
            
            <div className="space-y-8">
              <h2 className="text-2xl font-semibold text-gradient-primary">Learning Preferences</h2>
              
              <Card className="neo-card hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="h-5 w-5 mr-2" />
                    Edit Learning Preferences
                  </CardTitle>
                  <CardDescription>
                    Customize your learning style and focus areas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    <div className="space-y-3">
                      <Label htmlFor="difficulty" className="text-base">Preferred Difficulty (Bloom's Taxonomy)</Label>
                      <Select
                        value={preferences.preferredDifficulty}
                        onValueChange={(value) => setPreferences(prev => ({
                          ...prev,
                          preferredDifficulty: value as 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create',
                          preferredBloomLevel: value as 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create'
                        }))}
                      >
                        <SelectTrigger id="difficulty" className="bg-white/50 dark:bg-white/5 h-12">
                          <SelectValue placeholder="Select Difficulty" />
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
                            Multiple Choice
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
                            Fill In
                          </label>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <Label htmlFor="daily_goal" className="text-base">Daily Goal (Questions)</Label>
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
                          placeholder="Add topics (e.g., JavaScript, Physics)"
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
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
