import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { z } from 'zod'
import { authClient } from '@/components/auth/client'
import { showAuthError } from '@/lib/auth-errors'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import {
    ProgressSlider,
    SliderContent,
    SliderWrapper,
    SliderBtnGroup,
    SliderBtn
} from '@/components/ui/progressive-carousel'
import { notifyExtensionAuthChanged, triggerExtensionSidePanel } from '@/lib/extension'

type AuthPageProps = {
    initialMode?: 'login' | 'signup'
}

const loginSearchSchema = z.object({
    from: z.string().optional(),
})

const loginSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters long'),
})

const signupSchema = loginSchema.extend({
    name: z.string().min(2, 'Please enter your full name'),
})

export const Route = createFileRoute('/auth/login')({
    validateSearch: (search) => loginSearchSchema.parse(search),
    component: () => <AuthPage initialMode="login" />,
})

export function AuthPage({ initialMode = 'login' }: AuthPageProps) {
    const [isLogin, setIsLogin] = useState(initialMode === 'login')
    const [loading, setLoading] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [name, setName] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const navigate = useNavigate()
    const { from } = Route.useSearch()

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

    const handleGoogleLogin = async () => {
        try {
            console.log('[Auth] Google sign-in start')
            await authClient.signIn.social({
                provider: "google",
                callbackURL: "/app"
            })
        } catch (error) {
            console.error('[Auth] Google sign-in error', error)
            toast.error('Google sign-in failed')
        }
    }

    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            {/* Left Side - Marketing & Visuals */}
            <div className="hidden lg:flex flex-col items-center justify-center bg-[#0B0F19] p-12 text-white relative overflow-hidden">
                {/* Subtle Background Effects */}
                {/* Background Effects */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] bg-[#6366F1] rounded-full blur-[120px] opacity-[0.15]" />
                    <div className="absolute top-[20%] right-[10%] w-[50%] h-[60%] bg-[#06B6D4] rounded-full blur-[100px] opacity-[0.15]" />
                    <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-[#F43F5E] rounded-full blur-[120px] opacity-[0.12]" />
                    <div className="absolute bottom-[10%] left-[20%] w-[40%] h-[40%] bg-[#6366F1] rounded-full blur-[100px] opacity-[0.12]" />
                </div>
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]" />

                <div className="absolute top-12 left-1/2 -translate-x-1/2 z-10">
                    <img
                        src="/brand/logo-light.svg"
                        alt="Stepps Logo"
                        className="h-7 w-auto"
                    />
                </div>

                <div className="relative z-10 w-full max-w-sm text-center">
                    <h1 className="text-2xl font-semibold tracking-tight mb-3 leading-snug text-white">
                        Turn Actions into Instructions.
                    </h1>
                    <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                        Stepps captures your workflow and generates beautiful step-by-step guides automatically.
                    </p>

                    <ProgressSlider vertical={false} activeSlider="install" duration={2500}>
                        <SliderContent>
                            <SliderWrapper value="install" className="w-full">
                                <div className="rounded-xl overflow-hidden shadow-2xl border border-white/10 bg-white/5 aspect-video relative">
                                    <img
                                        src="/website/install-extension.webp"
                                        alt="Install Extension"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </SliderWrapper>
                            <SliderWrapper value="record" className="w-full">
                                <div className="rounded-xl overflow-hidden shadow-2xl border border-white/10 bg-white/5 aspect-video relative">
                                    <img
                                        src="/website/record-workflow.webp"
                                        alt="Record Workflow"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </SliderWrapper>
                            <SliderWrapper value="generate" className="w-full">
                                <div className="rounded-xl overflow-hidden shadow-2xl border border-white/10 bg-white/5 aspect-video relative">
                                    <img
                                        src="/website/generate-guide.webp"
                                        alt="Generate Guide"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </SliderWrapper>
                            <SliderWrapper value="share" className="w-full">
                                <div className="rounded-xl overflow-hidden shadow-2xl border border-white/10 bg-white/5 aspect-video relative">
                                    <img
                                        src="/website/share-export.webp"
                                        alt="Share and Export"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </SliderWrapper>
                        </SliderContent>

                        <SliderBtnGroup className="grid grid-cols-4 gap-2 mt-4">
                            <SliderBtn value="install" className="text-left p-2 rounded-lg transition-all" progressBarClass="bg-primary h-1 bottom-0">
                                <h3 className="font-semibold text-white text-xs mb-1">Install</h3>
                                <p className="text-[10px] text-zinc-400 leading-snug hidden xl:block">Get the browser extension</p>
                            </SliderBtn>
                            <SliderBtn value="record" className="text-left p-2 rounded-lg transition-all" progressBarClass="bg-primary h-1 bottom-0">
                                <h3 className="font-semibold text-white text-xs mb-1">Record</h3>
                                <p className="text-[10px] text-zinc-400 leading-snug hidden xl:block">Capture your workflow instantly</p>
                            </SliderBtn>
                            <SliderBtn value="generate" className="text-left p-2 rounded-lg transition-all" progressBarClass="bg-primary h-1 bottom-0">
                                <h3 className="font-semibold text-white text-xs mb-1">Generate</h3>
                                <p className="text-[10px] text-zinc-400 leading-snug hidden xl:block">Turn actions into guides</p>
                            </SliderBtn>
                            <SliderBtn value="share" className="text-left p-2 rounded-lg transition-all" progressBarClass="bg-primary h-1 bottom-0">
                                <h3 className="font-semibold text-white text-xs mb-1">Share</h3>
                                <p className="text-[10px] text-zinc-400 leading-snug hidden xl:block">Export as PDF or HTML</p>
                            </SliderBtn>
                        </SliderBtnGroup>
                    </ProgressSlider>
                </div>

                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10 text-xs text-zinc-500">
                    © {new Date().getFullYear()} stepps.ai
                </div>
            </div>

            {/* Right Side - Auth Form */}
            <div className="flex items-center justify-center p-8 bg-background relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02] pointer-events-none" />
                {/* Mobile Logo */}
                <div className="absolute top-8 w-full flex justify-center lg:hidden">
                    <img
                        src="/brand/logo-symbol.svg"
                        alt="Stepps Logo"
                        className="h-10 w-10"
                    />
                </div>

                <div className="w-full max-w-md space-y-8">
                    <div className="text-center lg:text-left">
                        <h2 className="text-2xl font-bold tracking-tight">
                            {isLogin ? 'Welcome back' : 'Create your account'}
                        </h2>
                        <p className="text-muted-foreground mt-2 text-sm">
                            {isLogin
                                ? 'Enter your credentials to access your workspace'
                                : 'Start creating beautiful documentation for free'}
                        </p>
                    </div>

                    <div className="space-y-4">
                        <Button
                            variant="outline"
                            className="w-full h-11 relative bg-background hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                            onClick={handleGoogleLogin}
                        >
                            {/* Simple Google Icon SVG */}
                            <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                                <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                            </svg>
                            Continue with Google
                        </Button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-zinc-200 dark:border-zinc-800" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">
                                    Or continue with email
                                </span>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {!isLogin && (
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input
                                        id="name"
                                        placeholder="John Doe"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                        className="h-11"
                                    />
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="h-11"
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password">Password</Label>
                                    {isLogin && (
                                        <Link
                                            to="/auth/forgot-password"
                                            className="text-xs text-primary hover:underline underline-offset-4"
                                        >
                                            Forgot password?
                                        </Link>
                                    )}
                                </div>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="h-11 pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground"
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <Button type="submit" className="w-full h-11 font-medium" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isLogin ? 'Sign In' : 'Create Account'}
                            </Button>
                        </form>
                    </div>

                    <p className="text-center text-sm text-muted-foreground">
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="font-medium text-primary hover:underline underline-offset-4 hover:text-primary/80 transition-colors"
                        >
                            {isLogin ? 'Sign up' : 'Log in'}
                        </button>
                    </p>
                </div>

                <Link
                    to="/"
                    className="absolute bottom-12 left-1/2 -translate-x-1/2 text-sm text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors"
                >
                    back to home
                </Link>
            </div>
        </div>
    )
}
