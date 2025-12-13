
interface TemplateOptions {
    name?: string;
    url?: string;
}

const styles = {
    body: `
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background-color: #eef2ff;
        margin: 0;
        padding: 0;
        width: 100%;
        -webkit-font-smoothing: antialiased;
        color: #1e1b4b;
    `,
    container: `
        max-width: 600px;
        margin: 0 auto;
        padding: 40px 20px;
        text-align: left;
    `,
    card: `
        background-color: #ffffff;
        border-radius: 16px;
        padding: 48px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        border: 1px solid #e0e7ff;
        border-top: 4px solid #4f46e5;
    `,
    h1: `
        color: #1e1b4b;
        font-size: 28px;
        font-weight: 800;
        margin: 0 0 24px;
        letter-spacing: -0.025em;
        line-height: 1.25;
    `,
    text: `
        color: #3730a3;
        font-size: 16px;
        line-height: 1.625;
        margin: 0 0 20px;
    `,
    list: `
        color: #3730a3;
        font-size: 16px;
        line-height: 1.8;
        margin: 24px 0 32px;
        padding-left: 24px;
    `,
    button: `
        display: inline-block;
        background-color: #4f46e5;
        color: #ffffff;
        font-size: 16px;
        font-weight: 600;
        text-decoration: none;
        padding: 14px 32px;
        border-radius: 12px;
        margin-top: 8px;
        margin-bottom: 24px;
        text-align: center;
        transition: all 0.2s ease;
        box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2), 0 2px 4px -1px rgba(79, 70, 229, 0.1);
    `,
    footer: `
        text-align: center;
        margin-top: 40px;
        color: #818cf8;
        font-size: 13px;
    `,
    divider: `
        border-top: 1px solid #e0e7ff;
        margin: 32px 0;
    `
};

const getBaseLayout = (content: string) => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <title>SteppsAI Notification</title>
    <style>
        .button:hover {
            background-color: #4338ca !important;
            transform: translateY(-1px);
            box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.3), 0 4px 6px -2px rgba(79, 70, 229, 0.15) !important;
        }
        .footer-link {
            color: #4f46e5 !important;
            text-decoration: none;
        }
        .footer-link:hover {
            text-decoration: underline;
        }
        @media only screen and (max-width: 600px) {
            .container {
                padding: 20px 16px !important;
            }
            .card {
                padding: 32px 24px !important;
            }
            .button {
                display: block !important;
                width: 100% !important;
                box-sizing: border-box !important;
                text-align: center !important;
            }
        }
    </style>
</head>
<body style="${styles.body}">
    <div class="container" style="${styles.container}">
        <div class="card" style="${styles.card}">
            ${content}
        </div>
        <div class="footer" style="${styles.footer}">
            <p style="margin: 0;">© ${new Date().getFullYear()} SteppsAI. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;
};

export const getPasswordResetHTML = ({ name, url }: TemplateOptions) => {
    const displayName = name || 'there';

    const content = `
        <h1 style="${styles.h1}">Reset your password</h1>
        <p style="${styles.text}">Hi ${displayName},</p>
        <p style="${styles.text}">We received a request to reset your password. Click the button below to choose a new password:</p>
        <a href="${url}" class="button" style="${styles.button}">Reset Password</a>
        <p style="${styles.text}">If you didn't request this, you can safely ignore this email.</p>
    `;

    return getBaseLayout(content);
};

export const getVerificationHTML = ({ name, url }: TemplateOptions) => {
    const displayName = name || 'there';

    const content = `
        <h1 style="${styles.h1}">Verify your email</h1>
        <p style="${styles.text}">Hi ${displayName},</p>
        <p style="${styles.text}">Thanks for signing up for SteppsAI! Please verify your email by clicking the button below:</p>
        <a href="${url}" class="button" style="${styles.button}">Verify Email</a>
        <p style="${styles.text}">If you didn't create an account, you can safely ignore this email.</p>
    `;

    return getBaseLayout(content);
};

export const getWelcomeEmailHTML = ({ name }: TemplateOptions) => {
    const displayName = name || 'there';
    const dashboardUrl = 'https://stepps.ai/app';

    const content = `
        <h1 style="${styles.h1}">Welcome to SteppsAI! 🎉</h1>
        
        <p style="${styles.text}">Hi ${displayName},</p>
        
        <p style="${styles.text}">
            Thank you for purchasing SteppsAI Lifetime Access!
        </p>
        
        <p style="${styles.text}">
            You now have unlimited access to:
        </p>
        
        <ul style="${styles.list}">
            <li>Unlimited Guides & Stepps</li>
            <li>Smart AI Screenshot Capture</li>
            <li>Advanced Image Editor</li>
            <li>PDF & Markdown Export</li>
            <li>All future updates included</li>
        </ul>
        
        <p style="${styles.text}">
            Ready to get started? Install our browser extension and start creating!
        </p>
        
        <a href="${dashboardUrl}" class="button" style="${styles.button}">
            Go to Dashboard
        </a>
        
        <div style="${styles.divider}"></div>

        <p style="${styles.text}" style="font-size: 14px; color: #6366f1;">
            Need help? Just reply to this email - we're here for you.
        </p>
        
        <p style="${styles.text}" style="font-size: 14px; color: #6366f1; margin-bottom: 0;">
            — The SteppsAI Team
        </p>
    `;

    return getBaseLayout(content);
};

