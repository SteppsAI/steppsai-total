
interface TemplateOptions {
    name?: string;
    url?: string;
}

// Brand color palette from globals.css
const brandColors = {
    // Indigo/Purple Scale
    color50: '#eef2ff',
    color100: '#e0e7ff',
    color200: '#c7d2fe',
    color300: '#a5b4fc',
    color400: '#818cf8',
    color500: '#6366f1',
    color600: '#4f46e5',
    color700: '#4338ca',
    color800: '#3730a3',
    color900: '#312e81',
    color950: '#1e1b4b',
};

const styles = {
    body: `
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background-color: ${brandColors.color50};
        margin: 0;
        padding: 0;
        width: 100%;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
    `,
    container: `
        max-width: 580px;
        margin: 0 auto;
        padding: 40px 20px;
    `,
    card: `
        background-color: #ffffff;
        border-radius: 16px;
        padding: 48px 44px;
        border: 1px solid ${brandColors.color100};
    `,
    h1: `
        color: ${brandColors.color950};
        font-size: 28px;
        font-weight: 700;
        margin: 0 0 24px;
        letter-spacing: -0.025em;
        line-height: 1.25;
    `,
    text: `
        color: ${brandColors.color700};
        font-size: 16px;
        line-height: 1.6;
        margin: 0 0 20px;
        letter-spacing: -0.01em;
    `,
    textSmall: `
        color: ${brandColors.color600};
        font-size: 14px;
        line-height: 1.6;
        margin: 0;
    `,
    greeting: `
        color: ${brandColors.color800};
        font-size: 16px;
        font-weight: 500;
        line-height: 1.6;
        margin: 0 0 20px;
    `,
    list: `
        color: ${brandColors.color700};
        font-size: 15px;
        line-height: 2;
        margin: 24px 0 28px;
        padding-left: 0;
        list-style: none;
    `,
    listItem: `
        padding: 4px 0 4px 32px;
        position: relative;
    `,
    button: `
        display: inline-block;
        background-color: ${brandColors.color600};
        color: #ffffff;
        font-size: 15px;
        font-weight: 600;
        text-decoration: none;
        padding: 14px 32px;
        border-radius: 10px;
        margin-top: 4px;
        margin-bottom: 24px;
        letter-spacing: -0.01em;
    `,
    footer: `
        text-align: center;
        margin-top: 32px;
        padding-top: 24px;
    `,
    footerText: `
        color: ${brandColors.color400};
        font-size: 13px;
        margin: 0;
        letter-spacing: 0.01em;
    `,
    divider: `
        border: none;
        border-top: 1px solid ${brandColors.color100};
        margin: 32px 0;
    `,
    signature: `
        color: ${brandColors.color600};
        font-size: 14px;
        font-weight: 500;
        margin: 0;
        letter-spacing: -0.01em;
    `,
    signatureLabel: `
        color: ${brandColors.color500};
        font-size: 14px;
        margin: 0 0 4px;
    `,
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
        .list-check::before {
            content: '✓';
            position: absolute;
            left: 0;
            color: ${brandColors.color600};
            font-weight: 600;
            font-size: 15px;
        }
        @media only screen and (max-width: 600px) {
            .container {
                padding: 24px 16px !important;
            }
            .card {
                padding: 32px 24px !important;
                border-radius: 12px !important;
            }
            .button {
                display: block !important;
                width: 100% !important;
                box-sizing: border-box !important;
                text-align: center !important;
            }
            h1 {
                font-size: 24px !important;
            }
        }
    </style>
</head>
<body style="${styles.body}">
    <div class="container" style="${styles.container}">
        <div class="card" style="${styles.card}">
            ${content}
        </div>
        <div style="${styles.footer}">
            <p style="${styles.footerText}">© ${new Date().getFullYear()} stepps.ai</p>
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
        <p style="${styles.greeting}">Hi ${displayName},</p>
        <p style="${styles.text}">We received a request to reset your password. Click the button below to choose a new password:</p>
        <a href="${url}" class="button" style="${styles.button}">Reset Password</a>
        <p style="${styles.textSmall}">If you didn't request this, you can safely ignore this email.</p>
    `;

    return getBaseLayout(content);
};

export const getVerificationHTML = ({ name, url }: TemplateOptions) => {
    const displayName = name || 'there';

    const content = `
        <h1 style="${styles.h1}">Verify your email</h1>
        <p style="${styles.greeting}">Hi ${displayName},</p>
        <p style="${styles.text}">Thanks for signing up for SteppsAI! Please verify your email by clicking the button below:</p>
        <a href="${url}" class="button" style="${styles.button}">Verify Email</a>
        <p style="${styles.textSmall}">If you didn't create an account, you can safely ignore this email.</p>
    `;

    return getBaseLayout(content);
};

export const getWelcomeEmailHTML = ({ name }: TemplateOptions) => {
    const displayName = name || 'there';
    const dashboardUrl = 'https://stepps.ai/app';

    const content = `
        <h1 style="${styles.h1}">Welcome to SteppsAI! 🎉</h1>
        
        <p style="${styles.greeting}">Hi ${displayName},</p>
        
        <p style="${styles.text}">
            Thank you for purchasing SteppsAI Lifetime Access!
        </p>
        
        <p style="${styles.text}">
            You now have unlimited access to:
        </p>
        
        <ul style="${styles.list}">
            <li class="list-check" style="${styles.listItem}">Unlimited Guides & Stepps</li>
            <li class="list-check" style="${styles.listItem}">Smart AI Screenshot Capture</li>
            <li class="list-check" style="${styles.listItem}">Advanced Image Editor</li>
            <li class="list-check" style="${styles.listItem}">PDF & Markdown Export</li>
            <li class="list-check" style="${styles.listItem}">All future updates included</li>
        </ul>
        
        <p style="${styles.text}">
            Ready to get started? Install our browser extension and start creating!
        </p>
        
        <a href="${dashboardUrl}" class="button" style="${styles.button}">
            Go to Dashboard
        </a>
        
        <div style="${styles.divider}"></div>

        <p style="${styles.signatureLabel}">
            Need help? Just reply to this email — we're here for you.
        </p>
        
        <p style="${styles.signature}">
            — The SteppsAI Team
        </p>
    `;

    return getBaseLayout(content);
};

