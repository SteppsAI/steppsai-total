import { Resend } from 'resend';
import { getWelcomeEmailHTML } from '../rpc-methods/email-html/templates';

/**
 * Send welcome email to new subscribers
 */
export async function sendWelcomeEmail(
    env: Env,
    email: string,
    name: string
) {
    const resend = new Resend(env.RESEND_API_KEY);

    const { error } = await resend.emails.send({
        from: 'SteppsAI <noreply@stepps.ai>',
        to: [email],
        subject: 'Welcome to SteppsAI! 🎉',
        html: getWelcomeEmailHTML({ name }),
    });

    if (error) {
        console.error('[Mail] Failed to send welcome email:', error);
        throw new Error('Failed to send welcome email');
    }

    console.log(`[Mail] Welcome email sent to ${email}`);
    return { success: true };
}
