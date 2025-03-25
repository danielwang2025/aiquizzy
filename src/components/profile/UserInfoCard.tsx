
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User as UserIcon } from "lucide-react";
import { User } from "@/types/supabase";

interface UserInfoCardProps {
  user: User | null;
}

const UserInfoCard: React.FC<UserInfoCardProps> = ({ user }) => {
  if (!user) return null;
  
  return (
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
  );
};

export default UserInfoCard;
