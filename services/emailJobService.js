const emailQueue = require("../infrastructure/queue/emailQueue");
const logger = require("../utils/logger");

const queueOtpEmail =async ({
    email,
    otp,
}) => {
    const job = await emailQueue.add(
        "send-otp",
        {
            email,
            otp,
        }
    );

    logger.info({
        event: "OTP_JOB_CREATED",
        jobId: job.id,
        email,
    });
    return job
};

const queueWelcomeEmail = async({
    email,
    name,
}) => {
    const job = await emailQueue.add(
        "send-welcome",
        {
            email,
            name,
        }
    );

    logger.info({
        event: "WELCOME_EMAIL_JOB_CREATED",
        jobId: job.id,
        email,
    });

    return job;
};

module.exports = {
    queueOtpEmail,
    queueWelcomeEmail,
}