import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    AppBar,
    Toolbar,
    Typography,
    Box,
    Button,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    DialogContentText,
    IconButton,
    Badge,
    Popover,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Divider
} from '@mui/material';
import {
    DirectionsBus,
    Logout,
    AccountCircle,
    Notifications as NotificationsIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    Info as InfoIcon
} from '@mui/icons-material';
import { useAuth } from '../../../context/AuthContext';
import { NotificationService, type NotificationDto } from '../../../services/notificationService'; // Servis yolunu projenize göre kontrol edin

export const Navbar: React.FC = () => {
    const { user, logout } = useAuth();
    const [confirmOpen, setConfirmOpen] = useState(false);

    // --- Bildirim State'leri ---
    const [notifications, setNotifications] = useState<NotificationDto[]>([]);
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

    // Kullanıcı giriş yapmışsa bildirimleri backend'den çek
    useEffect(() => {
        if (user) {
            fetchNotifications();
        }
    }, [user]);

    const fetchNotifications = async () => {
        const data = await NotificationService.getNotifications();
        setNotifications(data);
    };
    const navigate = useNavigate();

    const handleLogoutConfirm = () => {
        setConfirmOpen(false);
        logout();
        navigate('/login');
    };

    // Açılır Menü Kontrolleri
    const handleNotificationClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleNotificationClose = () => {
        setAnchorEl(null);
    };

    // Bildirimi Okundu Olarak İşaretleme
    const handleMarkAsRead = async (id: string, isRead: boolean) => {
        if (!isRead) {
            await NotificationService.markAsRead(id);
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, isRead: true } : n)
            );
        }
    };

    // Bildirim Başlığına Göre İkon ve Renk Belirleme (C# Kodlarınızla Birebir Uyumlu)
    const getNotificationIcon = (title: string) => {
        const lowerTitle = title.toLowerCase();
        if (lowerTitle.includes('onaylanmadı') || lowerTitle.includes('red')) {
            return <CancelIcon sx={{ color: '#ef4444' }} />;
        }
        if (lowerTitle.includes('onay')) {
            return <CheckCircleIcon sx={{ color: '#10b981' }} />;
        }
        return <InfoIcon sx={{ color: '#3b82f6' }} />;
    };

    const openNotifications = Boolean(anchorEl);
    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <>
            <AppBar
                position="static"
                elevation={0}
                sx={{
                    width: '100%',
                    bgcolor: '#0f172a',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                    px: { xs: 1, sm: 2 },
                }}
            >
                <Toolbar sx={{ justifyContent: 'space-between', minHeight: '64px !important' }}>
                    {/* Sol Logo ve Başlık */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box
                            sx={{
                                p: 1,
                                borderRadius: 2.5,
                                background: 'linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)',
                                display: 'flex',
                                alignItems: 'center',
                            }}
                        >
                            <DirectionsBus sx={{ color: '#ffffff', fontSize: 22 }} />
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 800, color: '#ffffff', letterSpacing: '-0.3px' }}>
                            SmartTransit{' '}
                            <Box component="span" sx={{ color: '#818cf8', fontWeight: 500, fontSize: '0.9rem', ml: 1 }}>
                                Kent İçi Ulaşım
                            </Box>
                        </Typography>
                    </Box>

                    {/* Sağ Kullanıcı Bilgisi, Bildirimler ve Çıkış */}
                    {user && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>

                            {/* 🔔 BİLDİRİM İKONU & ZİL */}
                            <IconButton
                                onClick={handleNotificationClick}
                                sx={{
                                    color: '#94a3b8',
                                    '&:hover': { color: '#ffffff', bgcolor: 'rgba(255,255,255,0.1)' }
                                }}
                            >
                                <Badge badgeContent={unreadCount} color="error">
                                    <NotificationsIcon />
                                </Badge>
                            </IconButton>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <AccountCircle sx={{ color: '#94a3b8' }} />
                                <Typography variant="body2" sx={{ color: '#f8fafc', fontWeight: 600 }}>
                                    {user.email || (user as any).username || 'Kullanıcı'}
                                </Typography>
                            </Box>

                            <Chip
                                label={user.role || 'Passenger'}
                                size="small"
                                sx={{ bgcolor: 'rgba(99, 102, 241, 0.2)', color: '#a5b4fc', fontWeight: 700 }}
                            />

                            <Button
                                size="small"
                                startIcon={<Logout fontSize="small" />}
                                onClick={() => setConfirmOpen(true)}
                                sx={{
                                    color: '#ef4444',
                                    fontWeight: 700,
                                    textTransform: 'none',
                                    '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.1)' },
                                }}
                            >
                                ÇIKIŞ
                            </Button>
                        </Box>
                    )}
                </Toolbar>
            </AppBar>

            {/* 🔔 BİLDİRİM AÇILIR MENÜSÜ (POPOVER) */}
            <Popover
                open={openNotifications}
                anchorEl={anchorEl}
                onClose={handleNotificationClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                slotProps={{ paper: { sx: { width: 360, mt: 1.5, borderRadius: 3, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)' } } }}
            >
                <Box sx={{ p: 2, bgcolor: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a' }}>
                        Bildirimler
                    </Typography>
                    {unreadCount > 0 && (
                        <Chip label={`${unreadCount} Yeni`} size="small" color="primary" sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700 }} />
                    )}
                </Box>

                <List sx={{ p: 0, maxHeight: 380, overflowY: 'auto' }}>
                    {notifications.length === 0 ? (
                        <ListItem sx={{ py: 3, justifyContent: 'center' }}>
                            <Typography variant="body2" color="text.secondary">Henüz bir bildiriminiz bulunmuyor.</Typography>
                        </ListItem>
                    ) : (
                        notifications.map((notif, index) => (
                            <React.Fragment key={notif.id}>
                                <ListItem
                                    sx={{
                                        cursor: 'pointer',
                                        bgcolor: notif.isRead ? '#ffffff' : '#f0f9ff',
                                        '&:hover': { bgcolor: '#f1f5f9' },
                                        alignItems: 'flex-start',
                                        py: 1.5
                                    }}
                                    onClick={() => handleMarkAsRead(notif.id, notif.isRead)}
                                >
                                    <ListItemIcon sx={{ minWidth: 36, mt: 0.5 }}>
                                        {getNotificationIcon(notif.title)}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={notif.title}
                                        secondary={
                                            <>
                                                <Typography variant="caption" sx={{ display: 'block', color: '#475569', mt: 0.5, lineHeight: 1.3 }}>
                                                    {notif.message}
                                                </Typography>
                                                <Typography variant="caption" sx={{ display: 'block', color: '#94a3b8', mt: 1, fontSize: '0.7rem' }}>
                                                    {new Date(notif.createdAt).toLocaleString('tr-TR')}
                                                </Typography>
                                            </>
                                        }
                                        slotProps={{
                                            primary: { sx: { fontWeight: notif.isRead ? 600 : 800, fontSize: '0.875rem', color: '#1e293b' } }
                                        }}
                                    />
                                </ListItem>
                                {index !== notifications.length - 1 && <Divider component="li" />}
                            </React.Fragment>
                        ))
                    )}
                </List>
            </Popover>

            {/* Çıkış Onay Alert / Dialog */}
            <Dialog
                open={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                sx={{ '& .MuiDialog-paper': { borderRadius: 3, p: 1 } }}
            >
                <DialogTitle sx={{ fontWeight: 700 }}>Oturumu Kapat</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Hesabınızdan çıkış yapmak istediğinize emin misiniz? Yapılmamış işlemleriniz kaybolabilir.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setConfirmOpen(false)} sx={{ color: '#64748b', fontWeight: 600, textTransform: 'none' }}>
                        Vazgeç
                    </Button>
                    <Button
                        onClick={handleLogoutConfirm}
                        variant="contained"
                        color="error"
                        autoFocus
                        sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none' }}
                    >
                        Evet, Çıkış Yap
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default Navbar;