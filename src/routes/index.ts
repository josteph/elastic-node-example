import { FastifyInstance } from 'fastify';
import apiV1 from './api/v1';

function registerRoute(app: FastifyInstance) {
  app.register(apiV1, { prefix: '/api/v1' });
}

export default registerRoute;
