import { Hono } from 'hono';
import { guidesRouter } from './routes/guides';
import { imagesRouter } from './routes/images';

export const App = new Hono<{ Bindings: Env }>();

App.route('/guides', guidesRouter);
App.route('/images', imagesRouter);

App.get('/', (c) => c.text('SteppsAI Data Service'));