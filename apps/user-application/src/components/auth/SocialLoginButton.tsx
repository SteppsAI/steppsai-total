import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SocialLoginButtonProps extends React.ComponentProps<typeof Button> {
    icon?: React.ReactNode;
}

export function SocialLoginButton({ className, children, icon, ...props }: SocialLoginButtonProps) {
    return (
        <Button
            variant="outline"
            className={cn(
                "w-full h-12 relative bg-white/60 border-zinc-200/80 hover:bg-white hover:border-zinc-300 hover:shadow-md transition-all duration-300 rounded-xl font-medium text-zinc-700",
                className
            )}
            {...props}
        >
            {icon && <span className="mr-3">{icon}</span>}
            {children}
        </Button>
    )
}

