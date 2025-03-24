
import React from "react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  color?: "primary" | "white" | "dark";
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = "md", 
  className = "",
  color = "primary"
}) => {
  const sizeClasses = {
    sm: "w-5 h-5 border-2",
    md: "w-8 h-8 border-3",
    lg: "w-12 h-12 border-4",
  };

  const colorClasses = {
    primary: "border-primary/20 border-t-primary",
    white: "border-white/20 border-t-white",
    dark: "border-gray-700/20 border-t-gray-700",
  };

  return (
    <div className={cn("relative", className)}>
      <div
        className={cn(
          sizeClasses[size], 
          colorClasses[color], 
          "rounded-full animate-spinner"
        )}
      />
    </div>
  );
};

export default LoadingSpinner;
