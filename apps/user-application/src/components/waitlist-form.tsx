import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import * as z from 'zod'
import { ArrowRight, CheckCircle2, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { subscribeToWaitlist } from '@/lib/newsletterActions'

const emailSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email address" }),
})

const nameSchema = z.object({
    name: z.string().min(1, { message: "Please enter your name" }),
})

const formSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email address" }),
    name: z.string().min(1, { message: "Please enter your name" }),
})

type FormData = z.infer<typeof formSchema>

interface WaitlistFormProps {
    className?: string
    variant?: 'default' | 'footer'
}

type FormStep = 'email' | 'name' | 'submitted'

export function WaitlistForm({ className, variant = 'default' }: WaitlistFormProps) {
    const [currentStep, setCurrentStep] = useState<FormStep>('email')
    const [collectedEmail, setCollectedEmail] = useState('')
    const [submitError, setSubmitError] = useState('')

    const { register, handleSubmit, reset } = useForm<FormData>({
        resolver: zodResolver((currentStep === 'email' ? emailSchema : nameSchema) as any),
        mode: 'onSubmit',
    })

    const mutation = useMutation({
        mutationFn: subscribeToWaitlist,
        onSuccess: (data) => {
            setCurrentStep('submitted')
            reset()
            setCollectedEmail('')

            if (data.is_existing) {
                setSubmitError("You have already signed up for the waiting list!")
            } else {
                setSubmitError('')
            }

            setTimeout(() => {
                setCurrentStep('email')
                setSubmitError('')
            }, 3000)
        },
        onError: (error) => {
            setSubmitError(error.message || "Something went wrong, please try again.")
        },
    })

    const onSubmit = async (data: FormData) => {
        setSubmitError('')

        if (currentStep === 'email') {
            if (data.email && data.email.includes('@')) {
                setCollectedEmail(data.email)
                setCurrentStep('name')
                reset({ email: data.email, name: '' })
            } else {
                setSubmitError("Please enter a valid email address")
            }
        } else if (currentStep === 'name') {
            if (data.name && data.name.trim().length > 0) {
                await mutation.mutateAsync({
                    name: data.name.trim(),
                    email: collectedEmail
                })
            } else {
                setSubmitError("Please enter your name")
            }
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className={cn("w-full max-w-2xl", className)}>
            <div className="mb-8">
                {/* Container with integrated input and button */}
                <div className={cn(
                    "relative flex items-center rounded-full overflow-hidden border transition-all",
                    variant === 'footer'
                        ? "bg-white/5 border-white/10 hover:border-white/20"
                        : "bg-white border-border hover:border-primary/30 shadow-sm"
                )}>
                    {/* Email Icon */}
                    <div className={cn(
                        "pl-6 pr-3",
                        variant === 'footer' ? "text-white/40" : "text-muted-foreground"
                    )}>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <rect width="20" height="16" x="2" y="4" rx="2" />
                            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                        </svg>
                    </div>

                    {/* Input */}
                    <input
                        {...register(currentStep === 'email' ? 'email' : 'name')}
                        type={currentStep === 'email' ? 'email' : 'text'}
                        placeholder={currentStep === 'email' ? 'Enter your email' : 'What\'s your name?'}
                        disabled={mutation.isPending || currentStep === 'submitted'}
                        className={cn(
                            "flex-1 h-14 bg-transparent border-0 outline-none text-base",
                            "placeholder:text-sm",
                            variant === 'footer'
                                ? "text-white placeholder:text-white/40"
                                : "text-foreground placeholder:text-muted-foreground"
                        )}
                    />

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={mutation.isPending || currentStep === 'submitted'}
                        className={cn(
                            "m-1.5 h-11 px-6 rounded-full font-medium transition-all shrink-0 flex items-center gap-2",
                            variant === 'footer'
                                ? "bg-white text-brand-dark hover:bg-white/90"
                                : "bg-brand-dark text-white hover:bg-brand-dark/90",
                            "disabled:opacity-50 disabled:cursor-not-allowed"
                        )}
                    >
                        {mutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : currentStep === 'submitted' ? (
                            <>
                                <CheckCircle2 className="w-4 h-4" />
                                <span className="hidden sm:inline">Joined!</span>
                            </>
                        ) : currentStep === 'email' ? (
                            <>
                                <span className="hidden sm:inline">Next</span>
                                <ArrowRight className="w-4 h-4" />
                            </>
                        ) : (
                            <>
                                <span className="hidden sm:inline">Join Waitlist</span>
                                <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </div>

            </div>

            {/* Error Message */}
            {submitError && (
                <p className={cn(
                    "text-sm text-center",
                    variant === 'footer' ? "text-red-300" : "text-red-500"
                )}>
                    {submitError}
                </p>
            )}

            {/* Description text */}
            {currentStep === 'email' && (
                <p className={cn(
                    "text-sm text-center",
                    variant === 'footer' ? "text-white/60" : "text-muted-foreground"
                )}>
                    Join the waitlist
                </p>
            )}
        </form>
    )
}
