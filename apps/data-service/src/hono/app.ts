import { Hono } from 'hono';
import { guidesRouter } from './routes/guides';
import { imagesRouter } from './routes/images';
import { usersRouter } from './routes/users';
import { exportsRouter } from './routes/exports';
import { guideDocsRouter } from './routes/guide-docs';
import { editorRouter } from './routes/editor';
import { authRouter } from './routes/auth';
import { webhooksRouter } from './routes/webhooks';
import { agentRouter } from './routes/agent';
// import { cors } from 'hono/cors';

export const App = new Hono<{ Bindings: Env }>();

// App.use('*', cors());

// Routes
App.route('/images', imagesRouter);
App.route('/auth', authRouter);
App.route('/guides', guidesRouter);
App.route('/users', usersRouter);
App.route('/exports', exportsRouter);
App.route('/guide-docs', guideDocsRouter);
App.route('/api/editor', editorRouter);
App.route('/webhooks', webhooksRouter);
App.route('/agent', agentRouter);

App.get('/', (c) => c.text('SteppsAI Data Service'));
