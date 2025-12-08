import { Hono } from 'hono';
import { Resend } from 'resend';

export const authRouter = new Hono<{ Bindings: Env }>();

// Password reset email
authRouter.post('/email/reset-password', async (c) => {
    try {
        const { email, name, url } = await c.req.json<{
            email: string;
            name?: string;
            url: string;
        }>();

        if (!email || !url) {
            return c.json({ error: 'Missing email or url' }, 400);
        }

        const resend = new Resend(c.env.RESEND_API_KEY);

        const { data, error } = await resend.emails.send({
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
            console.error('Resend error:', error);
            return c.json({ error: 'Failed to send email' }, 500);
        }

        return c.json({ success: true, data });
    } catch (error) {
        console.error('Email error:', error);
        return c.json({ error: 'Failed to send email' }, 500);
    }
});

