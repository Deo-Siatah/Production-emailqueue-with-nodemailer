const { Pool } = require("pg");
const { DBCONFIG } = require("./configs");
const logger = require("../../utils/logger");

const db = new Pool({
  connectionString: DBCONFIG.connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});

db.on("connect", () => {
  logger.info({
    event: "DB_CONNECTED",
  });
});

db.on("error", (err) => {
  logger.error({
    event: "DB_ERROR",
    message: err.message,
  });
});

module.exports = db;