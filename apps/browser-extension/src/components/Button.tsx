import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger';
    icon?: ReactNode;
    children: ReactNode;
}

export function Button({ variant = 'primary', icon, children, className, ...props }: ButtonProps) {
    const baseStyles = "group flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all active:scale-95 cursor-pointer shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.2)] disabled:opacity-50 disabled:pointer-events-none";

    const variants = {
        primary: "bg-primary hover:bg-indigo-500 text-primary-foreground hover:shadow-indigo-500/25",
        secondary: "bg-secondary hover:bg-cyan-600 text-secondary-foreground",
        danger: "bg-accent hover:bg-rose-600 text-accent-foreground"
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${className || ''}`}
            {...props}
        >
            {icon && <span className="w-5 h-5 flex items-center justify-center">{icon}</span>}
            {children}
        </button>
    );
}
