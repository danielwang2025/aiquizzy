
import { useEffect, useState } from "react";
import { User } from "@/types/quiz";
import { getCurrentUser } from "@/utils/authService";
import { loadQuizHistory } from "@/utils/historyService";
import { LearningPreferences } from "@/types/quiz";

const defaultPreferences: LearningPreferences = {
  preferredDifficulty: "medium",
  preferredQuestionTypes: ["multiple_choice", "fill_in"],
  topicsOfInterest: [],
  dailyGoal: 10,
  reminderEnabled: false
};

export const useUserProfile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [preferences, setPreferences] = useState<LearningPreferences>(defaultPreferences);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        // Fetch user data
        const currentUser = await getCurrentUser() as User;
        
        // We need to ensure the User from supabase matches the User interface from quiz.ts
        if (currentUser) {
          // Load learning preferences
          const history = loadQuizHistory();
          
          setUser(currentUser as User);
          
          if (history.learningPreferences) {
            setPreferences(history.learningPreferences);
          }
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, []);

  return {
    user,
    preferences,
    setPreferences,
    isLoading
  };
};
