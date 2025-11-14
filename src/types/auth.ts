export interface Admin {
     id: string;
     username: string;
     email: string;
     name: string;
     role: string;
     isActive: boolean;
     createdAt: string;
     updatedAt: string;
}

export interface Session {
     access_token: string;
     refresh_token: string;
     expires_in: number;
}

export interface LoginResponse {
     data: {
          admin: Admin;
          session: Session;
     };
     statusCode: number;
}

export interface LoginPayload {
     username: string;
     password: string;
}
