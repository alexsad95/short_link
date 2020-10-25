const redis = require("redis");
const logger = require("../logger/logger");

const client = redis.createClient();

client.on("connect", function () {
  logger.info("Redis is connected");
});

client.on("error", function (error) {
  logger.error(`REDIS ERROR: ${error}`);
});

module.exports = client;
