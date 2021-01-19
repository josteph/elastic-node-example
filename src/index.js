import fastify from 'fastify';
import registerMiddleware from './middlewares';
import registerRoute from './routes';

function build(opts) {
  const app = fastify(opts);

  registerMiddleware(app);
  registerRoute(app);

  return app;
}

export default build;
