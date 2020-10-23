const redis = require("redis");

const client = redis.createClient();

client.on("connect", function () {
  console.log("Redis is connected");
});

client.on("error", function (error) {
  console.error("REDIS ERROR: ", error);
});

module.exports = client;
