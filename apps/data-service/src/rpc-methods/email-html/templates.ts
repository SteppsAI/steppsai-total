
interface TemplateOptions {
    name?: string;
    url?: string;
}

const styles = {
    body: `
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background: linear-gradient(135deg, #f8fafc 0%, #eef2ff 50%, #f1f5f9 100%);
        margin: 0;
        padding: 0;
        width: 100%;
        -webkit-font-smoothing: antialiased;
        color: #1e1b4b;
    `,
    container: `
        max-width: 560px;
        margin: 0 auto;
        padding: 48px 24px;
        text-align: left;
    `,
    card: `
        background-color: #ffffff;
        border-radius: 20px;
        padding: 44px 40px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 8px 24px rgba(79, 70, 229, 0.06);
    `,
    h1: `
        color: #1e1b4b;
        font-size: 26px;
        font-weight: 700;
        margin: 0 0 20px;
        letter-spacing: -0.02em;
        line-height: 1.3;
    `,
    text: `
        color: #4b5563;
        font-size: 15px;
        line-height: 1.7;
        margin: 0 0 16px;
    `,
    list: `
        color: #4b5563;
        font-size: 15px;
        line-height: 1.9;
        margin: 20px 0 28px;
        padding-left: 0;
        list-style: none;
    `,
    listItem: `
        padding: 6px 0 6px 28px;
        position: relative;
    `,
    button: `
        display: inline-block;
        background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
        color: #ffffff;
        font-size: 15px;
        font-weight: 600;
        text-decoration: none;
        padding: 14px 28px;
        border-radius: 10px;
        margin-top: 8px;
        margin-bottom: 20px;
        text-align: center;
        transition: all 0.2s ease;
    `,
    footer: `
        text-align: center;
        margin-top: 32px;
        color: #9ca3af;
        font-size: 12px;
        letter-spacing: 0.01em;
    `,
    divider: `
        border: none;
        border-top: 1px solid #f1f5f9;
        margin: 28px 0;
    `,
    accent: `
        color: #4f46e5;
        font-weight: 500;
    `
};

const getBaseLayout = (content: string) => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <title>SteppsAI</title>
    <style>
        .button:hover {
            opacity: 0.92 !important;
            transform: translateY(-1px);
        }
        .footer-link {
            color: #6366f1 !important;
            text-decoration: none;
        }
        .footer-link:hover {
            text-decoration: underline;
        }
        .list-check::before {
            content: '✓';
            position: absolute;
            left: 0;
            color: #4f46e5;
            font-weight: 600;
            font-size: 14px;
        }
        @media only screen and (max-width: 600px) {
            .container {
                padding: 32px 16px !important;
            }
            .card {
                padding: 32px 24px !important;
                border-radius: 16px !important;
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
            <p style="margin: 0; color: #9ca3af;">© ${new Date().getFullYear()} SteppsAI</p>
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

