
import React from "react";
import { Button } from "@/components/ui/button";
import { 
  Database, 
  Lock, 
  Users, 
  Server, 
  BellRing, 
  CreditCard,
  X
} from "lucide-react";

interface SupabaseAnnouncementProps {
  onClose: () => void;
}

const SupabaseAnnouncement = ({ onClose }: SupabaseAnnouncementProps) => {
  return (
    <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-lg shadow-lg mb-8">
      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute top-2 right-2 text-white hover:bg-white/20" 
        onClick={onClose}
      >
        <X className="h-5 w-5" />
      </Button>
      
      <div className="flex items-center gap-3 mb-4">
        <Server className="h-8 w-8" />
        <h2 className="text-2xl font-bold">Your app is now connected to Supabase</h2>
      </div>
      
      <p className="mb-4">
        You can now work with a fully featured backend and add powerful features to make your app truly functional.
      </p>
      
      <div className="space-y-4">
        <div className="flex gap-3">
          <div className="bg-white/20 p-2 rounded-full">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold">1. User Accounts and Login</h3>
            <p className="text-blue-100">
              Enable sign-up and login with options like email/password or social logins (Google, Twitter, GitHub).
            </p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <div className="bg-white/20 p-2 rounded-full">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold">2. Store and Use Real Data</h3>
            <p className="text-blue-100">
              Save app data (e.g., user profiles, posts) and show up-to-date info to users.
            </p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <div className="bg-white/20 p-2 rounded-full">
            <Server className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold">3. Add Advanced Features (Edge Functions)</h3>
            <p className="text-blue-100">
              Add features like AI endpoints, email notifications, payments, and scheduled tasks.
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="flex items-center text-xs bg-white/10 rounded-full px-3 py-1">
                <Server className="h-3 w-3 mr-1" /> AI Endpoints
              </span>
              <span className="flex items-center text-xs bg-white/10 rounded-full px-3 py-1">
                <BellRing className="h-3 w-3 mr-1" /> Email Notifications
              </span>
              <span className="flex items-center text-xs bg-white/10 rounded-full px-3 py-1">
                <CreditCard className="h-3 w-3 mr-1" /> Payments
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-4 p-3 bg-indigo-900/50 rounded-md border border-indigo-500/30 flex items-start gap-2">
        <Lock className="h-5 w-5 text-amber-300 mt-0.5 flex-shrink-0" />
        <div>
          <span className="font-medium text-amber-300">Important Note:</span>{" "}
          <span className="text-blue-100">
            Before you deploy your app to production or use any real data, you will need to review and set up 
            the appropriate RLS policies. I can help with that.
          </span>
        </div>
      </div>
      
      <div className="mt-4 text-center">
        <Button 
          variant="outline" 
          className="border-white/30 bg-white/10 text-white hover:bg-white/20"
          onClick={onClose}
        >
          Got it
        </Button>
      </div>
    </div>
  );
};

export default SupabaseAnnouncement;
