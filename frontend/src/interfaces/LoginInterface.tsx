// src/interfaces/LoginInterface.ts

export interface LoginFormValues {
    emailID: string;
    password: string;
  }
  
  export interface LoginResponse {
    data: {
      token: string;
      user: {
        active: boolean;
      };
    };
  }
  