const authVerificationService = require("../services/authVerificationService");
const authService = require("../services/authService")
const logger = require("../utils/logger");
const asyncHandler = require("../utils/asyncHandler");


const signupController = asyncHandler(async (req,res) => {
    const {name,email,password} = req.body;

    const result = await authService.signup({
        name,
        email,
        password
    });
    logger.info({
        event: "SIGNUP_SUCCESS",
        email
    });
    return res.status(201).json(result);
});

const loginController = asyncHandler(async (req, res) => {
    const {email, password} = req.body;
    const result = await authService.login({email, password});

    logger.info({
        event: "LOGIN_OTP_REQUESTED",
        email
    });
    return res.status(200).json(result);
})

const verifyOtpController = asyncHandler(async (req,res) => {
    const {email, otp } = req.body;
    const result = await authVerificationService.verifyOtpAndLogin({email,otp});

    //set http-onlycookie
    res.cookie("token", result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000, // 7 days
    });

    logger.info({
        event: "LOGIN_SUCCESS",
        userId: result.user.id,
    });
    return res.status(200).json({
        message: "Login successful",
        user: result.user,
    });
});

module.exports = {loginController,signupController,verifyOtpController}
