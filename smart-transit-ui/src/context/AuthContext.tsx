import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import type { UserSession } from '../types/auth';

interface AuthContextType {
    token: string | null;
    user: UserSession | null;
    isAuthenticated: boolean;
    loading: boolean;
    login: (token: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// JWT Token'ı güvenli şekilde çözen yardımcı fonksiyon
const parseJwtToken = (tokenStr: string): UserSession | null => {
    try {
        const decoded: any = jwtDecode(tokenStr);
        const exp = decoded.exp ? decoded.exp * 1000 : 0;

        // Token süresi dolmuşsa oturumu başlatma
        if (exp > 0 && exp < Date.now()) {
            return null;
        }

        return {
            userId: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || decoded.sub || decoded.nameid || decoded.userId || '',
            email: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || decoded.email || '',
            role: decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || decoded.role || 'Passenger'
        };
    } catch {
        return null;
    }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // 🟢 DÜZELTME: Okuma sessionStorage'dan yapılıyor (Doğruydu, böyle kalmalı)
    const [token, setToken] = useState<string | null>(() => sessionStorage.getItem('smarttransit_token'));

    const [user, setUser] = useState<UserSession | null>(() => {
        const storedToken = sessionStorage.getItem('smarttransit_token');
        return storedToken ? parseJwtToken(storedToken) : null;
    });

    const [loading] = useState<boolean>(false);

    useEffect(() => {
        if (token) {
            const decodedUser = parseJwtToken(token);
            if (!decodedUser) {
                logout();
            } else {
                setUser(decodedUser);
            }
        } else {
            setUser(null);
        }
    }, [token]);

    const login = (newToken: string) => {
        // 🟢 DÜZELTME: Kayıt işlemi artık sessionStorage'a yapılıyor!
        sessionStorage.setItem('smarttransit_token', newToken);
        setToken(newToken);
        const decodedUser = parseJwtToken(newToken);
        setUser(decodedUser);
    };

    const logout = useCallback(() => {
        // 🟢 DÜZELTME: Silme işlemi artık sessionStorage'dan yapılıyor!
        sessionStorage.removeItem('smarttransit_token');
        setToken(null);
        setUser(null);
    }, []);

    return (
        <AuthContext.Provider
            value={{
                token,
                user,
                isAuthenticated: !!token && !!user,
                loading,
                login,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth bir AuthProvider içerisinde kullanılmalıdır.');
    }
    return context;
};