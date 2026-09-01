import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    Box,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Typography,
    Divider,
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    CreditCard as CardIcon,
    Map as MapIcon,
    DirectionsCar as VehicleIcon,
    DirectionsBus as BusIcon,
} from '@mui/icons-material';
import Navbar from './Navbar';

const DRAWER_WIDTH = 260;

export const OperatorLayout: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        { text: 'Kontrol Paneli', icon: <DashboardIcon />, path: '/operator/dashboard' },
        { text: 'Kart Yönetimi', icon: <CardIcon />, path: '/operator/cards' },
        { text: 'Rota & Hat Yönetimi', icon: <MapIcon />, path: '/operator/routes' },
        { text: 'Araç & Filo Yönetimi', icon: <VehicleIcon />, path: '/operator/vehicles' },
    ];

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%', bgcolor: '#f8fafc' }}>
            {/* Üst Navbar */}
            <Navbar />

            {/* İçerik Alanı (Sidebar + Sağ Ana Sayfa) */}
            <Box sx={{ display: 'flex', flexGrow: 1, width: '100%', pt: '64px' }}>
                {/* Sol Sabit Sidebar */}
                <Drawer
                    variant="permanent"
                    sx={{
                        width: DRAWER_WIDTH,
                        flexShrink: 0,
                        '& .MuiDrawer-paper': {
                            width: DRAWER_WIDTH,
                            boxSizing: 'border-box',
                            bgcolor: '#0f172a',
                            color: '#f8fafc',
                            borderRight: '1px solid #1e293b',
                            top: '64px',
                            height: 'calc(100vh - 64px)',
                            zIndex: 1000,
                        },
                    }}
                >
                    <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <BusIcon sx={{ color: '#38bdf8', fontSize: 28 }} />
                        <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#ffffff', lineHeight: 1.2 }}>
                                SmartTransit
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                                Operatör Paneli
                            </Typography>
                        </Box>
                    </Box>

                    <Divider sx={{ borderColor: '#1e293b' }} />

                    <List sx={{ px: 1.5, py: 2 }}>
                        {menuItems.map((item) => {
                            const selected = location.pathname === item.path;
                            return (
                                <ListItem key={item.path} disablePadding sx={{ mb: 1 }}>
                                    <ListItemButton
                                        selected={selected}
                                        onClick={() => navigate(item.path)}
                                        sx={{
                                            borderRadius: 2,
                                            '&.Mui-selected': {
                                                bgcolor: '#0284c7',
                                                color: '#ffffff',
                                                '& .MuiListItemIcon-root': { color: '#ffffff' },
                                                '&:hover': { bgcolor: '#0369a1' }
                                            },
                                            '&:hover': { bgcolor: '#1e293b' },
                                        }}
                                    >
                                        <ListItemIcon sx={{ color: selected ? '#ffffff' : '#94a3b8', minWidth: 40 }}>
                                            {item.icon}
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={item.text}
                                            slotProps={{ primary: { sx: { fontWeight: 600, fontSize: '0.9rem' } } }}
                                        />
                                    </ListItemButton>
                                </ListItem>
                            );
                        })}
                    </List>
                </Drawer>

                {/* Sağ Ana İçerik */}
                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        p: 3.5,
                        width: `calc(100% - ${DRAWER_WIDTH}px)`,
                        minHeight: 'calc(100vh - 64px)',
                        boxSizing: 'border-box',
                        position: 'relative',
                        zIndex: 1,
                    }}
                >
                    {/* key={location.pathname} eklenerek route değişimlerinde içeriğin zorunlu yenilenmesi sağlandı */}
                    <Outlet key={location.pathname} />
                </Box>
            </Box>
        </Box>
    );
};

export default OperatorLayout;