const API_PREFIX = '/api/v1';
const userRoutes = require('./users');
const invoiceRoutes = require('./invoice');


module.exports = (app) => {
  app.use(API_PREFIX, userRoutes);
  app.use(API_PREFIX, invoiceRoutes);
};
