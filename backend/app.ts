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
// import crypto from 'crypto';
import CryptoJS from 'crypto-js';
import { v4 as uuidv4 } from 'uuid';


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



app.get('/protected-resource', (req: any, res: any) => {
  const authorizationHeader = req.headers['authorization'];

  console.log("authorizationHeader", authorizationHeader)
  if (!authorizationHeader || !authorizationHeader.startsWith('Digest')) {
    const nonce = uuidv4();
    res.setHeader('WWW-Authenticate', `Digest realm="Protected Area", qop="auth", nonce="${nonce}", opaque="2929b8e007e9c3edd69d915068815d71"`);
    return res.status(401).json({ message: 'Unauthorized' });
  }
  // Parse the Digest Authentication header
  const authHeader = parseDigestAuthorization(authorizationHeader); // You will need to write this function
  const users: any = {
    username: "username",
    password: CryptoJS.SHA256("password").toString() // hashed password
  }; // Store users and their password hashes here (replace with your DB)
  
  const { username, response, nonce, cnonce, uri } = authHeader;
  
  // Find the user and verify the hashed password response
  const user = users['username'];

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const passwordHash = user.password; // Stored hashed password in the database

  const ha1 = `${username}:${nonce}:${cnonce}:${passwordHash}`;
  const ha2 = `GET:/protected-resource`;
  let nc = 1;  // Starting value of nc, which is a hexadecimal count

  // Convert `nc` to a zero-padded 8-digit hexadecimal string
  const ncHex = nc.toString(16).padStart(8, '0');
  
  // Now you can use `ncHex` in your digest calculation
  
  const expectedResponse = CryptoJS.MD5(
    `${CryptoJS.MD5(ha1)}:${nonce}:${ncHex}:${cnonce}:auth:${CryptoJS.MD5(ha2)}`
  ).toString();

    return res.status(200).json({ message: 'Protected content accessed' });

  /* if (response === expectedResponse) {
    return res.status(200).json({ message: 'Protected content accessed' });
  } */

  res.status(401).json({ message: 'Invalid credentials' });
});

function parseDigestAuthorization(header: any) {
  const parts = header.split(' ');
  if (parts.length < 2) return {}; // Ensure there are parts to parse

  const paramsString = parts.slice(1).join(' '); // Join everything after "Digest"
  const params = paramsString.split(',').reduce((acc: any, part:string) => {
    const [key, value] = part.includes('=') ? part.split('=') : [null, null];
    if (key && value) {
      acc[key.trim()] = value.replace(/"/g, '').trim();
    }
    return acc;
  }, {});
  
  return params;
}

app.use(bodyParser.json());
app.use(compression());

app.use(cors({
  origin: 'http://localhost:3001',
  credentials: true, // Allow cookies and credentials to be sent
  methods: 'GET, POST, PUT, DELETE, OPTIONS',
  allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept, Authorization'
}));

app.options('/protected-resource', (req, res) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:3001");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.sendStatus(200);  // Preflight response
});








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
