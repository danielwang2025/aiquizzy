
import React from "react";
import Navigation from "@/components/Navigation";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import UserInfoCard from "@/components/profile/UserInfoCard";
import LearningStatsCard from "@/components/profile/LearningStatsCard";
import FocusTopicsCard from "@/components/profile/FocusTopicsCard";
import PreferencesForm from "@/components/profile/PreferencesForm";
import LoadingSpinner from "@/components/LoadingSpinner";

const Profile: React.FC = () => {
  const { user, preferences, setPreferences, isLoading } = useUserProfile();
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <Navigation />
        <main className="py-8 px-4 max-w-screen-xl mx-auto">
          <div className="max-w-3xl mx-auto flex justify-center items-center h-[50vh]">
            <LoadingSpinner />
          </div>
        </main>
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
            <UserInfoCard user={user} />
            <LearningStatsCard preferences={preferences} />
            <FocusTopicsCard topics={preferences.topicsOfInterest || []} />
          </div>
          
          <h2 className="text-2xl font-semibold mb-6">Learning Preferences</h2>
          
          <PreferencesForm 
            preferences={preferences} 
            setPreferences={setPreferences} 
          />
        </div>
      </main>
    </div>
  );
};

export default Profile;
