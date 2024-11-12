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
import crypto from 'crypto';
import { User } from "./models/User";


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

const users: any = {}; // Store users and their password hashes here (replace with your DB)

// Utility to create a nonce (for simplicity, use a random string or timestamp)
const generateNonce = () => {
  return crypto.randomBytes(16).toString('hex');
};

// Protected route (requires Digest Authentication)
app.get('/protected-resource', async (req: any, res: any) => {
  const authorizationHeader = req.headers['authorization'];
  console.log("users=====================", users)

  console.log("authorizationHeader", authorizationHeader)
  if (!authorizationHeader || !authorizationHeader.startsWith('Digest')) {
    const nonce = generateNonce();
    res.setHeader('WWW-Authenticate', `Digest realm="Protected Area", qop="auth", nonce="${nonce}", opaque="${crypto.createHash('md5').update('Protected Area').digest('hex')}"`);
    return res.status(401).json({ message: 'Unauthorized' });
  }

  console.log("11111111111111111111111")
  // Parse the Digest Authentication header
  const authHeader = parseDigestAuthorization(authorizationHeader); // You will need to write this function
  console.log("2222222222222222222222222222", authHeader)

  const { username, response, nonce, uri } = authHeader;

  console.log("username", username)
  console.log("response", response)
  console.log("nonce", nonce)
  console.log("uri", uri)

  // Find the user and verify the hashed password response
  const user = await User.findOne({ emailID: username });

  // const user = users[username];
  console.log("4444444444444444444444444444", user)

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const passwordHash = user.password; // Stored hashed password in the database

  console.log("kkkkkkkkkkkkkkkk", passwordHash)
  // Compute the hash of the request
  const ha1 = crypto.createHash('md5').update(`${username}:${'Protected Area'}:${passwordHash}`).digest('hex');
  console.log("ha1ha1ha1ha1ha1ha1ha1", ha1)

  const ha2 = crypto.createHash('md5').update(`GET:${uri}`).digest('hex');
  console.log("ha2ha2ha2ha2ha2ha2ha2ha2", ha2)

  const expectedResponse = crypto.createHash('md5').update(`${ha1}:${nonce}:00000001:${response}`).digest('hex');

  console.log("response", response)
  console.log("expectedResponse", expectedResponse)
  if (response === expectedResponse) {
    return res.status(200).json({ message: 'Protected content accessed' });
  }

  res.status(401).json({ message: 'Invalid credentials' });
});

// Parse Digest Authorization header
function parseDigestAuthorization(header: string) {
  const parts = header.split(' ');
  if (parts.length < 2) return {}; // Ensure there are parts to parse

  const paramsString = parts.slice(1).join(' '); // Join everything after "Digest"
  const params = paramsString.split(',').reduce((acc: any, part: string) => {
    const [key, value] = part.includes('=') ? part.split('=') : [null, null];
    if (key && value) {
      acc[key.trim()] = value.replace(/"/g, '').trim();
    }
    return acc;
  }, {});
  
  return params;
}


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
