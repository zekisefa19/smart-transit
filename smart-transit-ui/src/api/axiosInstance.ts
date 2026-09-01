import axios from 'axios';

// API Port numarası Program.cs'teki port ile aynı olmalıdır (Örn: 5176)
const API_BASE_URL = 'http://localhost:5176/api';

export const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 1. REQUEST INTERCEPTOR: Token'ı sessionStorage üzerinden oku
axiosInstance.interceptors.request.use(
    (config) => {
        const token = sessionStorage.getItem('smarttransit_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// 2. RESPONSE INTERCEPTOR: 401 durumunda sessionStorage'ı temizle ve yönlendir
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            sessionStorage.removeItem('smarttransit_token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);