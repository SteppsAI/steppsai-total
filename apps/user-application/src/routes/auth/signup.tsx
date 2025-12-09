import { createFileRoute } from '@tanstack/react-router'
import { AuthPage } from './login'

export const Route = createFileRoute('/auth/signup')({
  component: () => {
    console.log('[Auth] render /auth/signup')
    return <AuthPage initialMode="signup" />
  },
})

