import data from './data.json';
import fp from 'fastify-plugin';
import { CronJob } from 'cron';

function etlMiddleware(ctx, opts, next) {
  const etlTask = async () => {
    try {
      const body = [];

      data.forEach(r => {
        body.push({
          index: {
            '_index': 'posts',
            '_type': '_doc',
            '_id': r['id'],
          }
        });

        body.push({
          id: r['id'],
          title: r['title'],
          body: r['body'],
        });
      });

      const { body: bulkResponse } = await ctx.elastic.bulk({ refresh: true, body });

      if (bulkResponse.errors) {
        throw bulkResponse.errors;
      }

      ctx.log.info(`Etl to Elasticsearch succeed at: ${new Date()}`);
    } catch (err) {
      ctx.log.info(`Etl to Elasticsearch error at: ${new Date()}`);
      ctx.log.error(err);
    }
  };

  etlTask();

  new CronJob(
    '30 * * * * *',
    etlTask,
    null,
    true,
    'Asia/Jakarta'
  );

  next();
}

export default fp(etlMiddleware);