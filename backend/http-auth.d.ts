declare module 'http-auth' {
    export interface BasicAuthOptions {
      realm: string;
    }
  
    export function basic(options: BasicAuthOptions): any;
    export function digest(options: BasicAuthOptions): any;
    // Add any other function signatures or types here as needed
  }
  