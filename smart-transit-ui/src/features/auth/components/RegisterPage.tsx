import React, { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    TextField,
    Button,
    Typography,
    Alert,
    CircularProgress,
    InputAdornment,
    IconButton,
    Stepper,
    Step,
    StepLabel,
} from '@mui/material';
import {
    Visibility,
    VisibilityOff,
    Person,
    Email,
    Lock,
    MarkEmailRead,
    ArrowBack,
    DirectionsBus,
} from '@mui/icons-material';
import { AuthService } from '../../../services/AuthService';

interface RegisterPageProps {
    onSuccessNavigateToLogin?: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onSuccessNavigateToLogin }) => {
    const [activeStep, setActiveStep] = useState<number>(0);

    // Form Verileri
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [verificationCode, setVerificationCode] = useState('');

    // UI Durumları
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    // Backend'den gelen detaylı hataları ekrana yazdıran yardımcı metot
    const parseBackendError = (err: any): string => {
        if (!err.response?.data) {
            return 'Sunucuya bağlanılamadı. Lütfen backend servisinizin çalıştığından emin olun.';
        }

        const data = err.response.data;

        if (typeof data === 'string') return data;
        if (data.message || data.Message) return data.message || data.Message;

        if (data.errors) {
            if (Array.isArray(data.errors)) {
                return data.errors.map((e: any) => e.description || e.message || e).join(' | ');
            }
            if (typeof data.errors === 'object') {
                return Object.values(data.errors).flat().join(' | ');
            }
        }

        return 'Kayıt işlemi gerçekleştirilemedi. Girdiğiniz bilgileri kontrol edin.';
    };

    // 1. ADIM: Kayıt Bilgilerini Gönderme
    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!firstName || !lastName || !email || !password || !confirmPassword) {
            setError('Lütfen tüm alanları doldurun.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Girilen şifreler birbirleriyle eşleşmiyor.');
            return;
        }

        setLoading(true);
        try {
            await AuthService.register({
                firstName,
                lastName,
                email,
                password,
                confirmPassword,
            });

            setSuccessMsg('Kayıt başarılı! E-posta adresinize doğrulama kodu gönderildi.');
            setActiveStep(1);
        } catch (err: any) {
            console.error('Kayıt Backend Hatası:', err);
            setError(parseBackendError(err));
        } finally {
            setLoading(false);
        }
    };

    // 2. ADIM: E-Posta Kodunu Doğrulama
    const handleVerifyCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!verificationCode) {
            setError('Lütfen doğrulama kodunu girin.');
            return;
        }

        setLoading(true);
        try {
            await AuthService.verifyEmail({
                email,
                code: verificationCode,
            });

            setSuccessMsg('Hesabınız doğrulandı! Giriş ekranına yönlendiriliyorsunuz...');

            setTimeout(() => {
                if (onSuccessNavigateToLogin) {
                    onSuccessNavigateToLogin();
                } else {
                    window.location.href = '/login';
                }
            }, 1500);
        } catch (err: any) {
            console.error('Doğrulama Backend Hatası:', err);
            setError(parseBackendError(err));
        } finally {
            setLoading(false);
        }
    };

    const handleResendCode = async () => {
        setError(null);
        setLoading(true);
        try {
            await AuthService.resendCode(email);
            setSuccessMsg('Doğrulama kodu tekrar gönderildi.');
        } catch (err: any) {
            setError(parseBackendError(err));
        } finally {
            setLoading(false);
        }
    };

    return (
        /* TAM EKRAN (FULLSCREEN) OVERLAY - Üstteki header/navbar yapılarını kapatır */
        <Box
            sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                zIndex: 9999,
                background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 2,
                overflowY: 'auto',
            }}
        >
            <Card
                elevation={24}
                sx={{
                    width: '100%',
                    maxWidth: 480,
                    borderRadius: 4,
                    background: 'rgba(255, 255, 255, 0.98)',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                    overflow: 'hidden',
                }}
            >
                <Box sx={{ height: 6, background: 'linear-gradient(90deg, #2563eb, #7c3aed)' }} />

                <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
                    {/* LOGO VE BAŞLIK */}
                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                        <Box
                            sx={{
                                width: 56,
                                height: 56,
                                borderRadius: '16px',
                                bgcolor: '#2563eb',
                                color: 'white',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.4)',
                                mb: 1.5,
                            }}
                        >
                            <DirectionsBus sx={{ fontSize: 32 }} />
                        </Box>
                        <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>
                            SmartTransit
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Yeni Hesap Oluşturun
                        </Typography>
                    </Box>

                    {/* STEPPER / ADIMLAR */}
                    <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3 }}>
                        <Step>
                            <StepLabel>Kullanıcı Bilgileri</StepLabel>
                        </Step>
                        <Step>
                            <StepLabel>Mail Onayı</StepLabel>
                        </Step>
                    </Stepper>

                    {/* UYARI VE HATA KUTULARI */}
                    {error && (
                        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                            {error}
                        </Alert>
                    )}

                    {successMsg && (
                        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                            {successMsg}
                        </Alert>
                    )}

                    {/* ADIM 1: BİLGİ GİRİŞ FORMU */}
                    {activeStep === 0 && (
                        <form onSubmit={handleRegister}>
                            <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
                                <TextField
                                    fullWidth
                                    label="Ad"
                                    size="small"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    required
                                    slotProps={{
                                        input: {
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Person color="action" fontSize="small" />
                                                </InputAdornment>
                                            ),
                                        },
                                    }}
                                />
                                <TextField
                                    fullWidth
                                    label="Soyad"
                                    size="small"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    required
                                />
                            </Box>

                            <TextField
                                fullWidth
                                size="small"
                                type="email"
                                label="E-Posta Adresi"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                sx={{ mb: 2 }}
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Email color="action" fontSize="small" />
                                            </InputAdornment>
                                        ),
                                    },
                                }}
                            />

                            <TextField
                                fullWidth
                                size="small"
                                type={showPassword ? 'text' : 'password'}
                                label="Şifre"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                sx={{ mb: 2 }}
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Lock color="action" fontSize="small" />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton size="small" onClick={() => setShowPassword(!showPassword)} edge="end">
                                                    {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    },
                                }}
                            />

                            <TextField
                                fullWidth
                                size="small"
                                type={showPassword ? 'text' : 'password'}
                                label="Şifre Tekrarı"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                sx={{ mb: 3 }}
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Lock color="action" fontSize="small" />
                                            </InputAdornment>
                                        ),
                                    },
                                }}
                            />

                            <Button
                                fullWidth
                                type="submit"
                                variant="contained"
                                size="large"
                                disabled={loading}
                                sx={{
                                    py: 1.4,
                                    borderRadius: 2.5,
                                    fontWeight: 700,
                                    textTransform: 'none',
                                    fontSize: '0.95rem',
                                    background: 'linear-gradient(90deg, #2563eb, #1d4ed8)',
                                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                                }}
                            >
                                {loading ? <CircularProgress size={24} color="inherit" /> : 'Kayıt Ol ve Kodu Gönder'}
                            </Button>
                        </form>
                    )}

                    {/* ADIM 2: E-POSTA KODU DOĞRULAMA FORMU */}
                    {activeStep === 1 && (
                        <form onSubmit={handleVerifyCode}>
                            <Box sx={{ textAlign: 'center', mb: 3 }}>
                                <MarkEmailRead sx={{ fontSize: 52, color: '#2563eb', mb: 1 }} />
                                <Typography variant="body2" color="text.secondary">
                                    <strong>{email}</strong> adresine doğrulama kodu gönderildi. Lütfen kodu girin.
                                </Typography>
                            </Box>

                            <TextField
                                fullWidth
                                label="Doğrulama Kodu"
                                placeholder="123456"
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value)}
                                required
                                sx={{ mb: 3 }}
                                slotProps={{
                                    htmlInput: {
                                        style: { textAlign: 'center', letterSpacing: '6px', fontSize: '1.4rem', fontWeight: 'bold' },
                                    },
                                }}
                            />

                            <Button
                                fullWidth
                                type="submit"
                                variant="contained"
                                size="large"
                                disabled={loading}
                                sx={{
                                    py: 1.4,
                                    borderRadius: 2.5,
                                    fontWeight: 700,
                                    textTransform: 'none',
                                    fontSize: '0.95rem',
                                    background: 'linear-gradient(90deg, #16a34a, #15803d)',
                                    boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)',
                                    mb: 2,
                                }}
                            >
                                {loading ? <CircularProgress size={24} color="inherit" /> : 'Hesabı Doğrula'}
                            </Button>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Button
                                    size="small"
                                    startIcon={<ArrowBack />}
                                    onClick={() => setActiveStep(0)}
                                    disabled={loading}
                                    sx={{ textTransform: 'none' }}
                                >
                                    Bilgileri Düzenle
                                </Button>
                                <Button size="small" onClick={handleResendCode} disabled={loading} sx={{ textTransform: 'none' }}>
                                    Kodu Tekrar Gönder
                                </Button>
                            </Box>
                        </form>
                    )}

                    {/* ALT GİRİŞ YAP LINKI */}
                    <Box sx={{ textAlign: 'center', mt: 3, pt: 2, borderTop: '1px solid #f1f5f9' }}>
                        <Typography variant="body2" color="text.secondary">
                            Zaten bir hesabınız var mı?{' '}
                            <Button
                                variant="text"
                                size="small"
                                sx={{ fontWeight: 700, textTransform: 'none' }}
                                onClick={() => {
                                    if (onSuccessNavigateToLogin) onSuccessNavigateToLogin();
                                    else window.location.href = '/login';
                                }}
                            >
                                Giriş Yap
                            </Button>
                        </Typography>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
};

export default RegisterPage;