const {Queue} = require("bullmq")

const connection = require("./connection");
const logger = require("../../utils/logger");

const emailQueue = new Queue("email-queue", {
    connection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: "exponential",
            delay: 5000,
        },

        removeOnComplete: 100,
        removeOnFail: 100
    }
});

logger.info({
    event: "EMAIL_QUEUE_INITIALIZED",
});
module.exports = emailQueue;