import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface InputWithIconProps extends React.ComponentProps<"input"> {
    label?: string;
    labelRight?: React.ReactNode;
    iconSrc: string;
    iconAlt: string;
    id: string;
    rightElement?: React.ReactNode;
}

export function InputWithIcon({ label, labelRight, iconSrc, iconAlt, id, className, rightElement, ...props }: InputWithIconProps) {
    return (
        <div className="space-y-2">
            {(label || labelRight) && (
                <div className="flex items-center justify-between ml-1">
                    {label && <Label htmlFor={id} className="text-sm font-medium text-zinc-700">{label}</Label>}
                    {labelRight}
                </div>
            )}
            <div className="relative group">
                 <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 transition-transform duration-300 group-hover:scale-110 group-focus-within:scale-110">
                    <img 
                        src={iconSrc} 
                        alt={iconAlt} 
                        className="w-5 h-5 object-contain drop-shadow-sm"
                    />
                </div>
                <Input
                    id={id}
                    className={cn(
                        "pl-11 h-11 bg-white/60 border-zinc-200/80 focus:bg-white focus:border-primary/30 transition-all duration-300 rounded-xl shadow-sm focus-visible:ring-0 focus-visible:ring-offset-0",
                        className
                    )}
                    {...props}
                />
                {rightElement && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {rightElement}
                    </div>
                )}
            </div>
        </div>
    )
}
