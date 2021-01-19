import { FastifyServerOptions, FastifyInstance } from 'fastify';
import init from './index';

async function start() {
  const opts: FastifyServerOptions = { 
    logger: true,
    disableRequestLogging: __PROD__,
  };

  const app: FastifyInstance = init(opts);

  try {
    await app.listen(3000, __PROD__ ? '0.0.0.0': '127.0.0.1');
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

if (require.main === module) {
  start();
}
