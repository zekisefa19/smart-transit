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
    Avatar,
    Chip,
    Button,
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    DirectionsBus as BusIcon,
    CreditCard as CardIcon,
    Warning as WarningIcon,
    Settings as SettingsIcon,
    Logout as LogoutIcon,
    ConfirmationNumber as TicketIcon,
} from '@mui/icons-material';
import { useAuth } from '../../../context/AuthContext';

const DRAWER_WIDTH = 260;

export const MainLayout: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const roleStr = String(user?.role ?? '');
    const isOperator = roleStr === 'Operator' || roleStr === '2';

    // Operatör Menü Başlıkları
    const operatorMenuItems = [
        { text: 'Genel Bakış', icon: <DashboardIcon />, path: '/operator/dashboard' },
        { text: 'Hat & Sefer Yönetimi', icon: <BusIcon />, path: '/operator/lines' },
        { text: 'Kart İşlemleri', icon: <CardIcon />, path: '/operator/cards' },
        { text: 'Şüpheli İşlemler', icon: <WarningIcon />, path: '/operator/suspicious' },
        { text: 'Sistem Ayarları', icon: <SettingsIcon />, path: '/operator/settings' },
    ];

    // Yolcu Menü Başlıkları
    const passengerMenuItems = [
        { text: 'Genel Bakış', icon: <DashboardIcon />, path: '/dashboard' },
        { text: 'Kartlarım & Abonmanlar', icon: <CardIcon />, path: '/my-cards' },
        { text: 'Bakiye Yükle', icon: <TicketIcon />, path: '/top-up' },
        { text: 'İşlem Geçmişi', icon: <TicketIcon />, path: '/history' },
    ];

    const menuItems = isOperator ? operatorMenuItems : passengerMenuItems;

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f8fafc' }}>
            {/* SOL SIDEBAR */}
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
                        borderRight: 'none',
                    },
                }}
            >
                {/* LOGO ALANI */}
                <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ bgcolor: '#2563eb', p: 1, borderRadius: 2, display: 'flex' }}>
                        <BusIcon sx={{ color: '#ffffff' }} />
                    </Box>
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
                            SmartTransit
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                            {isOperator ? 'Operator Portal' : 'Passenger Portal'}
                        </Typography>
                    </Box>
                </Box>

                <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

                {/* MENÜ LİSTESİ */}
                <List sx={{ px: 2, py: 2, flexGrow: 1 }}>
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                                <ListItemButton
                                    onClick={() => navigate(item.path)}
                                    sx={{
                                        borderRadius: 2,
                                        bgcolor: isActive ? '#2563eb' : 'transparent',
                                        color: isActive ? '#ffffff' : '#94a3b8',
                                        '&:hover': {
                                            bgcolor: isActive ? '#2563eb' : 'rgba(255,255,255,0.05)',
                                            color: '#ffffff',
                                        },
                                    }}
                                >
                                    <ListItemIcon sx={{ color: isActive ? '#ffffff' : '#94a3b8', minWidth: 40 }}>
                                        {item.icon}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={
                                            <Typography sx={{ fontSize: '0.9rem', fontWeight: isActive ? 700 : 500 }}>
                                                {item.text}
                                            </Typography>
                                        }
                                    />
                                </ListItemButton>
                            </ListItem>
                        );
                    })}
                </List>

                {/* ALT KULLANICI ALANI */}
                <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
                <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, overflow: 'hidden' }}>
                        <Avatar sx={{ bgcolor: '#2563eb', width: 36, height: 36, fontSize: '0.9rem' }}>
                            {user?.email?.charAt(0).toUpperCase() || 'U'}
                        </Avatar>
                        <Box sx={{ overflow: 'hidden' }}>
                            <Typography variant="body2" noWrap sx={{ color: '#ffffff', fontWeight: 'bold' }}>
                                {user?.email || 'Kullanıcı'}
                            </Typography>
                            <Chip
                                label={isOperator ? 'Operator' : 'Passenger'}
                                size="small"
                                color={isOperator ? 'primary' : 'default'}
                                sx={{ height: 18, fontSize: '0.65rem' }}
                            />
                        </Box>
                    </Box>
                    <Button onClick={logout} size="small" sx={{ minWidth: 'auto', color: '#ef4444' }}>
                        <LogoutIcon fontSize="small" />
                    </Button>
                </Box>
            </Drawer>

            {/* SAĞ İÇERİK ALANI */}
            <Box component="main" sx={{ flexGrow: 1, p: 4, width: `calc(100% - ${DRAWER_WIDTH}px)` }}>
                <Outlet />
            </Box>
        </Box>
    );
};