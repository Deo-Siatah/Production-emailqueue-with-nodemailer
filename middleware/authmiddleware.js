const jwt = require("jsonwebtoken");
const AppError = require("../utils/appError");
const logger = require("../utils/logger");
const e = require("express");

const authMiddleware = (req,res,next) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            throw new AppError("Unauthorized", 401);
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;

        logger.info({
            event: "AUTH_SUCCESS",
            userId: decoded,
            path: req.path,
        });
        next();

    } catch (err) {
        logger.warn({
            event: "AUTH_FAILURE",
            message: err.message,
            path: req.path,
        });

        return res.status(401).json({
            success: false,
            message: "Unauthorized"
        });
    }
};

module.exports = authMiddleware;