import * as React from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface CreateButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "glass" | "minimal" | "outline";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  className?: string;
  disabled?: boolean;
}

export function CreateButton({
  children,
  onClick,
  variant = "primary",
  size = "md",
  fullWidth = false,
  className,
  disabled = false,
  ...props
}: CreateButtonProps) {
  const baseClasses = "group inline-flex items-center justify-center rounded-full font-medium transition-all duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 relative z-20 cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap";

  const sizeClasses = {
    sm: "h-9 px-4 text-sm gap-1.5 min-w-0",
    md: "h-11 px-6 text-base gap-2 min-w-0",
    lg: "h-12 px-8 text-lg gap-2 min-w-0"
  };

  const widthClasses = fullWidth ? "w-full" : "";

  const variantClasses = {
    primary: "btn-glass-primary shadow-lg hover:shadow-primary/20 text-white",
    secondary: "bg-background hover:bg-muted hover:text-foreground border border-border shadow-sm",
    glass: "btn-glass-dashboard hover:-translate-y-0.5",
    minimal: "bg-transparent hover:bg-muted/50 text-muted-foreground hover:text-foreground border border-border/30 shadow-none",
    outline: "bg-transparent hover:bg-background border border-border/50 text-foreground hover:shadow-sm"
  };

  const iconSize = {
    sm: "size-3.5",
    md: "size-4",
    lg: "size-5"
  };

  return (
    <button
      className={cn(
        baseClasses,
        sizeClasses[size],
        widthClasses,
        variantClasses[variant],
        className
      )}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      <Plus
        className={cn(
          "flex-shrink-0 transition-transform duration-200 group-hover:scale-110",
          iconSize[size],
          !children && "m-0" // Center icon when no text
        )}
      />
      {children && <span className="transition-all duration-300 ease-in-out">{children}</span>}
    </button>
  );
}