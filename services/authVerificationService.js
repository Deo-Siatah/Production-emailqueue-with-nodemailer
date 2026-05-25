const userRepo = require("../repository/userRepository");
const AppError = require("../utils/appError");
const logger = require("../utils/logger");
const {verifyOtp} = require("./otpService");
const {generateToken} = require("./jwtService");
const {queueWelcomeEmail} = require("./emailJobService")

const verifyOtpAndLogin = async ({email, otp}) => {
    const user = await userRepo.findByEmail(email);

    if(!user) {
        throw new AppError("User not found", 404);
    }

    await verifyOtp({email, otp});
    const token = generateToken(user);
    await queueWelcomeEmail({email, name:user.name});

    logger.info({
        event: "USER_AUNTHENTICATED",
        userId: user.id,
        email,
    });

    return {
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
        },
        token
    };
};

module.exports = { verifyOtpAndLogin};