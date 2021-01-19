import fastify, { FastifyServerOptions, FastifyInstance } from 'fastify';
import { Server, IncomingMessage, ServerResponse } from 'http';
import registerMiddleware from './middlewares';
import registerRoute from './routes';

function init(opts: FastifyServerOptions): FastifyInstance {
  const app: FastifyInstance<Server, IncomingMessage, ServerResponse> = fastify(opts);

  registerMiddleware(app);
  registerRoute(app);

  return app;
}

export default init;
