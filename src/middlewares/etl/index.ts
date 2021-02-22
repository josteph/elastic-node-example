import data from './data.json';
import fp from 'fastify-plugin';
import { CronJob } from 'cron';

type DocIndex = {
  index: {
    _index: string;
    _type: string;
    _id: number;
  }
}

type DocBody = {
  id: number;
  title: string;
  body: string;
}

function etlMiddleware(ctx, _opts, next) {
  const etlTask = async () => {
    try {
      const body: Array<DocIndex | DocBody> = [];

      data.forEach(r => {
        const docIndex: DocIndex = {
          index: {
            '_index': 'posts',
            '_type': '_doc',
            '_id': r['id'],
          }
        };

        const docBody: DocBody = {
          id: r['id'],
          title: r['title'],
          body: r['body'],
        };

        body.push(docIndex);
        body.push(docBody);
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