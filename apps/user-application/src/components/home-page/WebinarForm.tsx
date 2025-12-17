import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import * as z from 'zod'
import { ArrowRight, CheckCircle2, Loader2, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import { subscribeToWebinar } from '@/lib/newsletterActions'

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

interface WebinarFormProps {
    className?: string
    variant?: 'default' | 'footer'
    onSuccess?: () => void
}

type FormStep = 'email' | 'name' | 'submitted'

export function WebinarForm({ className, variant = 'default', onSuccess }: WebinarFormProps) {
    const [currentStep, setCurrentStep] = useState<FormStep>('email')
    const [collectedEmail, setCollectedEmail] = useState('')
    const [submitError, setSubmitError] = useState('')

    const { register, handleSubmit, reset } = useForm<FormData>({
        resolver: zodResolver((currentStep === 'email' ? emailSchema : nameSchema) as any),
        mode: 'onSubmit',
    })

    const mutation = useMutation({
        mutationFn: subscribeToWebinar,
        onSuccess: (data) => {
            setCurrentStep('submitted')
            reset()
            setCollectedEmail('')

            if (onSuccess) {
                onSuccess()
            }

            if (data.is_existing) {
                setSubmitError("You are already registered!")
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
            <div className="mb-6">
                {/* Container with integrated input and button */}
                <div className={cn(
                    "relative flex items-center rounded-full overflow-hidden border transition-all",
                    variant === 'footer'
                        ? "bg-white/5 border-white/10 hover:border-white/20"
                        : "bg-white border-[var(--color-200)] hover:border-[var(--color-300)] shadow-sm"
                )}>
                    {/* Icon */}
                    <div className={cn(
                        "pl-3 pr-2 sm:pl-6 sm:pr-3",
                        variant === 'footer' ? "text-white/40" : "text-[var(--color-500)]"
                    )}>
                        <Calendar className="w-5 h-5" />
                    </div>

                    {/* Input */}
                    <input
                        {...register(currentStep === 'email' ? 'email' : 'name')}
                        type={currentStep === 'email' ? 'email' : 'text'}
                        placeholder={
                            currentStep === 'email'
                                ? 'Enter your email'
                                : 'What\'s your name?'
                        }
                        disabled={mutation.isPending || currentStep === 'submitted'}
                        className={cn(
                            "flex-1 min-w-0 h-12 sm:h-14 bg-transparent border-0 outline-none text-base",
                            "placeholder:text-sm",
                            variant === 'footer'
                                ? "text-white placeholder:text-white/40"
                                : "text-[var(--color-900)] placeholder:text-[var(--color-400)]"
                        )}
                    />

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={mutation.isPending || currentStep === 'submitted'}
                        className={cn(
                            "m-1 sm:m-1.5 h-10 sm:h-11 px-3 sm:px-6 rounded-full font-medium transition-all shrink-0 flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base whitespace-nowrap",
                            variant === 'footer'
                                ? "bg-white text-[var(--color-900)] hover:bg-white/90"
                                : "bg-[var(--color-700)] text-white hover:bg-[var(--color-800)]",
                            "disabled:opacity-50 disabled:cursor-not-allowed"
                        )}
                    >
                        {mutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : currentStep === 'submitted' ? (
                            <>
                                <CheckCircle2 className="w-4 h-4" />
                                <span className="inline">
                                    Registered!
                                </span>
                            </>
                        ) : currentStep === 'email' ? (
                            <>
                                <span className="inline">Next</span>
                                <ArrowRight className="w-4 h-4" />
                            </>
                        ) : (
                            <>
                                <span className="inline">
                                    Register
                                </span>
                                <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </div>

            </div>

            {/* Error Message */}
            {submitError && (
                <p className={cn(
                    "text-sm text-center mb-4",
                    variant === 'footer' ? "text-red-300" : "text-[var(--destructive)]"
                )}>
                    {submitError}
                </p>
            )}

            {/* Description text */}
            {currentStep === 'email' && (
                <p className={cn(
                    "text-sm text-center",
                    variant === 'footer' ? "text-white/60" : "text-[var(--color-500)]"
                )}>
                    Enter your details to grab your spot.
                </p>
            )}
        </form>
    )
}
