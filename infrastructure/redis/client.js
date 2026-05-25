const Redis = require('ioredis');
const logger = require("../../utils/logger");

const redis = new Redis({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,

    maxRetriesPerRequest: null,

});
console.log({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
});

redis.on("connect", () => {
    logger.info("Connected to Redis");
});
redis.on("error", (err) => {
    logger.error({ err }, "Redis connection error");
});

module.exports = redis;