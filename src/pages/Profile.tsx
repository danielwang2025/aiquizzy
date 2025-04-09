
import React, { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
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
        
        // Load learning preferences
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
    
    // Also update user preferences if we had user auth backend
    toast.success("学习偏好已成功保存！");
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
  
  const handleUpdateProfile = async () => {
    if (!displayName.trim()) {
      toast.error("显示名称不能为空");
      return;
    }
    
    try {
      setIsUpdatingProfile(true);
      const updatedUser = await updateUserProfile(displayName);
      setUser(updatedUser);
      setIsProfileEditing(false);
      toast.success("个人资料已成功更新");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "更新个人资料失败";
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
      <Navigation />
      
      <main className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <span className="px-4 py-1.5 text-sm font-medium bg-blue-100 text-blue-700 rounded-full inline-block mb-4">个人中心</span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight text-gradient-primary">您的个人资料</h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              管理您的账户信息和学习偏好设置
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
          >
            {/* User Info Card */}
            <Card className="hover:shadow-md transition-shadow glass-effect">
              <CardHeader className="pb-2 flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center text-lg">
                    <UserIcon className="h-5 w-5 mr-2 text-blue-500" />
                    用户信息
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
                    <span className="sr-only">编辑</span>
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {isProfileEditing ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="display_name">显示名称</Label>
                      <Input
                        id="display_name"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="您的显示名称"
                        className="bg-white/50 dark:bg-white/5"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">电子邮箱</Label>
                      <Input
                        id="email"
                        value={user.email}
                        disabled
                        className="bg-muted/50"
                      />
                      <p className="text-xs text-muted-foreground">邮箱地址无法更改</p>
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
                        取消
                      </Button>
                      <Button 
                        onClick={handleUpdateProfile}
                        disabled={isUpdatingProfile}
                      >
                        {isUpdatingProfile ? (
                          <>
                            <LoadingSpinner size="sm" className="mr-2" />
                            保存中...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            保存
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">电子邮箱</p>
                      <p className="font-medium">{user.email}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-muted-foreground">显示名称</p>
                      <p className="font-medium">{user.displayName || user.email?.split('@')[0]}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-muted-foreground">注册时间</p>
                      <p className="font-medium">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Learning Stats Card */}
            <Card className="hover:shadow-md transition-shadow glass-effect">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-lg">
                  <BookOpen className="h-5 w-5 mr-2 text-emerald-500" />
                  学习统计
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">每日目标</p>
                    <p className="font-medium">{preferences.dailyGoal} 题</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">首选难度</p>
                    <p className="font-medium capitalize">
                      {preferences.preferredDifficulty === "remember" ? "记忆（基础）" : 
                       preferences.preferredDifficulty === "understand" ? "理解" :
                       preferences.preferredDifficulty === "apply" ? "应用" :
                       preferences.preferredDifficulty === "analyze" ? "分析" :
                       preferences.preferredDifficulty === "evaluate" ? "评估" :
                       preferences.preferredDifficulty === "create" ? "创造（进阶）" : ""}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">题型偏好</p>
                    <p className="font-medium capitalize">{preferences.preferredQuestionTypes?.map(t => 
                      t === 'multiple_choice' ? '多选题' : '填空题'
                    ).join('、')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Focus Topics Card */}
            <Card className="hover:shadow-md transition-shadow glass-effect">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-lg">
                  <Target className="h-5 w-5 mr-2 text-red-500" />
                  重点主题
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
                  <p className="text-muted-foreground text-sm">还没有添加重点主题</p>
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
            {/* Password Management */}
            <div className="space-y-8">
              <h2 className="text-2xl font-semibold text-gradient-primary">账户安全</h2>
              <PasswordManager />
            </div>
            
            {/* Learning Preferences */}
            <div className="space-y-8">
              <h2 className="text-2xl font-semibold text-gradient-primary">学习偏好</h2>
              
              <Card className="neo-card hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="h-5 w-5 mr-2" />
                    编辑学习偏好设置
                  </CardTitle>
                  <CardDescription>
                    自定义您的学习方式和重点关注内容
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    <div className="space-y-3">
                      <Label htmlFor="difficulty" className="text-base">首选难度（布鲁姆层级）</Label>
                      <Select
                        value={preferences.preferredDifficulty}
                        onValueChange={(value) => setPreferences(prev => ({
                          ...prev,
                          preferredDifficulty: value as 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create',
                          preferredBloomLevel: value as 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create'
                        }))}
                      >
                        <SelectTrigger id="difficulty" className="bg-white/50 dark:bg-white/5 h-12">
                          <SelectValue placeholder="选择难度" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="remember">记忆（基础）</SelectItem>
                          <SelectItem value="understand">理解</SelectItem>
                          <SelectItem value="apply">应用</SelectItem>
                          <SelectItem value="analyze">分析</SelectItem>
                          <SelectItem value="evaluate">评估</SelectItem>
                          <SelectItem value="create">创造（高级）</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-4">
                      <Label className="text-base">偏好的题型</Label>
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
                            多选题
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
                            填空题
                          </label>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <Label htmlFor="daily_goal" className="text-base">每日目标（题数）</Label>
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
                        <Label htmlFor="topics" className="text-base">感兴趣的主题</Label>
                      </div>
                      <div className="flex">
                        <Input
                          id="topics"
                          value={newTopic}
                          onChange={(e) => setNewTopic(e.target.value)}
                          placeholder="添加主题（例如：JavaScript、物理）"
                          className="rounded-r-none bg-white/50 dark:bg-white/5 h-12"
                        />
                        <Button
                          type="button"
                          onClick={handleAddTopic}
                          className="rounded-l-none btn-3d"
                        >
                          添加
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
                        启用每日练习提醒
                      </label>
                    </div>
                    
                    <Button 
                      className="w-full py-6 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-colors btn-3d"
                      onClick={handleSavePreferences}
                    >
                      <Check className="mr-2 h-4 w-4" />
                      保存偏好设置
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Profile;
