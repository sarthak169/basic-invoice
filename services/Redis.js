const Redis = require('ioredis');
require('dotenv').config();

const log = require('../loggers/appLogger')(__filename);

let client = null;

module.exports.init = async () => {
  client = new Redis({
    port: process.env.REDIS_PORT,
    host: process.env.REDIS_URL,
    password: process.env.REDIS_PASS,
    lazyConnect: true
  });

  client
    .connect(() => {
      log.info('Redis connected');
    }).catch((err) => {
      log.info('Redis error', err);
      process.exit(1);
    });
};

module.exports.getClient = () => client;

module.exports.get = async (key) => {
  try {
    return {
      value: await client.get(key),
      ttl: await client.ttl(key)
    };
  } catch (err) {
    return null;
  }
};

module.exports.set = async (key, value) => client.set(key, value);

module.exports.del = async (key) => client.del(key);

module.exports.setWithTimeout = async (key, value, seconds) => client.set(key, value, 'EX', seconds);
