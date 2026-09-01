import React, { useState } from 'react';
import {
    Container,
    Typography,
    Button,
    Paper,
    Box,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions
} from '@mui/material';
import { useAuth } from '../../../context/AuthContext';

export const DashboardPlaceholder: React.FC = () => {
    const { user, logout } = useAuth();
    const [openLogoutModal, setOpenLogoutModal] = useState(false);

    // Modal açma butonuna basıldığında yönlendirmeyi durdurur
    const handleOpenModal = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setOpenLogoutModal(true);
    };

    // Onay verildiğinde çıkış yapar
    const handleConfirmLogout = () => {
        setOpenLogoutModal(false);
        logout();
    };

    return (
        <Container maxWidth="md" sx={{ mt: 8 }}>
            <Paper elevation={3} sx={{ p: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Hoş Geldiniz, {user?.email}! 👋
                </Typography>
                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                    Rolünüz: <strong>{user?.role}</strong> | Kullanıcı ID: {user?.userId}
                </Typography>
                <Box sx={{ mt: 4 }}>
                    <Button
                        type="button"
                        variant="contained"
                        color="error"
                        onClick={handleOpenModal}
                    >
                        Oturumu Kapat
                    </Button>
                </Box>
            </Paper>

            {/* Oturum Kapatma Onay Diyaloğu */}
            <Dialog
                open={openLogoutModal}
                onClose={() => setOpenLogoutModal(false)}
            >
                <DialogTitle>Oturumu Kapat</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Hesabınızdan çıkış yapmak istediğinize emin misiniz?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenLogoutModal(false)} color="inherit">
                        Vazgeç
                    </Button>
                    <Button onClick={handleConfirmLogout} color="error" variant="contained" autoFocus>
                        Evet, Çıkış Yap
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};