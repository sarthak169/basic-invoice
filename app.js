const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const log = require('./loggers/appLogger')(__filename);
const mongoose = require('mongoose');
const compression = require('compression');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const http = require('http');


require('dotenv').config();

const initRoutes = require('./routes');


const app = express();

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

    // Serve the static files from the React app
    app.use(express.static(path.join(__dirname, '../client/build')));

    // Define API Routes here
    log.info('Initializing routes');
    initRoutes(app);

    // app.get('*', (req, res) => {
    //   res.sendFile(path.join(__dirname, '../client/build/index.html'));
    // });

    // eslint-disable-next-line new-cap
    const server = http.Server(app);
    // const io = socketio(server);

    server.listen(process.env.PORT, async () => {
      log.info(`Server running on: http://localhost:${process.env.PORT}`);

      try {
        // here we can run all our default services like setting up the default db things or redis service and things like that
      } catch (err) {
        log.error(`Server startup failed: ${err}`);
        process.exit(1);
      }
    });
  }).catch((err) => {
    log.error(`Failed to start server as connection to DB failed: ${err}`);
    process.exit(1);
  });
