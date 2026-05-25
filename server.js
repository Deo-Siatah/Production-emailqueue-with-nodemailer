require("dotenv").config();
require("./infrastructure/db/client");
const express = require("express");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/authRoutes");
const logger = require("./utils/logger");
const errorHandler = require("./utils/errorHandler");


const app = express();

//middleware
app.use(express.json());
app.use(cookieParser());

//routes
app.use("/api/auth", authRoutes);

//health check

//Error handler
app.use(errorHandler);

PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    logger.info({
        event: "SERVER_STARTED",
        port: PORT,
    })
    console.log(`Server running on port ${PORT}`);
});
