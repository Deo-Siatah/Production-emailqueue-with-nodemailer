const redis = require("../infrastructure/redis/client");
const logger = require("../utils/logger");
const AppError = require("../utils/appError");

// 1. Generate OTP
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// 2. Store OTP in Redis
const storeOtp = async (email, otp) => {
  const key = `otp:${email}`;

  await redis.set(key, otp, "EX", 300); // 5 minutes TTL

  logger.info({
    event: "OTP_STORED",
    email,
  });
};



// 3. Verify OTP
const verifyOtp = async ({ email, otp }) => {
  const key = `otp:${email}`;

  const storedOtp = await redis.get(key);

  if (!storedOtp) {
    logger.warn({
      event: "OTP_NOT_FOUND",
      email,
    });

    throw new AppError("OTP expired or not found", 400);
  }

  if (storedOtp !== otp) {
    logger.warn({
      event: "OTP_INVALID",
      email,
    });

    throw new AppError("Invalid OTP", 400);
  }

  // OTP is single-use
  await redis.del(key);

  logger.info({
    event: "OTP_VERIFIED",
    email,
  });

  return true;
};
// 4. Delete OTP (optional helper)
const deleteOtp = async (email) => {
  const key = `otp:${email}`;
  await redis.del(key);

  logger.info({
    event: "OTP_DELETED",
    email,
  });
};

module.exports = {
  generateOtp,
  storeOtp,
  verifyOtp,
  deleteOtp,
};