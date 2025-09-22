import { Zap } from "lucide-react";

interface LoadingSpinnerProps {
  message?: string;
  size?: "sm" | "md" | "lg";
}

export function LoadingSpinner({ message = "Processing...", size = "md" }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8"
  };

  return (
    <div className="flex items-center justify-center gap-3">
      <Zap className={`${sizeClasses[size]} text-primary animate-brutal-shake`} />
      <span className="font-bold text-sm uppercase">{message}</span>
    </div>
  );
}