
import React from "react";
import { getCurrentUser, setUserRole, UserRole } from "@/utils/forumService";
import { Button } from "@/components/ui/button";
import { Shield, User } from "lucide-react";

interface UserRoleSelectorProps {
  onRoleChange: () => void;
}

const UserRoleSelector: React.FC<UserRoleSelectorProps> = ({ onRoleChange }) => {
  const currentUser = getCurrentUser();
  const isAdmin = currentUser.role === UserRole.ADMIN;

  const toggleRole = () => {
    const newRole = isAdmin ? UserRole.USER : UserRole.ADMIN;
    setUserRole(newRole);
    onRoleChange();
  };

  return (
    <div className="bg-muted p-4 rounded-lg mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium mb-1">
          Current role: {isAdmin ? "Admin" : "Regular User"}
        </p>
        <p className="text-xs text-muted-foreground">
          {isAdmin 
            ? "As admin, you can create news posts and regular posts." 
            : "As a regular user, you can only comment on posts."}
        </p>
      </div>
      
      <Button
        variant={isAdmin ? "default" : "outline"}
        size="sm"
        onClick={toggleRole}
        className="flex items-center gap-2"
      >
        {isAdmin ? (
          <>
            <User className="h-4 w-4" />
            <span>Switch to User</span>
          </>
        ) : (
          <>
            <Shield className="h-4 w-4" />
            <span>Switch to Admin</span>
          </>
        )}
      </Button>
    </div>
  );
};

export default UserRoleSelector;
