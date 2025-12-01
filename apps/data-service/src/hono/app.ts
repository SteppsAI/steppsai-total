import { Hono } from 'hono';
import { guidesRouter } from './routes/guides';
import { imagesRouter } from './routes/images';
import { usersRouter } from './routes/users';

export const App = new Hono<{ Bindings: Env }>();

App.route('/guides', guidesRouter);
App.route('/images', imagesRouter);
App.route('/users', usersRouter);

App.get('/', (c) => c.text('SteppsAI Data Service'));