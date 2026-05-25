import dotenv from "dotenv";
dotenv.config();

export const DBCONFIG = {
    connectionString: process.env.DATABASE_URL
};