import { FastifyServerOptions, FastifyInstance } from 'fastify';
import init from './index';

const opts: FastifyServerOptions = { 
  logger: true,
  disableRequestLogging: __PROD__,
};

let app: FastifyInstance = init(opts);

async function start() {
  if (!app) {
    app = init(opts);
  }

  try {
    await app.listen(3000, __PROD__ ? '0.0.0.0': '127.0.0.1');
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

if (require.main === module) {
  app.close();
  start();
}
