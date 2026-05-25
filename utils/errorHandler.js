const logger = require("./logger");

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  const response = {
    success: false,
    message: err.message || "Internal Server Error",
  };

  // Operational errors (trusted errors we created)
  if (err.isOperational) {
    logger.warn({
      event: "OPERATIONAL_ERROR",
      message: err.message,
      path: req.path,
      method: req.method,
      statusCode,
    });

    return res.status(statusCode).json(response);
  }

  // Programming / unexpected errors
  logger.error({
    event: "UNEXPECTED_ERROR",
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  return res.status(500).json({
    success: false,
    message: "Something went wrong",
  });
};

module.exports = errorHandler;