import { Hono } from 'hono';
import { createMiddleware } from 'hono/factory';
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

/**
 * User ID Middleware
 * 
 * Trusts X-User-Id header from user-application (via Service Binding).
 * Auth is already validated by user-application before calling data-service.
 */
const userIdMiddleware = createMiddleware<{
    Bindings: Env;
    Variables: { userId: string };
}>(async (c, next) => {
    const userId = c.req.header('X-User-Id');
    if (!userId) {
        return c.json({ error: 'Missing X-User-Id header' }, 400);
    }
    c.set('userId', userId);
    await next();
});

// Apply userIdMiddleware to protected routes
App.use('/guides/*', userIdMiddleware);
App.use('/users/*', userIdMiddleware);
App.use('/exports/*', userIdMiddleware);
App.use('/api/editor/*', userIdMiddleware);

// Public routes (no auth)
App.route('/images', imagesRouter);
App.route('/auth', authRouter);

// Protected routes
App.route('/guides', guidesRouter);
App.route('/users', usersRouter);
App.route('/exports', exportsRouter);
App.route('/api/editor', editorRouter);

App.get('/', (c) => c.text('SteppsAI Data Service'));