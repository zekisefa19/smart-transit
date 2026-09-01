import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
    allowedRoles?: Array<'Passenger' | 'Operator' | 'Admin' | string>;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
    const auth = useAuth() as any;
    const { isAuthenticated, user, isLoading, loading } = auth;

    // 1. Hafızadaki token kontrolü
    const hasToken = !!localStorage.getItem('smarttransit_token');

    // 2. Auth yüklenme ekranı
    if (isLoading || loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress color="primary" />
            </Box>
        );
    }

    // 3. Oturum kontrolü
    if (!hasToken && !isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // 4. Esnek Rol Kontrolü (Sayı veya Metin Tipi Uyumlu)
    if (allowedRoles && user) {
        const userRoleStr = String(user.role ?? '').toLowerCase();

        const hasAccess = allowedRoles.some((role) => {
            const allowedStr = String(role).toLowerCase();
            // "2" == "operator" veya "1" == "passenger" eşleşmelerini de kapsar
            if (userRoleStr === allowedStr) return true;
            if ((userRoleStr === '2' || userRoleStr === 'operator') && allowedStr === 'operator') return true;
            if ((userRoleStr === '1' || userRoleStr === 'passenger') && allowedStr === 'passenger') return true;
            return false;
        });

        if (!hasAccess) {
            return <Navigate to="/unauthorized" replace />;
        }
    }

    return <Outlet />;
};

export default ProtectedRoute;