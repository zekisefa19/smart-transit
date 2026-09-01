import axios from 'axios';

// 1. Backend Port Numarası (Portunuz neyse onu yazın, örn: 5176)
export const api = axios.create({
    baseURL: 'http://localhost:5176/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// 2. REQUEST INTERCEPTOR: Profil çekerken/güncellerken JWT Token'ı isteğe ekler
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('smarttransit_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export interface RegisterDto {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
}

export interface VerifyEmailDto {
    email: string;
    code: string;
}

export interface LoginDto {
    email: string;
    password: string;
}

export const AuthService = {
    // 1. Giriş Yapma (Token'ı otomatik olarak localStorage'a kaydeder)
    login: async (credentials: LoginDto) => {
        const response = await api.post('/Auth/login', credentials);

        // Backend'den dönen yanıttaki token'ı yakalayıp tarayıcıya kaydeder
        const token = response.data?.token || response.data?.accessToken;
        if (token) {
            sessionStorage.setItem('smarttransit_token', token);
        }

        return response.data;
    },

    // 2. Kayıt İsteği Atma
    register: async (data: RegisterDto) => {
        const response = await api.post('/Auth/register', {
            firstName: data.firstName,
            lastName: data.lastName,
            fullName: `${data.firstName} ${data.lastName}`.trim(),
            email: data.email,
            password: data.password,
            confirmPassword: data.confirmPassword,
        });
        return response.data;
    },

    // 3. Mail Doğrulama Kodu Onayı
    verifyEmail: async (data: VerifyEmailDto) => {
        const response = await api.post('/Auth/verify-email', data);
        return response.data;
    },

    // 4. Doğrulama Kodunu Tekrar Gönderme
    resendCode: async (email: string) => {
        const response = await api.post('/Auth/resend-verification-code', { email });
        return response.data;
    },

    // 5. Çıkış Yapma (Oturumu Temizler)
    logout: () => {
        localStorage.removeItem('smarttransit_token');
        window.location.href = '/login';
    }
};