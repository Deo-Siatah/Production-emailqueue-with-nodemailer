const bcrypt = require("bcryptjs");
const userRepo = require("../repository/userRepository");
const AppError = require("../utils/appError");
const logger = require("../utils/logger");
const {generateOtp,storeOtp} = require("../services/otpService");
const {queueOtpEmail} = require("../services/emailJobService")

const signup = async({name,email,password}) => {
    const existingUser = await userRepo.findByEmail(email);

    if (existingUser) {
        logger.warn({
            event: "SIGNUP_DUPLICATE_EMAIL",
            email,
        });

        throw new AppError(
            "Email already exists",
            409
        );
    }

    const hashedPassword = await bcrypt.hash(password,12);
    const user = await userRepo.create({
        name,
        email,
        password: hashedPassword
    });

    //otp generation and storage
    const otp = generateOtp();
    await storeOtp(email, otp);

    await queueOtpEmail({email, otp});
    logger.info({
        event: "SIGNUP_OTP_SENT",
        userId: user.id,
    });

    return {message: "OTP sent to email. "};

}


const login = async ({
        email,
        password
    }) => {
        const user = await userRepo.findByEmail(email);

        if (!user) {
            throw new AppError(
                "Invalid credentials",
                401
            );
        }

        const passwordMatches = await bcrypt.compare(password, user.password);
        if (!passwordMatches){
            throw new AppError(
                "invalid credentials",
                401
            );
        };

        const otp = generateOtp();
        await storeOtp(email, otp);

        logger.info({
            event: "LOGIN_OTP_SENT",
            userId: user.id,
        })

        return {message: "OTP sent to email. "};
    };

    module.exports = {
        signup,
        login
    
    };