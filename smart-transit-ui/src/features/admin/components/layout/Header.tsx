import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    AppBar,
    Toolbar,
    IconButton,
    Typography,
    Badge,
    Menu,
    MenuItem,
    Avatar,
    Box,
    Tooltip,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircle from '@mui/icons-material/AccountCircle';
import Logout from '@mui/icons-material/Logout';
import Settings from '@mui/icons-material/Settings';

interface HeaderProps {
    drawerWidth: number;
    handleDrawerToggle: () => void;
    onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ drawerWidth, handleDrawerToggle, onLogout }) => {
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    // Çıkış talebi geldiğinde diyalogu açar
    const handleLogoutRequest = () => {
        handleMenuClose();
        setIsLogoutDialogOpen(true);
    };

    // Kullanıcı 'Evet' dediğinde çalışacak fonksiyon
    const handleLogoutConfirm = () => {
        setIsLogoutDialogOpen(false);
        if (onLogout) {
            onLogout();
        }
        navigate('/login');
    };

    return (
        <>
            <AppBar
                position="fixed"
                elevation={0}
                sx={{
                    width: { md: `calc(100% - ${drawerWidth}px)` },
                    ml: { md: `${drawerWidth}px` },
                    bgcolor: '#0f172a',
                    color: '#ffffff',
                    borderBottom: '1px solid #1e293b',
                    boxShadow: 'none',
                }}
            >
                <Toolbar>
                    {/* Mobil Hamburger Menü Butonu */}
                    <IconButton
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { md: 'none' }, color: '#94a3b8', '&:hover': { color: '#ffffff' } }}
                    >
                        <MenuIcon />
                    </IconButton>

                    <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 700, color: '#f8fafc' }}>
                        Admin Dashboard
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        {/* Bildirim Zili */}
                        <IconButton sx={{ color: '#94a3b8', '&:hover': { color: '#ffffff', bgcolor: '#1e293b' } }}>
                            <Badge badgeContent={3} color="error">
                                <NotificationsIcon />
                            </Badge>
                        </IconButton>

                        {/* Profil Avatar ve Menü */}
                        <Tooltip title="Hesap Ayarları">
                            <IconButton onClick={handleMenuOpen} size="small">
                                <Avatar sx={{ width: 36, height: 36, bgcolor: '#2563eb', fontSize: 14, fontWeight: 800 }}>
                                    AD
                                </Avatar>
                            </IconButton>
                        </Tooltip>

                        {/* Çıkış Yap Butonu */}
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<Logout />}
                            onClick={handleLogoutRequest}
                            sx={{
                                color: '#ef4444',
                                borderColor: 'rgba(239, 68, 68, 0.3)',
                                fontWeight: 700,
                                textTransform: 'none',
                                borderRadius: 2,
                                px: 1.5,
                                py: 0.6,
                                '&:hover': {
                                    borderColor: '#ef4444',
                                    bgcolor: 'rgba(239, 68, 68, 0.1)',
                                },
                            }}
                        >
                            Çıkış Yap
                        </Button>
                    </Box>

                    {/* Dropdown Profil Menüsü */}
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                        onClick={handleMenuClose}
                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                        slotProps={{
                            paper: {
                                sx: {
                                    bgcolor: '#0f172a',
                                    color: '#ffffff',
                                    border: '1px solid #1e293b',
                                    mt: 1.5,
                                    '& .MuiMenuItem-root': {
                                        fontSize: 14,
                                        '&:hover': {
                                            bgcolor: '#1e293b',
                                        },
                                    },
                                },
                            },
                        }}
                    >
                        <MenuItem onClick={handleMenuClose}>
                            <AccountCircle sx={{ mr: 1.5, fontSize: 20, color: '#94a3b8' }} /> Profilim
                        </MenuItem>
                        <MenuItem onClick={handleMenuClose}>
                            <Settings sx={{ mr: 1.5, fontSize: 20, color: '#94a3b8' }} /> Ayarlar
                        </MenuItem>
                        <MenuItem onClick={handleLogoutRequest} sx={{ color: '#ef4444' }}>
                            <Logout sx={{ mr: 1.5, fontSize: 20, color: '#ef4444' }} /> Çıkış Yap
                        </MenuItem>
                    </Menu>
                </Toolbar>
            </AppBar>

            {/* ÇIKIŞ ONAY DIALOGU */}
            <Dialog
                open={isLogoutDialogOpen}
                onClose={() => setIsLogoutDialogOpen(false)}
                slotProps={{
                    paper: {
                        sx: {
                            bgcolor: '#0f172a',
                            color: '#ffffff',
                            border: '1px solid #1e293b',
                            borderRadius: 3,
                            p: 1,
                            minWidth: 320,
                        },
                    },
                }}
            >
                <DialogTitle sx={{ fontWeight: 800 }}>Çıkış Yap</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ color: '#94a3b8' }}>
                        Oturumunuzu kapatmak istediğinize emin misiniz?
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 2, pt: 0 }}>
                    <Button onClick={() => setIsLogoutDialogOpen(false)} sx={{ color: '#94a3b8', fontWeight: 600 }}>
                        Vazgeç
                    </Button>
                    <Button
                        onClick={handleLogoutConfirm}
                        variant="contained"
                        color="error"
                        autoFocus
                        sx={{ borderRadius: 2, fontWeight: 700 }}
                    >
                        Evet, Çıkış Yap
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};