import { FastifyInstance } from 'fastify';
import helmet from 'fastify-helmet';
import cors from 'fastify-cors';
import cookies from 'fastify-cookie';
import elasticSearch from 'fastify-elasticsearch';
import etlTask from './etl';
import corsOptions from './corsOptions';

const registerMiddleware = (app: FastifyInstance) => {
  if (__PROD__) {
    app.register(helmet, {
      contentSecurityPolicy: false,
    });
  }

  app
    .register(cors, corsOptions)
    .register(cookies)
    .register(elasticSearch, { 
      node: 'http://127.0.0.1:9200', 
      healthcheck: false,
      requestTimeout: 5000,
      pingTimeout: 2000,
      maxRetries: 5,
      sniffInterval: 10000,
      suggestCompression: true,
      compression: 'gzip'
    })
    .register(etlTask);
};

export default registerMiddleware;
