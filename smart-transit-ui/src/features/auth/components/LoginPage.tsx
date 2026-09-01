import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import {
    Box,
    Button,
    TextField,
    Typography,
    Alert,
    InputAdornment,
    IconButton,
    CircularProgress,
    Grid,
    Checkbox,
    FormControlLabel,
    Divider,
} from '@mui/material';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import LoginIcon from '@mui/icons-material/Login';
import { loginSchema, type LoginFormData } from '../schemas/authSchemas';
import { loginApi } from '../api/authApi';
import { useAuth } from '../../../context/AuthContext';

export const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [rememberMe, setRememberMe] = useState<boolean>(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormData) => {
        setErrorMessage(null);
        try {
            const response = await loginApi(data);
            const token = response.accessToken;

            login(token);

            // Token içerisindeki Rol bilgisini oku ve doğru sayfaya yönlendir
            try {
                const decoded: any = jwtDecode(token);
                const role = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || decoded.role;

                if (role === 'Operator' || role === '2' || role === 2) {
                    navigate('/operator/dashboard');
                } else {
                    navigate('/dashboard');
                }
            } catch {
                navigate('/dashboard');
            }

        } catch (error: any) {
            if (error.response?.status === 401 || error.response?.status === 400) {
                setErrorMessage('E-posta adresi veya şifre hatalı. Lütfen bilgilerinizi kontrol edin.');
            } else {
                setErrorMessage(
                    error.response?.data?.Message ||
                    error.response?.data?.detail ||
                    'Sunucuya bağlanırken bir hata oluştu.'
                );
            }
        }
    };

    return (
        <Box
            sx={{
                width: '100vw',
                height: '100vh',
                m: 0,
                p: 0,
                overflow: 'hidden',
                position: 'fixed',
                top: 0,
                left: 0,
                zIndex: 9999,
                backgroundColor: '#fafbfc',
            }}
        >
            <Grid container sx={{ width: '100%', height: '100%', m: 0, p: 0 }}>
                {/* SOL ALAN: Görsel & Marka Bilgisi */}
                <Grid
                    size={{ xs: 0, md: 6 }}
                    sx={{
                        display: { xs: 'none', md: 'flex' },
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'flex-start',
                        px: { md: 8, lg: 12 },
                        height: '100%',
                        backgroundImage: `linear-gradient(rgba(10, 20, 40, 0.85), rgba(10, 20, 40, 0.85)), url(https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=1600&auto=format&fit=crop)`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        color: '#ffffff',
                    }}
                >
                    <Box sx={{ maxWidth: 500 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4 }}>
                            <Box
                                sx={{
                                    bgcolor: '#0066cc',
                                    borderRadius: 2,
                                    p: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <DirectionsBusIcon sx={{ fontSize: 32, color: '#ffffff' }} />
                            </Box>
                            <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.5px' }}>
                                Smart Transit
                            </Typography>
                        </Box>

                        <Typography
                            variant="h3"
                            sx={{ fontWeight: 800, mb: 2, lineHeight: 1.2, letterSpacing: '-0.5px' }}
                        >
                            Yarının Şehirlerini Bugünden Yönetin.
                        </Typography>

                        <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.75)', lineHeight: 1.6 }}>
                            Kurumsal transit yönetim sistemi ile veri odaklı kararlar alın, operasyonel verimliliği en üst düzeye çıkarın.
                        </Typography>
                    </Box>
                </Grid>

                {/* SAĞ ALAN: Giriş Formu */}
                <Grid
                    size={{ xs: 12, md: 6 }}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        px: { xs: 3, sm: 6, md: 8 },
                        height: '100%',
                        backgroundColor: '#fafbfc',
                    }}
                >
                    <Box sx={{ width: '100%', maxWidth: 420 }}>
                        <Typography variant="h4" sx={{ fontWeight: 800, color: '#111827', mb: 1 }}>
                            Hoş Geldiniz
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#6b7280', mb: 4 }}>
                            Lütfen devam etmek için hesabınıza giriş yapın.
                        </Typography>

                        {errorMessage && (
                            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                                {errorMessage}
                            </Alert>
                        )}

                        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                            {/* E-POSTA ALANI */}
                            <Box sx={{ mb: 2.5 }}>
                                <Typography
                                    variant="caption"
                                    sx={{
                                        fontWeight: 700,
                                        color: '#374151',
                                        display: 'block',
                                        mb: 0.8,
                                        letterSpacing: '0.5px',
                                    }}
                                >
                                    E-POSTA
                                </Typography>
                                <TextField
                                    fullWidth
                                    placeholder="ornek@transit.com"
                                    {...register('email')}
                                    error={!!errors.email}
                                    helperText={errors.email?.message}
                                    slotProps={{
                                        input: {
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <EmailOutlinedIcon sx={{ color: '#9ca3af' }} />
                                                </InputAdornment>
                                            ),
                                            sx: { borderRadius: 2.5, backgroundColor: '#ffffff' },
                                        },
                                    }}
                                />
                            </Box>

                            {/* ŞİFRE ALANI */}
                            <Box sx={{ mb: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.8 }}>
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            fontWeight: 700,
                                            color: '#374151',
                                            letterSpacing: '0.5px',
                                        }}
                                    >
                                        ŞİFRE
                                    </Typography>
                                    <Link
                                        to="#"
                                        style={{
                                            fontSize: '0.8rem',
                                            color: '#0056b3',
                                            textDecoration: 'none',
                                            fontWeight: 700,
                                        }}
                                    >
                                        Şifremi unuttum?
                                    </Link>
                                </Box>
                                <TextField
                                    fullWidth
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    {...register('password')}
                                    error={!!errors.password}
                                    helperText={errors.password?.message}
                                    slotProps={{
                                        input: {
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <LockOutlinedIcon sx={{ color: '#9ca3af' }} />
                                                </InputAdornment>
                                            ),
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                                        {showPassword ? (
                                                            <VisibilityOff sx={{ color: '#9ca3af' }} />
                                                        ) : (
                                                            <Visibility sx={{ color: '#9ca3af' }} />
                                                        )}
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                            sx: { borderRadius: 2.5, backgroundColor: '#ffffff' },
                                        },
                                    }}
                                />
                            </Box>

                            {/* BENİ HATIRLA CHECKBOX */}
                            <Box sx={{ mb: 3 }}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={rememberMe}
                                            onChange={(e) => setRememberMe(e.target.checked)}
                                            size="small"
                                            sx={{ color: '#d1d5db', '&.Mui-checked': { color: '#0056b3' } }}
                                        />
                                    }
                                    label={<Typography variant="body2" sx={{ color: '#374151', fontWeight: 500 }}>Beni hatırla</Typography>}
                                />
                            </Box>

                            {/* GİRİŞ YAP BUTONU */}
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                disabled={isSubmitting}
                                endIcon={!isSubmitting && <LoginIcon />}
                                sx={{
                                    py: 1.6,
                                    borderRadius: 2.5,
                                    fontWeight: 700,
                                    fontSize: '0.95rem',
                                    textTransform: 'none',
                                    backgroundColor: '#0056b3',
                                    '&:hover': {
                                        backgroundColor: '#004085',
                                    },
                                    boxShadow: 'none',
                                }}
                            >
                                {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Giriş Yap'}
                            </Button>

                            <Divider sx={{ my: 4 }} />

                            {/* KAYIT OL YÖNLENDİRMESİ */}
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="body2" sx={{ color: '#6b7280' }}>
                                    Hesabınız yok mu?{' '}
                                    <Link
                                        to="/register"
                                        style={{
                                            color: '#0056b3',
                                            textDecoration: 'none',
                                            fontWeight: 700,
                                        }}
                                    >
                                        Kayıt Ol
                                    </Link>
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
};