import axios from 'axios';

export const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// 1. REQUEST INTERCEPTOR: Her isteğe sessionStorage'daki güncel token'ı ekler
api.interceptors.request.use(
    (config) => {
        const token = sessionStorage.getItem('smarttransit_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// 2. RESPONSE INTERCEPTOR: 401 hatası yakalandığında oturumu temizleyip login'e yönlendirir
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            sessionStorage.removeItem('smarttransit_token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);