import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes";
import productRoutes from "./routes/productRoutes";
import compression from "compression";
import cors from "cors";
import { userMiddleware } from "./global/middleware";
import winston from "winston";


dotenv.config();

const app = express();

// Setup logging with winston
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.printf(({ timestamp, message }) => `${timestamp} ${message}`)
  ),
  transports: [
      new winston.transports.File({ filename: 'api.log' })
  ]
});

// Middleware for logging request and response details
app.use((req, res, next) => {
  const start = Date.now();
  
  // Log the request details
  logger.info(`Request: ${req.method} ${req.originalUrl} - ${JSON.stringify(req.body)} - ${JSON.stringify(req.query)}`);

  // Capture the response data and execution duration
  res.on('finish', () => {
      const duration = Date.now() - start;
      logger.info(`Response: ${req.method} ${req.originalUrl} - Status: ${res.statusCode} - Duration: ${duration}ms`);
  });

  next();
});

app.use(bodyParser.json());
app.use(compression());
app.use(cors({
    exposedHeaders: "Content-Disposition",
    origin: true,
}));

// custom middleware for token verification
app.use(userMiddleware);

// Connect MongoDB
mongoose
  .connect(
    `mongodb://${process.env.MONGODB_HOST}:${process.env.MONGODB_PORT}/${process.env.MONGODB_DB_NAME}`
  )
  .then(() => console.log("MongoDb connected"))
  .catch((err) => console.log("MongoDb connection error", err));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);

// Start the server
app.listen(process.env.APP_PORT, () => {
    console.log(`Server running on http://localhost:${process.env.APP_PORT}`)
});
