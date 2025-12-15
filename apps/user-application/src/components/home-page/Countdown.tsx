import { useEffect, useState } from "react";


interface TimeUnitProps {
    value: number;
    label: string;
}

function TimeUnit({ value, label }: TimeUnitProps) {
    return (
        <div className="flex flex-col items-center gap-0 sm:gap-1 min-w-[70px] sm:min-w-[90px]">
            <span className="text-4xl sm:text-6xl font-bold font-mono text-[var(--color-950)] tabular-nums tracking-tighter leading-none">
                {value.toString().padStart(2, '0')}
            </span>
            <span className="text-[10px] sm:text-xs font-bold text-[var(--color-500)] uppercase tracking-widest mt-1">
                {label}
            </span>
        </div>
    );
}

export function Countdown() {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });

    useEffect(() => {
        // Target: Monday, Dec 22 2025 (Assuming current is Dec 15 2025 based on prompt)
        // Or dynamically calculation: "Next Monday, a week from now"
        // If today is Monday, +7 days.
        const target = new Date();
        target.setDate(target.getDate() + 7);
        target.setHours(10, 0, 0, 0); // 10 AM target

        const interval = setInterval(() => {
            const now = new Date();
            const difference = target.getTime() - now.getTime();

            if (difference <= 0) {
                clearInterval(interval);
                return;
            }

            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((difference / 1000 / 60) % 60);
            const seconds = Math.floor((difference / 1000) % 60);

            setTimeLeft({ days, hours, minutes, seconds });
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full max-w-3xl mx-auto py-4">
            <div className="grid grid-cols-4 gap-3 sm:gap-6 justify-center">
                <TimeUnit value={timeLeft.days} label="Days" />
                <TimeUnit value={timeLeft.hours} label="Hours" />
                <TimeUnit value={timeLeft.minutes} label="Mins" />
                <TimeUnit value={timeLeft.seconds} label="Secs" />
            </div>
        </div>
    );
}
