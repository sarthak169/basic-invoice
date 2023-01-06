const API_PREFIX = '/api/v1';
const userRoutes = require('./users');


module.exports = (app) => {
  app.use(API_PREFIX, userRoutes);
};
