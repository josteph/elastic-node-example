import entry from './index';

async function start() {
  const app = entry({ 
    logger: true,
    disableRequestLogging: __PROD__,
  });

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
