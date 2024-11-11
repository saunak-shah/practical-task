import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";
import { Request, Response, NextFunction } from "express";
import * as CryptoJS from 'crypto-js';
import { User } from "../models/User";
import crypto from 'crypto';

dotenv.config();
let users: any = {}; // In-memory user store (for demo purposes)

// Generate Digest Hash function
function generateDigestHash(username: any, password: any, realm: any, nonce: any, method: string, uri: string) {
    const ha1 = crypto.createHash('md5').update(`${username}:${realm}:${password}`).digest('hex');
    const ha2 = crypto.createHash('md5').update(`${method}:${uri}`).digest('hex');
    return crypto.createHash('md5').update(`${ha1}:${nonce}:${ha2}`).digest('hex');
  }
  

const digestAuth: any = async (req: Request, res: Response, next: NextFunction) => {
    users = {
        'username': 'password123'  // Plain password stored in backend for demo purposes (use a hashed password in real scenarios)
      };
    const { path } = req;
    if (path !== "/api/users/login") {
        return next();
    }

    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).set('WWW-Authenticate', `Digest realm="Test", qop="auth", nonce="${process.env.AUTH_NONCE}", opaque="opaque"`);
    }
    console.log("authHeader",authHeader)

    const authParts = authHeader.split(' ')[1].split(',');
  const params: any = {};
  authParts.forEach(part => {
    const [key, value] = part.trim().split('=');
    params[key] = value.replace(/"/g, '');
  });

  console.log("authParts",authParts)

  const { username, response, realm, uri, qop, nonce: receivedNonce, nc, cnonce, algorithm } = params;

  // Check if the nonce matches
  if (receivedNonce !== process.env.AUTH_NONES) {
    return res.status(401).set('WWW-Authenticate', `Digest realm="Test", qop="auth", nonce="${process.env.AUTH_NONES}", opaque="opaque"`);
  }

  // Hash the password and compare the response hash
  const hash = generateDigestHash(username, users[username], realm, receivedNonce, req.method, req.originalUrl);

  if (hash !== response) {
    return res.status(401).set('WWW-Authenticate', `Digest realm="Test", qop="auth", nonce="${process.env.AUTH_NONES}", opaque="opaque"`);
  }

};

// Add JWT generation and verification methods as before
const signJwt = (data: object): string | undefined => {
    try {
        return jwt.sign(data, process.env.JWT_SECRET_KEY as string);
    } catch (error) {
        console.error("JWT sign error:", error);
    }
};

const verifyJwt = (token: string): JwtPayload | undefined => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY as string);
        return typeof decoded === "object" ? decoded : undefined;
    } catch (error) {
        console.error("JWT verify error:", error);
        return undefined;
    }
};

export { signJwt, verifyJwt, digestAuth };
