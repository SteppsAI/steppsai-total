import { Hono } from 'hono';
import { guidesRouter } from './routes/guides';
import { imagesRouter } from './routes/images';
import { usersRouter } from './routes/users';
import { exportsRouter } from './routes/exports';
import { editorRouter } from './routes/editor';

export const App = new Hono<{ Bindings: Env }>();

App.route('/guides', guidesRouter);
App.route('/images', imagesRouter);
App.route('/users', usersRouter);
App.route('/exports', exportsRouter);
App.route('/api/editor', editorRouter);

App.get('/', (c) => c.text('SteppsAI Data Service'));