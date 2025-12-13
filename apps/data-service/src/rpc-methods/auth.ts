import { Resend } from 'resend';
import { getPasswordResetHTML, getVerificationHTML } from './email-html/templates';

/**
 * Auth RPC Methods
 * Called via BACKEND_SERVICE binding from user-application
 */

export async function sendPasswordResetEmail(
    env: Env,
    email: string,
    name: string,
    url: string
) {
    const resend = new Resend(env.RESEND_API_KEY);

    const { error } = await resend.emails.send({
        from: 'SteppsAI <noreply@stepps.ai>',
        to: [email],
        subject: 'Reset your password - SteppsAI',
        html: getPasswordResetHTML({ name, url }),
    });

    if (error) {
        console.error('[RPC] Failed to send password reset email:', error);
        throw new Error('Failed to send password reset email');
    }

    console.log(`[RPC] Password reset email sent to ${email}`);
    return { success: true };
}

export async function sendVerificationEmail(
    env: Env,
    email: string,
    name: string,
    url: string
) {
    const resend = new Resend(env.RESEND_API_KEY);

    const { error } = await resend.emails.send({
        from: 'SteppsAI <noreply@stepps.ai>',
        to: [email],
        subject: 'Verify your email - SteppsAI',
        html: getVerificationHTML({ name, url }),
    });

    if (error) {
        console.error('[RPC] Failed to send verification email:', error);
        throw new Error('Failed to send verification email');
    }

    console.log(`[RPC] Verification email sent to ${email}`);
    return { success: true };
}

export async function authHealthCheck(env: Env) {
    // Simple healthcheck to decide if we should allow signups/auth flows
    // Right now we just ensure email infra is configured; you can extend this later.
    const hasResendKey = !!env.RESEND_API_KEY;

    if (!hasResendKey) {
        console.error('[RPC] authHealthCheck failed: missing RESEND_API_KEY');
        return { ok: false, reason: 'missing_resend_api_key' as const };
    }

    return { ok: true as const };
}
