import { Resend } from 'resend';

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
        html: `
            <h2>Reset your password</h2>
            <p>Hi ${name || 'there'},</p>
            <p>We received a request to reset your password. Click the button below to choose a new password:</p>
            <a href="${url}" style="display: inline-block; padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; border-radius: 6px;">Reset Password</a>
            <p>If you didn't request this, you can safely ignore this email.</p>
        `,
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
        html: `
            <h2>Verify your email</h2>
            <p>Hi ${name || 'there'},</p>
            <p>Thanks for signing up for SteppsAI! Please verify your email by clicking the button below:</p>
            <a href="${url}" style="display: inline-block; padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; border-radius: 6px;">Verify Email</a>
            <p>If you didn't create an account, you can safely ignore this email.</p>
        `,
    });

    if (error) {
        console.error('[RPC] Failed to send verification email:', error);
        throw new Error('Failed to send verification email');
    }

    console.log(`[RPC] Verification email sent to ${email}`);
    return { success: true };
}

