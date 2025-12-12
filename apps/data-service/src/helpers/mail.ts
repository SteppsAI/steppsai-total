import { Resend } from 'resend';

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
        from: 'SteppsAI <info@stepps.ai>',
        to: [email],
        subject: 'Welcome to SteppsAI! 🎉',
        html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #000; margin-bottom: 24px;">Welcome to SteppsAI!</h1>
                
                <p style="font-size: 16px; line-height: 1.6; color: #333;">Hi ${name || 'there'},</p>
                
                <p style="font-size: 16px; line-height: 1.6; color: #333;">
                    Thank you for purchasing SteppsAI Lifetime Access! 🎉
                </p>
                
                <p style="font-size: 16px; line-height: 1.6; color: #333;">
                    You now have unlimited access to:
                </p>
                
                <ul style="font-size: 16px; line-height: 1.8; color: #333;">
                    <li>Unlimited Guides & Stepps</li>
                    <li>Smart AI Screenshot Capture</li>
                    <li>Advanced Image Editor</li>
                    <li>PDF & Markdown Export</li>
                    <li>All future updates included</li>
                </ul>
                
                <p style="font-size: 16px; line-height: 1.6; color: #333;">
                    Ready to get started? Install our browser extension and start creating!
                </p>
                
                <a href="https://stepps.ai/app" style="display: inline-block; padding: 14px 28px; background-color: #000; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 16px;">
                    Go to Dashboard
                </a>
                
                <p style="font-size: 14px; line-height: 1.6; color: #666; margin-top: 32px;">
                    Need help? Just reply to this email - we're here for you.
                </p>
                
                <p style="font-size: 14px; line-height: 1.6; color: #666;">
                    — The SteppsAI Team
                </p>
            </div>
        `,
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
        from: 'SteppsAI App <info@stepps.ai>',
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
