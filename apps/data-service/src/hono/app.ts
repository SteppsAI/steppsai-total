import { Hono } from 'hono';
import { createMiddleware } from 'hono/factory';
import { getAuth } from '@repo/data-ops/auth';
import { guidesRouter } from './routes/guides';
import { imagesRouter } from './routes/images';
import { usersRouter } from './routes/users';
import { exportsRouter } from './routes/exports';
import { editorRouter } from './routes/editor';
import { authRouter } from './routes/auth';

export const App = new Hono<{
    Bindings: Env;
    Variables: { userId: string };
}>();

// Auth middleware - validates session from forwarded headers
const authMiddleware = createMiddleware<{
    Bindings: Env;
    Variables: { userId: string };
}>(async (c, next) => {
    const auth = getAuth(
        {
            clientId: c.env.GOOGLE_CLIENT_ID,
            clientSecret: c.env.GOOGLE_CLIENT_SECRET,
        },
        {
            apiKey: c.env.CREEM_API_KEY,
        },
        c.env.BETTER_AUTH_SECRET
    );

    const session = await auth.api.getSession({
        headers: c.req.raw.headers
    });

    if (!session?.user) {
        return c.json({ error: 'Unauthorized' }, 401);
    }

    c.set('userId', session.user.id);
    await next();
});

// Apply auth middleware to protected routes
App.use('/guides/*', authMiddleware);
App.use('/users/*', authMiddleware);
App.use('/exports/*', authMiddleware);
App.use('/api/editor/*', authMiddleware);

// Public routes (no auth)
App.route('/images', imagesRouter);
App.route('/auth', authRouter);

// Protected routes
App.route('/guides', guidesRouter);
App.route('/users', usersRouter);
App.route('/exports', exportsRouter);
App.route('/api/editor', editorRouter);

App.get('/', (c) => c.text('SteppsAI Data Service'));