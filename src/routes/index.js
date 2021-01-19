import apiV1 from './api/v1';

function registerRoute(app) {
  app.register(apiV1);
}

export default registerRoute;
