const {Worker} = require("bullmq");
const connection = require("../infrastructure/queue/connection");
const logger = require("../utils/logger");
const {sendOtpEmail,sendWelcomeEmail} = require("../infrastructure/email/emailService");

//create Worker
const emailWorker = new Worker(
    "email-queue",

    async(job) => {
        logger.info({
            event: "EMAIL_JOB_PROCESSING",
            jobId:job.id,
            jobName: job.name
        });

        switch(job.name) {
            case "send-otp":
                await sendOtpEmail(job.data);
                break;

            case "send-welcome":
                await sendWelcomeEmail(job.data);
                break;

            default:
                throw new Error(
                    `unknown job: ${job.name}`
                )
        }
    },

    {
        connection,
        concurrency:5,
    }

)

emailWorker.on("completed", (job) => {
    logger.info({
        event: "EMAIL_JOB_COMPLETED",
        jobId: job.id
    });
});

emailWorker.on("failed", (job,error) => {
    logger.error({
        event: "EMAIL_JOB_FAILED",
        jobId: job?.id,
        error: error.message
    });
});

emailWorker.on("ready", () => {
  logger.info({
    event: "EMAIL_WORKER_READY",
  });
});