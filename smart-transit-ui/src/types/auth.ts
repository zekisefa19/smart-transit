export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    fullName: string;
    email: string;
    password: string;
    role?: string;
}

export interface AuthResponse {
    accessToken: string; // token yerine accessToken yapıldı
    refreshToken?: string;
    expiresAt?: string;
    userId?: string;
    email?: string;
    role?: string;
}

export interface UserSession {
    userId: string;
    email: string;
    role: string;
}