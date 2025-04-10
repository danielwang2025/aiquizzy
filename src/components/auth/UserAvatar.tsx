
import React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User as UserType } from "@/types/quiz";

interface UserAvatarProps {
  user: UserType;
  size?: "sm" | "md" | "lg";
  showName?: boolean;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ user, size = "sm", showName = false }) => {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10"
  };
  
  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base"
  };
  
  const initials = user.displayName
    ? user.displayName.substring(0, 2).toUpperCase() 
    : user.email
      ? user.email.substring(0, 2).toUpperCase()
      : "U";
  
  return (
    <div className="flex items-center gap-2">
      <Avatar className={sizeClasses[size]}>
        <AvatarFallback className={`${textSizeClasses[size]} bg-primary/20`}>
          {initials}
        </AvatarFallback>
      </Avatar>
      {showName && (
        <span className="max-w-[100px] truncate">
          {user.displayName || user.email?.split('@')[0]}
        </span>
      )}
    </div>
  );
};

export default UserAvatar;
