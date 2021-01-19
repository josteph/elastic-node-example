import { FastifyInstance } from 'fastify';
import helmet from 'fastify-helmet';
import cors from 'fastify-cors';
import cookies from 'fastify-cookie';
import corsOptions from './corsOptions';

const registerMiddleware = (app: FastifyInstance) => {
  if (__PROD__) {
    app.register(helmet, {
      contentSecurityPolicy: false,
    });
  }

  app
    .register(cors, corsOptions)
    .register(cookies);
};

export default registerMiddleware;
