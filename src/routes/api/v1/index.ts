const apiV1Routes = (ctx, _opts, next) => {
  ctx.get(
    "/search",
    {
      query: {
        q: {
          type: "string"
        }
      }
    },
    async function (request) {
      const { q } = request.query;

      try {
        const { body } = await ctx.elastic.search({
          index: 'posts',
          q: q || ''
        });

        const { hits } = body;

        return {
          result: hits.hits.map(r => r._source),
          totalCount: hits.hits.length,
        };
      } catch (error) {
        ctx.log.error(error);

        return {
          result: [],
          totalCount: 0
        };
      }
    }
  );

  next();
};

export default apiV1Routes;
