const logger = require("../utils/logger");

module.exports = (err,req,res,next) => {
    logger.error({
        message: err.message,
        stack: err.stack,
    });

    const statusCode = err.statusCode || 500;

    res.status(statusCode).json({
        success:false,
        message: statusCode === 500 ? "Internal server Error" :err.message
    });
};