const apiV1Routes = (app, opts, next) => {
  app.get("/", async function(request, reply) {
    return { hello: "world" };
  });

  app.get(
    "/hello",
    {
      query: {
        name: {
          type: "string"
        }
      }
    },
    async function (request, reply) {
      const { name } = request.query;
      return { hello: name || "no name!" };
    }
  );

  next();
};

export default apiV1Routes;
