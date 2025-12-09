import { useState } from 'react'
import { z } from 'zod'
import { authClient } from '@/components/auth/client'
import { showAuthError } from '@/lib/auth-errors'
import { Button } from '@/components/ui/button'
import { Loader2, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import { useNavigate, Link } from '@tanstack/react-router'
import { InputWithIcon } from './InputWithIcon'
import { notifyExtensionAuthChanged, triggerExtensionSidePanel } from '@/lib/extension'

const loginSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters long'),
})

const signupSchema = loginSchema.extend({
    name: z.string().min(2, 'Please enter your full name'),
})

interface LoginFormProps {
    isLogin: boolean;
    from?: string;
}

export function LoginForm({ isLogin, from }: LoginFormProps) {
    const [loading, setLoading] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [name, setName] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const navigate = useNavigate()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const schema = isLogin ? loginSchema : signupSchema
            const parsed = schema.safeParse({ email, password, name })

            if (!parsed.success) {
                const firstError = parsed.error.issues[0]
                toast.error(firstError?.message ?? 'Please check your input')
                return
            }

            console.log('[Auth] submit', { mode: isLogin ? 'login' : 'signup', email })
            if (isLogin) {
                const result = await authClient.signIn.email({
                    email,
                    password,
                })

                if ((result as any)?.error) {
                    console.error('[Auth] signIn.email error', result)
                    showAuthError({ error: (result as any).error } as any, 'login')
                    return
                }

                console.log('[Auth] signIn.email success', result)
                if (from === 'extension') {
                    try {
                        await notifyExtensionAuthChanged()
                        await triggerExtensionSidePanel()
                        setTimeout(() => window.close(), 500)
                        return
                    } catch (err) {
                        console.error('[Auth] Extension notification error', err)
                    }
                }
                navigate({ to: '/app' })
            } else {
                const result = await authClient.signUp.email({
                    email,
                    password,
                    name,
                    callbackURL: "/auth/verify-email"
                })

                if ((result as any)?.error) {
                    console.error('[Auth] signUp.email error', result)
                    showAuthError({ error: (result as any).error } as any, 'signup')
                    return
                }

                console.log('[Auth] signUp.email success', result)
                toast.success('Please check your email for verification')
            }
        } catch (error) {
            console.error('[Auth] submit unexpected error', error)
            toast.error('An error occurred')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
                <InputWithIcon
                    id="name"
                    label="Full Name"
                    iconSrc="/icons/3d/person.png"
                    iconAlt="Name"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
            )}

            <InputWithIcon
                id="email"
                label="Email"
                iconSrc="/icons/3d/mail.png"
                iconAlt="Email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />

            <InputWithIcon
                id="password"
                label="Password"
                labelRight={isLogin && (
                    <Link
                        to="/auth/forgot-password"
                        className="text-xs text-primary hover:text-primary/80 transition-colors font-medium"
                    >
                        Forgot password?
                    </Link>
                )}
                iconSrc="/icons/3d/lock.png"
                iconAlt="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pr-10"
                rightElement={
                    <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="text-zinc-400 hover:text-zinc-600 transition-colors align-middle"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                        {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                        ) : (
                            <Eye className="h-4 w-4" />
                        )}
                    </button>
                }
            />

            <Button 
                type="submit" 
                disabled={loading}
                className="btn-glass-primary group w-full h-12 rounded-xl text-base font-semibold shadow-lg hover:shadow-primary/20 transition-all hover:-translate-y-0.5 active:translate-y-0.5 mt-2"
            >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLogin ? 'Sign In' : 'Create Account'}
                {!loading && <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />}
            </Button>
        </form>
    )
}

