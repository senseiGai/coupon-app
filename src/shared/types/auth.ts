import { User, UserRole } from './user';

export interface RegisterDto {
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: number;
    email: string;
    role: UserRole;
    balance: number;
  };
}

export interface RegisterResponse extends User {
  access_token: string;
}

export interface ProfileResponse {
  id: number;
  email: string;
  role: UserRole;
  balance: number;
  iat: number;
  exp: number;
}
