import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";
import { Request, Response, NextFunction, RequestHandler } from "express";

dotenv.config();

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

    console.log("jwt===============", req.path)
    // Skip middleware for login and signup routes
    if (path === "/api/users/login" || path === "/api/users/signup") {
        return next();
    }

    const jwtToken = req.get("Authorization");
    console.log("jwtToken===============", jwtToken)

    
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

export { signJwt, verifyJwt, userMiddleware };
