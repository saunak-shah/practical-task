import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";
import { Request, Response, NextFunction, RequestHandler } from "express";
import * as CryptoJS from 'crypto-js';
import crypto from 'crypto';
import { User } from "../models/User";
import bcrypt from "bcryptjs";


dotenv.config();



// Generate Digest Hash function
function generateDigestHash(username: any, password: string, realm: string, nonce: any, method: string, uri: any) {
    // Generate HA1 using MD5 hash of username, realm, and password
    const ha1 = CryptoJS.MD5(`${username}:${realm}:${password}`).toString();
    // Generate HA2 using MD5 hash of HTTP method and URI
    const ha2 = CryptoJS.MD5(`${method}:${uri}`).toString();
    console.log("HA1:", ha1);  // Log HA1 for debugging
    console.log("HA2:", ha2);  // Log HA2 for debugging

    // Return the final Digest hash
    return CryptoJS.MD5(`${ha1}:${nonce}:${ha2}`).toString();
}


  
function signJwt(data: object): string | undefined {
    try {
        return jwt.sign(data, process.env.JWT_SECRET_KEY as string);
    } catch (error) {
        console.error("JWT sign error:", error);
    }
}

function verifyJwt(token: string): JwtPayload | undefined {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY as string);
        
        // Ensure the result is an object (JwtPayload) before returning
        if (typeof decoded === "object") {
            return decoded as JwtPayload;
        } else {
            console.error("Unexpected JWT payload type");
            return undefined;
        }
    } catch (error) {
        console.error("JWT verify error:", error);
        return undefined;
    }
}

const userMiddleware: any = (req: Request, res: Response, next: NextFunction) => {
    const { path } = req;

    // Skip middleware for login and signup routes
    if (path === "/api/users/login" || path === "/api/users/signup") {
        return next();
    }

    const jwtToken = req.get("Authorization");
    
    if (!jwtToken) {
        return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    const tokenData = verifyJwt(jwtToken);
    
    if (!tokenData) {
        return res.status(403).json({ error: "Forbidden: Invalid token" });
    }

    console.log("tokenData", tokenData);

    // Attach token data to request for downstream use
    (req as any).user = tokenData;
    
    next();
};


const digestAuth: any = async (req: Request, res: Response, next: NextFunction) => {

        const { path } = req;
    
        if (path !== "/api/users/login") {
            return next();
        }
    
        const authHeader = req.headers['authorization'];
        if (!authHeader) {
            return res.status(401).set('WWW-Authenticate', `Digest realm="Test", qop="auth", nonce="${process.env.AUTH_NONES}", opaque="opaque"`);
        }
    
        // Parse the authorization header
        const authString = authHeader.replace(/^Digest\s/, '');
        const authParts = authString.split(',');
        const params: any = {};
        authParts.forEach(part => {
            const [key, value] = part.trim().split('=');
            params[key] = value.replace(/"/g, '');
        });
    
        const { username, response, nonce: receivedNonce, uri, qop } = params;
        const method = req.method;  // HTTP method (GET, POST, etc.)
        const realm = 'Test';  // Define the realm, this should be the same on both client and server
    
        // Fetch the user from the database
        const user = await User.findOne({ emailID: username });
    
        if (!user) {
            return res.status(401).set('WWW-Authenticate', `Digest realm="Test", qop="auth", nonce="${process.env.AUTH_NONES}", opaque="opaque"`);
        }
    
        // Recalculate Digest Hash using the stored password and compare it with the response hash
        const expectedHash = generateDigestHash(username, user.password, realm, receivedNonce, method, uri);
    
        console.log("Expected Hash:", expectedHash);
        console.log("Client Response Hash:", response);
    
    // If hashes match, proceed with the request
    if (expectedHash === response) {
        console.log("all done=============")
        req.user = user;  // Attach the user to the request object
        req.body = params;
        return next();  // Proceed to the next middleware or route handler
    } else {
        return res.status(401).set('WWW-Authenticate', `Digest realm="Test", qop="auth", nonce="${process.env.AUTH_NONES}", opaque="opaque"`);
    }

    // If valid, proceed to the next middleware/route
    next();
};


export { signJwt, verifyJwt, userMiddleware, digestAuth };
