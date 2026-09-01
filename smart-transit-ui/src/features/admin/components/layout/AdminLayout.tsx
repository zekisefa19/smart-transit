import React, { useState, useEffect } from 'react';
import { Box, CssBaseline, Toolbar } from '@mui/material';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

const DRAWER_WIDTH = 260;

interface AdminLayoutProps {
    children?: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const [currentPath, setCurrentPath] = useState(location?.pathname || '/admin/dashboard');

    useEffect(() => {
        if (location?.pathname) {
            setCurrentPath(location.pathname);
        }
    }, [location?.pathname]);

    const handleDrawerToggle = () => {
        setMobileOpen((prev) => !prev);
    };

    const handleNavigate = (path: string) => {
        setCurrentPath(path);
        navigate(path);
        if (mobileOpen) setMobileOpen(false);
    };

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f8fafc' }}>
            <CssBaseline />

            {/* Üst Bar */}
            <Header drawerWidth={DRAWER_WIDTH} handleDrawerToggle={handleDrawerToggle} />

            {/* Yan Menü */}
            <Sidebar
                drawerWidth={DRAWER_WIDTH}
                mobileOpen={mobileOpen}
                handleDrawerToggle={handleDrawerToggle}
                currentPath={currentPath}
                onNavigate={handleNavigate}
            />

            {/* Ana İçerik Alanı */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
                    minHeight: '100vh',
                }}
            >
                <Toolbar />
                {children || <Outlet />}
            </Box>
        </Box>
    );
};

export default AdminLayout;