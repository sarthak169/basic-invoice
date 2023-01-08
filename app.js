const express = require('express');
const cookieParser = require('cookie-parser');
const log = require('./loggers/appLogger')(__filename);
const mongoose = require('mongoose');
const compression = require('compression');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const http = require('http');
const RedisService = require('./services/Redis');


require('dotenv').config();

const initRoutes = require('./routes');


const app = express();

// we can use sentry here as well for logging all our errors properly

mongoose
  .connect(process.env.DB_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    poolSize: 20
  })
  .then(() => {
    log.info('MongoDB connected successfully');

    app.use(compression());

    app.use(session({
      store: new MongoStore({ mongooseConnection: mongoose.connection }),
      secret: process.env.SESSION_SECRET,
      saveUninitialized: false,
      resave: true,
      rolling: true,
    }));

    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use(cookieParser());

    // Define API Routes here
    log.info('Initializing routes');
    initRoutes(app);

    const server = http.Server(app);

    server.listen(process.env.PORT, async () => {
      log.info(`Server running on: http://localhost:${process.env.PORT}`);

      try {
        // here we can run all our default services like connecting redis or starting other default services
        //await RedisService.init(); // my plan was to add rate limiting as well that is why made redis service
      } catch (err) {
        log.error(`Server startup failed: ${err}`);
        process.exit(1);
      }
    });
  }).catch((err) => {
    log.error(`Failed to start server as connection to DB failed: ${err}`);
    process.exit(1);
  });
