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
        from: 'SteppsAI <support@stepps.ai>',
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

/**
 * Send feedback email to internal team
 */
export async function sendFeedbackEmail(
    env: Env,
    data: {
        email: string;
        name: string;
        subject: string;
        type: string;
        message: string;
    }
) {
    const resend = new Resend(env.RESEND_API_KEY);

    const { error } = await resend.emails.send({
        from: 'SteppsAI App <support@stepps.ai>',
        to: ['support@stepps.ai'],
        replyTo: data.email,
        subject: `[${data.type.toUpperCase()}] ${data.subject}`,
        html: `
            <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2>New Feedback Received</h2>
                
                <div style="background: #f4f4f5; padding: 16px; border-radius: 8px; margin: 20px 0;">
                    <p><strong>From:</strong> ${data.name} (${data.email})</p>
                    <p><strong>Type:</strong> ${data.type}</p>
                    <p><strong>Subject:</strong> ${data.subject}</p>
                </div>

                <h3>Message:</h3>
                <div style="white-space: pre-wrap; line-height: 1.5;">${data.message}</div>
            </div>
        `,
    });

    if (error) {
        console.error('[Mail] Failed to send feedback email:', error);
        throw new Error('Failed to send feedback email');
    }

    console.log(`[Mail] Feedback email sent from ${data.email}`);
    return { success: true };
}
