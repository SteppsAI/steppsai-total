import React from 'react';
import { Check, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PricingPlan {
    name: string;
    price: {
        monthly: number;
        yearly: number;
    };
    info: string;
    features: {
        text: string;
        included: boolean;
    }[];
    btn: {
        text: string;
        href: string;
        variant: 'primary' | 'secondary' | 'outline';
    };
    highlighted?: boolean;
    popular?: boolean;
}

interface PricingProps {
    plans: PricingPlan[];
    title?: string;
    description?: string;
}

export function Pricing2({ plans, title, description }: PricingProps) {
    const [frequency, setFrequency] = React.useState<'monthly' | 'yearly'>('monthly');

    return (
        <section className="relative w-full overflow-hidden py-12 md:py-16 lg:py-24">
            <div className="container relative z-10 mx-auto px-4 md:px-6">
                <div className="mx-auto mb-12 flex max-w-4xl flex-col items-center justify-center space-y-4 text-center">
                    {title && (
                        <h2 className="font-display text-4xl font-bold tracking-tight text-[var(--color-950)] md:text-5xl">
                            {title}
                        </h2>
                    )}
                    {description && (
                        <p className="max-w-2xl text-lg text-[var(--color-600)] md:text-xl">
                            {description}
                        </p>
                    )}

                    <div className="mt-6 flex items-center justify-center">
                        <div className="grid grid-cols-2 gap-1 rounded-full bg-[var(--color-100)] p-1 text-center text-sm font-semibold">
                            <button
                                onClick={() => setFrequency('monthly')}
                                className={cn(
                                    'cursor-pointer rounded-full px-8 py-2.5 transition-all duration-200',
                                    frequency === 'monthly'
                                        ? 'bg-white text-[var(--color-900)] shadow-sm'
                                        : 'text-[var(--color-600)] hover:text-[var(--color-900)]'
                                )}
                            >
                                Monthly
                            </button>
                            <button
                                onClick={() => setFrequency('yearly')}
                                className={cn(
                                    'cursor-pointer rounded-full px-8 py-2.5 transition-all duration-200',
                                    frequency === 'yearly'
                                        ? 'bg-white text-[var(--color-900)] shadow-sm'
                                        : 'text-[var(--color-600)] hover:text-[var(--color-900)]'
                                )}
                            >
                                Yearly
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2 lg:gap-12">
                    {plans.map((plan) => (
                        <div
                            key={plan.name}
                            className={cn(
                                'relative flex flex-col rounded-3xl border p-8 transition-all duration-200 lg:p-10',
                                plan.highlighted
                                    ? 'border-[var(--color-500)] bg-white shadow-2xl shadow-[var(--color-500)]/10 ring-1 ring-[var(--color-500)]'
                                    : 'border-[var(--color-200)] bg-white/50 backdrop-blur-sm hover:border-[var(--color-300)] hover:shadow-lg'
                            )}
                        >
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-[var(--color-600)] px-4 py-1 text-sm font-bold text-white shadow-lg">
                                    Most Popular
                                </div>
                            )}

                            <div className="mb-6">
                                <h3 className="font-display text-2xl font-bold text-[var(--color-950)]">
                                    {plan.name}
                                </h3>
                                <p className="mt-2 text-[var(--color-600)]">
                                    {plan.info}
                                </p>
                            </div>

                            <div className="mb-8 flex items-baseline gap-1">
                                <span className="text-5xl font-bold text-[var(--color-950)] tracking-tight">
                                    ${plan.price[frequency]}
                                </span>
                                <span className="text-lg font-medium text-[var(--color-500)]">
                                    /{frequency === 'monthly' ? 'mo' : 'yr'}
                                </span>
                            </div>

                            <div className="mb-8 flex-1 space-y-4">
                                {plan.features.map((feature, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <div className={cn(
                                            "flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                                            feature.included
                                                ? "bg-[var(--color-100)] text-[var(--color-600)]"
                                                : "bg-slate-100 text-slate-400"
                                        )}>
                                            {feature.included ? (
                                                <Check className="h-4 w-4" />
                                            ) : (
                                                <Minus className="h-4 w-4" />
                                            )}
                                        </div>
                                        <span className={cn(
                                            "text-sm leading-6",
                                            feature.included ? "text-[var(--color-900)]" : "text-[var(--color-400)]"
                                        )}>
                                            {feature.text}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <a
                                href={plan.btn.href}
                                className={cn(
                                    'inline-flex h-12 w-full items-center justify-center rounded-full px-6 font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-500)] focus:ring-offset-2',
                                    plan.highlighted
                                        ? 'btn-glass-primary text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5'
                                        : 'btn-glass-secondary text-[var(--color-900)] hover:bg-white hover:text-[var(--color-700)] hover:-translate-y-0.5'
                                )}
                            >
                                {plan.btn.text}
                            </a>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

