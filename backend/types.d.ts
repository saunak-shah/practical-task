// types.d.ts
import { Request } from 'express';

declare global {
  namespace Express {
    export interface Request {
      user?: any;  // Replace `any` with a specific type if you know it
    }
  }
}
