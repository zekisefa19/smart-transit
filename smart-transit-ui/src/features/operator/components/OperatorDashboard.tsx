import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    Box,
    Grid,
    Paper,
    Typography,
    Card,
    CardContent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Chip,
    LinearProgress,
    IconButton,
    Tooltip,
    Alert,
    Skeleton,
    Button,
    Stack,
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Avatar,
    Snackbar,
    Badge,
} from '@mui/material';
import {
    AccountBalanceWallet as WalletIcon,
    ConfirmationNumber as TicketIcon,
    Warning as WarningIcon,
    TrendingUp as TrendingUpIcon,
    TrendingDown as TrendingDownIcon,
    DirectionsBus as BusIcon,
    Refresh as RefreshIcon,
    Psychology as AiIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    AccessTime as TimeIcon,
    Close as CloseIcon,
    Block as BlockIcon,
    Security as ShieldIcon,
    FlashOn as FlashIcon,
    Subway as SubwayIcon,
    Speed as SpeedIcon,
    Sensors as SensorsIcon,
    ArrowForward as ArrowForwardIcon,
    AssignmentInd as ApplicationIcon,
} from '@mui/icons-material';
import { getOperatorDashboard, type OperatorDashboardDto } from '../../../services/operatorService';
import { CardService } from '../../../services/cardService';
import CardApplicationsTab from './CardApplicationsTab';

export interface SuspiciousTransactionItem {
    id: string;
    time: string;
    cardNumber: string;
    cardType: string;
    location: string;
    riskCategory: string;
    riskScore: number;
    reason: string;
    status: 'INCELEMEDE' | 'BLOKELENDIRILDI' | 'TEMIZ';
}

export interface CardApplicationItem {
    id: string;
    applicantName?: string;
    identityNumber?: string;
    email?: string;
    cardType: string;
    deliveryMethod?: string;
    deliveryAddress?: string;
    studentNo?: string;
    documentUrl?: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'Beklemede' | 'Onaylandı' | 'Reddedildi';
    createdDate?: string;
    createdAt?: string;
    cardNumber?: string;
    rejectReason?: string;
}

export const OperatorDashboardPage: React.FC = () => {
    // Modallar ve Seçili Nesneler
    const [isSuspiciousModalOpen, setIsSuspiciousModalOpen] = useState(false);
    const [selectedSuspiciousItem, setSelectedSuspiciousItem] = useState<SuspiciousTransactionItem | null>(null);
    const [isApplicationsModalOpen, setIsApplicationsModalOpen] = useState(false);
    const [isAiReportModalOpen, setIsAiReportModalOpen] = useState(false);

    // Filtre ve Sayfalama Durumları
    const [blockedCardIds, setBlockedCardIds] = useState<string[]>([]);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    // 1. Dashboard Verisi
    const { data, isLoading, isError, error, refetch, isFetching } = useQuery<OperatorDashboardDto>({
        queryKey: ['operatorDashboard'],
        queryFn: getOperatorDashboard,
        refetchInterval: 30000,
    });

    // 2. Kart Başvuruları Verisi
    const { data: applicationsData, refetch: refetchApplications } = useQuery<CardApplicationItem[]>({
        queryKey: ['cardApplications'],
        queryFn: async () => {
            const res = await CardService.getCardApplications();
            return (res as unknown) as CardApplicationItem[];
        },
        refetchInterval: 15000,
    });

    const formatCurrency = (val?: number) =>
        new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(val ?? 0);

    const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const dashboard = (data ?? {}) as Partial<OperatorDashboardDto> & {
        suspiciousTransactions?: SuspiciousTransactionItem[];
    };
    const todayTotalTopUp = dashboard.todayTotalTopUp ?? 0;
    const todayPassCount = dashboard.todayPassCount ?? 0;
    const topUpChangeRate = dashboard.topUpChangeRate ?? 0;
    const passCountChangeRate = dashboard.passCountChangeRate ?? 0;
    const hourlyActivities = dashboard.hourlyActivities ?? [];
    const topLines = dashboard.topLines ?? [];
    const recentTransactions = dashboard.recentTransactions ?? [];
    const aiInsightMessage = dashboard.aiInsightMessage ?? 'Sistem genelinde yükleme ve geçiş frekansları normal seviyede seyrediyor.';

    // --- SAAT DİLİMİ UYUMLU GERÇEK ZAMANLI DÜZENLEME ---
    const applications = Array.isArray(applicationsData) ? applicationsData : [];

    const isToday = (dateStr?: string) => {
        if (!dateStr) return false;
        const appDate = new Date(dateStr);
        if (isNaN(appDate.getTime())) return false;
        const now = new Date();
        return appDate.toLocaleDateString('tr-TR') === now.toLocaleDateString('tr-TR');
    };

    const todayApplications = applications.filter((a) => isToday(a.createdDate || a.createdAt));
    const todayPendingApplications = todayApplications.filter(
        (a) => a.status === 'PENDING' || a.status === 'Beklemede'
    );
    const totalPendingApplications = applications.filter(
        (a) => a.status === 'PENDING' || a.status === 'Beklemede'
    );

    const suspiciousList: SuspiciousTransactionItem[] = (dashboard.suspiciousTransactions ?? []).filter(
        (item) => !blockedCardIds.includes(item.id)
    );

    // --- SAYFALAMA TAŞMA SIFIRLAMA ---
    useEffect(() => {
        const maxPage = Math.max(0, Math.ceil(suspiciousList.length / rowsPerPage) - 1);
        if (page > maxPage) {
            setPage(maxPage);
        }
    }, [suspiciousList.length, page, rowsPerPage]);

    const maxHourlyCount = Math.max(...hourlyActivities.map((a) => a.passengerCount ?? 0), 1);
    const paginatedSuspiciousList = suspiciousList.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    // --- KART BLOKE ETME ---
    const handleBlockCard = async (item: SuspiciousTransactionItem) => {
        try {
            if (CardService && typeof (CardService as any).blockCard === 'function') {
                await (CardService as any).blockCard(item.id);
            }
            setBlockedCardIds((prev) => [...prev, item.id]);
            setToastMessage(`${item.cardNumber} numaralı kart başarıyla bloke edildi.`);
            if (selectedSuspiciousItem?.id === item.id) {
                setSelectedSuspiciousItem(null);
            }
        } catch (err) {
            console.error('Kart bloke hatası:', err);
            setToastMessage('Kart bloke edilirken bir hata oluştu.');
        }
    };

    if (isLoading) {
        return (
            <Box sx={{ p: 1 }}>
                <Skeleton variant="text" width={320} height={45} />
                <Grid container spacing={2.5} sx={{ mt: 1 }}>
                    {[1, 2, 3, 4].map((item) => (
                        <Grid key={item} size={{ xs: 12, sm: 6, md: 3 }}>
                            <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 4 }} />
                        </Grid>
                    ))}
                </Grid>
            </Box>
        );
    }

    if (isError) {
        return (
            <Box sx={{ p: 2 }}>
                <Alert
                    severity="error"
                    action={
                        <Button color="inherit" size="small" onClick={() => refetch()}>
                            Tekrar Dene
                        </Button>
                    }
                >
                    Operatör paneli verileri yüklenirken bir hata oluştu: {(error as Error)?.message}
                </Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ width: '100%', minHeight: '100vh', pb: 4 }}>
            {/* 1. ÜST BAŞLIK / HEADER */}
            <Paper
                elevation={0}
                sx={{
                    p: 2.5,
                    mb: 3,
                    borderRadius: 4,
                    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                    color: '#ffffff',
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    justifyContent: 'space-between',
                    alignItems: { xs: 'flex-start', md: 'center' },
                    gap: 2,
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.2)',
                }}
            >
                <Box>
                    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                        <Avatar sx={{ bgcolor: '#3b82f6', width: 42, height: 42 }}>
                            <SpeedIcon />
                        </Avatar>
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.5px' }}>
                                SMARTTRANSIT Control Center
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                                Şehir Geneli Canlı Validasyon, Finansal Akış ve Başvuru Onay Paneli
                            </Typography>
                        </Box>
                    </Stack>
                </Box>
                <Stack direction="row" spacing={2} sx={{ alignItems: 'center', width: { xs: '100%', md: 'auto' }, justifyContent: 'flex-end' }}>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            px: 2,
                            py: 0.8,
                            borderRadius: 10,
                            bgcolor: 'rgba(16, 185, 129, 0.15)',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                        }}
                    >
                        <Box
                            sx={{
                                width: 10,
                                height: 10,
                                borderRadius: '50%',
                                bgcolor: '#10b981',
                                boxShadow: '0 0 10px #10b981',
                                animation: 'pulse 1.5s infinite',
                                '@keyframes pulse': {
                                    '0%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(16, 185, 129, 0.7)' },
                                    '70%': { transform: 'scale(1)', boxShadow: '0 0 0 8px rgba(16, 185, 129, 0)' },
                                    '100%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(16, 185, 129, 0)' },
                                },
                            }}
                        />
                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#34d399', letterSpacing: '0.5px' }}>
                            CANLI • ONLINE
                        </Typography>
                    </Box>
                    <Tooltip title="Verileri Yenile">
                        <IconButton
                            onClick={() => {
                                refetch();
                                refetchApplications();
                            }}
                            disabled={isFetching}
                            sx={{
                                color: '#ffffff',
                                bgcolor: 'rgba(255,255,255,0.08)',
                                '&:hover': { bgcolor: 'rgba(255,255,255,0.18)' },
                                '@keyframes spin': {
                                    '0%': { transform: 'rotate(0deg)' },
                                    '100%': { transform: 'rotate(360deg)' },
                                },
                                '& .MuiSvgIcon-root': {
                                    animation: isFetching ? 'spin 1s linear infinite' : 'none',
                                },
                            }}
                        >
                            <RefreshIcon />
                        </IconButton>
                    </Tooltip>
                </Stack>
            </Paper>

            {/* 2. ÖZET METRİK KARTLARI */}
            <Grid container spacing={2.5} sx={{ mb: 3 }}>
                {/* Kart 1: Yükleme */}
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 2.5,
                            borderRadius: 4,
                            background: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)',
                            border: '1px solid #bae6fd',
                            boxShadow: '0 10px 30px -10px rgba(2, 132, 199, 0.12)',
                            position: 'relative',
                            overflow: 'hidden',
                        }}
                    >
                        <Box sx={{ position: 'absolute', right: -10, bottom: -10, opacity: 0.06, color: '#0284c7' }}>
                            <WalletIcon sx={{ fontSize: 130 }} />
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Avatar sx={{ bgcolor: '#0284c7', width: 46, height: 46, boxShadow: '0 8px 16px -4px rgba(2, 132, 199, 0.4)' }}>
                                <WalletIcon />
                            </Avatar>
                            {topUpChangeRate !== 0 && (
                                <Chip
                                    size="small"
                                    icon={topUpChangeRate > 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
                                    label={`%${Math.abs(topUpChangeRate)}`}
                                    color={topUpChangeRate >= 0 ? 'success' : 'error'}
                                    sx={{ fontWeight: 800, borderRadius: 2 }}
                                />
                            )}
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#0369a1', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                            Bugünkü Bakiye Yükleme
                        </Typography>
                        <Typography variant="h4" sx={{ mt: 0.5, fontWeight: 900, color: '#0c4a6e' }}>
                            {formatCurrency(todayTotalTopUp)}
                        </Typography>
                    </Paper>
                </Grid>

                {/* Kart 2: Geçiş */}
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 2.5,
                            borderRadius: 4,
                            background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)',
                            border: '1px solid #bbf7d0',
                            boxShadow: '0 10px 30px -10px rgba(22, 163, 74, 0.12)',
                            position: 'relative',
                            overflow: 'hidden',
                        }}
                    >
                        <Box sx={{ position: 'absolute', right: -10, bottom: -10, opacity: 0.06, color: '#16a34a' }}>
                            <TicketIcon sx={{ fontSize: 130 }} />
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Avatar sx={{ bgcolor: '#16a34a', width: 46, height: 46, boxShadow: '0 8px 16px -4px rgba(22, 163, 74, 0.4)' }}>
                                <TicketIcon />
                            </Avatar>
                            {passCountChangeRate !== 0 && (
                                <Chip
                                    size="small"
                                    icon={passCountChangeRate > 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
                                    label={`%${Math.abs(passCountChangeRate)}`}
                                    color={passCountChangeRate >= 0 ? 'success' : 'error'}
                                    sx={{ fontWeight: 800, borderRadius: 2 }}
                                />
                            )}
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#15803d', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                            Bugünkü Toplam Geçiş
                        </Typography>
                        <Typography variant="h4" sx={{ mt: 0.5, fontWeight: 900, color: '#14532d' }}>
                            {todayPassCount.toLocaleString('tr-TR')}
                        </Typography>
                    </Paper>
                </Grid>

                {/* Kart 3: Bugünkü Kart Başvuruları */}
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Paper
                        elevation={0}
                        onClick={() => setIsApplicationsModalOpen(true)}
                        sx={{
                            p: 2.5,
                            borderRadius: 4,
                            background: 'linear-gradient(135deg, #ffffff 0%, #fff7ed 100%)',
                            border: '1px solid #ffedd5',
                            boxShadow: '0 10px 30px -10px rgba(234, 88, 12, 0.15)',
                            position: 'relative',
                            overflow: 'hidden',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                                transform: 'translateY(-3px)',
                                boxShadow: '0 12px 28px -5px rgba(234, 88, 12, 0.25)',
                                border: '1px solid #fdba74',
                            },
                        }}
                    >
                        <Box sx={{ position: 'absolute', right: -10, bottom: -10, opacity: 0.06, color: '#ea580c' }}>
                            <ApplicationIcon sx={{ fontSize: 130 }} />
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Badge badgeContent={todayPendingApplications.length} color="error">
                                <Avatar sx={{ bgcolor: '#ea580c', width: 46, height: 46, boxShadow: '0 8px 16px -4px rgba(234, 88, 12, 0.4)' }}>
                                    <ApplicationIcon />
                                </Avatar>
                            </Badge>
                            <Button
                                size="small"
                                endIcon={<ArrowForwardIcon fontSize="small" />}
                                sx={{
                                    fontWeight: 800,
                                    textTransform: 'none',
                                    color: '#ffffff',
                                    bgcolor: '#ea580c',
                                    '&:hover': { bgcolor: '#c2410c' },
                                    borderRadius: 2,
                                    fontSize: '0.75rem',
                                    px: 1.5,
                                }}
                            >
                                Yönet
                            </Button>
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#c2410c', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                            Bugünkü Başvurular
                        </Typography>
                        <Typography variant="h4" sx={{ mt: 0.5, fontWeight: 900, color: '#7c2d12' }}>
                            {todayApplications.length} <Typography component="span" variant="body2" sx={{ fontWeight: 700, color: '#9a3412' }}>({todayPendingApplications.length} Bekleyen)</Typography>
                        </Typography>
                        <Divider sx={{ my: 1.5, borderColor: '#ffedd5' }} />
                        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="caption" sx={{ fontWeight: 600, color: '#c2410c' }}>
                                Tüm Zamanlar: <b>{applications.length}</b> ({totalPendingApplications.length} Bekliyor)
                            </Typography>
                            <Typography variant="caption" sx={{ fontWeight: 800, color: '#ea580c' }}>
                                İncele →
                            </Typography>
                        </Stack>
                    </Paper>
                </Grid>

                {/* Kart 4: Şüpheli İşlemler */}
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card
                        elevation={0}
                        onClick={() => setIsSuspiciousModalOpen(true)}
                        sx={{
                            borderRadius: 4,
                            background: 'linear-gradient(135deg, #fef2f2 0%, #ffe4e6 100%)',
                            border: '2px solid #f43f5e',
                            boxShadow: '0 12px 25px -5px rgba(244, 63, 94, 0.25)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: '0 16px 30px -5px rgba(244, 63, 94, 0.35)',
                            },
                        }}
                    >
                        <CardContent sx={{ p: 2.5 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Avatar sx={{ bgcolor: '#e11d48', width: 46, height: 46, boxShadow: '0 8px 16px -4px rgba(225, 29, 72, 0.5)' }}>
                                    <WarningIcon />
                                </Avatar>
                                <Chip size="small" label="AI ALARM" color="error" sx={{ fontWeight: 900, borderRadius: 2 }} />
                            </Box>
                            <Typography variant="body2" sx={{ fontWeight: 800, color: '#be123c', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                                Şüpheli & İhlalli Geçiş
                            </Typography>
                            <Typography variant="h4" sx={{ mt: 0.5, fontWeight: 900, color: '#881337' }}>
                                {suspiciousList.length} Kayıt
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* 3. AI OPERASYONEL ZEKA BANNERI */}
            <Paper
                elevation={0}
                sx={{
                    p: 2.5,
                    mb: 3,
                    borderRadius: 4,
                    background: 'linear-gradient(135deg, #4f46e5 0%, #2563eb 50%, #3b82f6 100%)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.4)',
                }}
            >
                <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 50, height: 50, backdropFilter: 'blur(10px)' }}>
                        <AiIcon sx={{ fontSize: 30, color: '#ffffff' }} />
                    </Avatar>
                    <Box>
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                                AI Operasyonel Zeka Analizi
                            </Typography>
                            <Chip label="Canlı Model v2.4" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 700, fontSize: '0.65rem' }} />
                        </Stack>
                        <Typography variant="body2" sx={{ opacity: 0.95, mt: 0.3 }}>
                            {aiInsightMessage}
                        </Typography>
                    </Box>
                </Stack>
                <Button
                    variant="contained"
                    startIcon={<FlashIcon />}
                    onClick={() => setIsAiReportModalOpen(true)}
                    sx={{
                        bgcolor: '#ffffff',
                        color: '#2563eb',
                        fontWeight: 800,
                        borderRadius: 3,
                        px: 3,
                        py: 1,
                        textTransform: 'none',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        '&:hover': { bgcolor: '#f8fafc' },
                        display: { xs: 'none', md: 'flex' },
                    }}
                >
                    Detaylı Rapor
                </Button>
            </Paper>

            {/* 4. GRAFİK VE HAT PERFORMANS DÜZENİ */}
            <Grid container spacing={2.5} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, md: 8 }}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            borderRadius: 4,
                            height: '100%',
                            bgcolor: '#ffffff',
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 4px 20px 0 rgba(0,0,0,0.03)',
                        }}
                    >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
                                    Saatlik Yolcu Yoğunluk Grafiği
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Turnike ve otobüs içi validatör okuma dağılımı
                                </Typography>
                            </Box>
                            <Chip icon={<TimeIcon />} label="Bugün (24 Saat)" size="small" variant="outlined" sx={{ fontWeight: 700 }} />
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'flex-end', height: 230, gap: 1.5, pt: 3, px: 1 }}>
                            {hourlyActivities.map((act, idx) => {
                                const count = act.passengerCount ?? 0;
                                const heightPercent = Math.max((count / maxHourlyCount) * 100, 6);
                                const isPeak = heightPercent > 75;
                                return (
                                    <Box
                                        key={idx}
                                        sx={{
                                            flex: 1,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            height: '100%',
                                            justifyContent: 'flex-end',
                                        }}
                                    >
                                        <Typography variant="caption" sx={{ mb: 0.8, fontWeight: 800, fontSize: '0.7rem', color: isPeak ? '#ef4444' : '#64748b' }}>
                                            {count}
                                        </Typography>
                                        <Tooltip title={`${act.hour ?? ''} - ${count} Yolcu Geçişi`}>
                                            <Box
                                                sx={{
                                                    width: '100%',
                                                    maxWidth: 38,
                                                    height: `${heightPercent}%`,
                                                    background: isPeak
                                                        ? 'linear-gradient(180deg, #f43f5e 0%, #e11d48 100%)'
                                                        : 'linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%)',
                                                    borderRadius: '8px 8px 3px 3px',
                                                    transition: 'all 0.3s ease',
                                                    boxShadow: isPeak ? '0 4px 12px rgba(244, 63, 94, 0.4)' : '0 4px 12px rgba(59, 130, 246, 0.2)',
                                                    '&:hover': {
                                                        transform: 'scaleY(1.05)',
                                                        filter: 'brightness(1.1)',
                                                    },
                                                }}
                                            />
                                        </Tooltip>
                                        <Typography variant="caption" sx={{ mt: 1, fontWeight: 700, color: '#475569', fontSize: '0.7rem' }}>
                                            {act.hour}
                                        </Typography>
                                    </Box>
                                );
                            })}
                        </Box>
                    </Paper>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            borderRadius: 4,
                            height: '100%',
                            bgcolor: '#ffffff',
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 4px 20px 0 rgba(0,0,0,0.03)',
                        }}
                    >
                        <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
                            En Yoğun Hatlar
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                            Kapasite kullanımına göre ilk sıralar
                        </Typography>
                        {topLines.length === 0 ? (
                            <Box sx={{ textAlign: 'center', py: 5, color: 'text.secondary' }}>
                                <BusIcon sx={{ fontSize: 48, opacity: 0.2, mb: 1 }} />
                                <Typography variant="body2">Hat verisi mevcut değil.</Typography>
                            </Box>
                        ) : (
                            <Stack spacing={2.2}>
                                {topLines.map((line, idx) => {
                                    const isMetro = line.lineCode?.startsWith('M');
                                    return (
                                        <Box key={idx} sx={{ p: 1.5, borderRadius: 3, bgcolor: '#f8fafc', border: '1px solid #f1f5f9' }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                                <Stack direction="row" spacing={1.2} sx={{ alignItems: 'center' }}>
                                                    <Avatar sx={{ bgcolor: isMetro ? '#7c3aed' : '#2563eb', width: 32, height: 32 }}>
                                                        {isMetro ? <SubwayIcon fontSize="small" /> : <BusIcon fontSize="small" />}
                                                    </Avatar>
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1e293b' }}>
                                                        {line.lineCode}
                                                    </Typography>
                                                </Stack>
                                                <Typography variant="caption" sx={{ fontWeight: 800, color: '#0f172a' }}>
                                                    {line.passengerCountText} Yolcu
                                                </Typography>
                                            </Box>
                                            <LinearProgress
                                                variant="determinate"
                                                value={line.percentage ?? 0}
                                                sx={{
                                                    height: 8,
                                                    borderRadius: 4,
                                                    bgcolor: '#e2e8f0',
                                                    '& .MuiLinearProgress-bar': {
                                                        borderRadius: 4,
                                                        background: isMetro
                                                            ? 'linear-gradient(90deg, #8b5cf6 0%, #6d28d9 100%)'
                                                            : 'linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%)',
                                                    },
                                                }}
                                            />
                                        </Box>
                                    );
                                })}
                            </Stack>
                        )}
                    </Paper>
                </Grid>
            </Grid>

            {/* 5. CANLI İŞLEM VE ŞÜPHELİ RADAR PANELS */}
            <Grid container spacing={2.5}>
                <Grid size={{ xs: 12, lg: 8 }}>
                    <Paper
                        elevation={0}
                        sx={{
                            borderRadius: 4,
                            bgcolor: '#ffffff',
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 4px 20px 0 rgba(0,0,0,0.03)',
                            overflow: 'hidden',
                        }}
                    >
                        <Box sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                                <SensorsIcon color="primary" />
                                <Box>
                                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
                                        Canlı Sistem İşlem Akışı
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Turnikelerden geçen en son canlı hareketler
                                    </Typography>
                                </Box>
                            </Stack>
                            <Chip label="Anlık Akış" size="small" color="primary" variant="outlined" sx={{ fontWeight: 700 }} />
                        </Box>
                        <Divider />
                        <TableContainer>
                            <Table>
                                <TableHead sx={{ bgcolor: '#f8fafc' }}>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Saat</TableCell>
                                        <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Kart Numarası</TableCell>
                                        <TableCell sx={{ fontWeight: 800, color: '#475569' }}>İşlem Tipi</TableCell>
                                        <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Hat Kodu</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 800, color: '#475569' }}>
                                            Tutar
                                        </TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 800, color: '#475569' }}>
                                            Durum
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {recentTransactions.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                                <Typography variant="body2" color="text.secondary">
                                                    Henüz kaydedilmiş canlı işlem bulunmuyor.
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        recentTransactions.map((tx, idx) => {
                                            const isSuccess = tx.status === 'BASARILI';
                                            const amount = tx.amount ?? 0;
                                            return (
                                                <TableRow key={idx} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                                    <TableCell sx={{ fontWeight: 700, color: '#334155' }}>{tx.time}</TableCell>
                                                    <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700, color: '#0284c7' }}>
                                                        {tx.maskedCardNumber}
                                                    </TableCell>
                                                    <TableCell sx={{ fontWeight: 600 }}>{tx.transactionType}</TableCell>
                                                    <TableCell sx={{ fontWeight: 700 }}>{tx.lineCode}</TableCell>
                                                    <TableCell
                                                        align="right"
                                                        sx={{
                                                            fontWeight: 800,
                                                            color: amount > 0 ? '#16a34a' : '#0f172a',
                                                        }}
                                                    >
                                                        {amount > 0 ? `+${formatCurrency(amount)}` : formatCurrency(amount)}
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Chip
                                                            size="small"
                                                            icon={isSuccess ? <CheckCircleIcon /> : <CancelIcon />}
                                                            label={tx.status}
                                                            color={isSuccess ? 'success' : 'error'}
                                                            sx={{ fontWeight: 800, borderRadius: 2 }}
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>
                <Grid size={{ xs: 12, lg: 4 }}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 2.5,
                            borderRadius: 4,
                            height: '100%',
                            bgcolor: '#ffffff',
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 4px 20px 0 rgba(0,0,0,0.03)',
                        }}
                    >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
                                AI Risk Radarı
                            </Typography>
                            <Button size="small" color="error" onClick={() => setIsSuspiciousModalOpen(true)} sx={{ fontWeight: 800 }}>
                                Tümünü Gör ({suspiciousList.length})
                            </Button>
                        </Box>
                        {suspiciousList.length === 0 ? (
                            <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
                                <ShieldIcon sx={{ fontSize: 40, color: '#10b981', mb: 1 }} />
                                <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                                    Aktif Risk Kaydı Yok
                                </Typography>
                                <Typography variant="caption">Sistemde anomali tespit edilen işlem bulunmamaktadır.</Typography>
                            </Box>
                        ) : (
                            <Stack spacing={1.5}>
                                {suspiciousList.slice(0, 3).map((item) => (
                                    <Box
                                        key={item.id}
                                        sx={{
                                            p: 1.8,
                                            borderRadius: 3,
                                            bgcolor: '#fff1f2',
                                            border: '1px solid #fecdd3',
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#9f1239' }}>
                                                {item.cardNumber}
                                            </Typography>
                                            <Chip label={`%${item.riskScore} Risk`} size="small" color="error" sx={{ fontWeight: 900, height: 20, fontSize: '0.65rem' }} />
                                        </Box>
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, fontWeight: 600 }}>
                                            {item.location} • {item.riskCategory}
                                        </Typography>
                                    </Box>
                                ))}
                            </Stack>
                        )}
                    </Paper>
                </Grid>
            </Grid>

            {/* MODAL: AI DETAYLI RAPOR */}
            <Dialog
                open={isAiReportModalOpen}
                onClose={() => setIsAiReportModalOpen(false)}
                maxWidth="md"
                fullWidth
                slotProps={{ paper: { sx: { borderRadius: 4, p: 1 } } }}
            >
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                        <Avatar sx={{ bgcolor: '#2563eb' }}>
                            <AiIcon />
                        </Avatar>
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 800 }}>
                                AI Operasyonel Zeka Detaylı Raporu
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Yapay zeka destekli yoğunluk, tahmin ve sistem analiz detayları
                            </Typography>
                        </Box>
                    </Stack>
                    <IconButton onClick={() => setIsAiReportModalOpen(false)}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <Divider />
                <DialogContent sx={{ py: 3, px: 3 }}>
                    <Alert severity="info" icon={<AiIcon />} sx={{ mb: 3, borderRadius: 3 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                            Canlı AI Model Analizi
                        </Typography>
                        <Typography variant="body2">{aiInsightMessage}</Typography>
                    </Alert>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1, color: '#0f172a' }}>
                        Sistem Önerileri & Tahminler
                    </Typography>
                    <Stack spacing={1.5}>
                        <Box sx={{ p: 2, borderRadius: 3, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                                • Pik Saat Yoğunluk Yönetimi
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Saatlik yolcu geçiş verilerine göre 17:00 - 19:00 saatleri arasında ana hatlarda %18 ek sefer artışı önerilmektedir.
                            </Typography>
                        </Box>
                        <Box sx={{ p: 2, borderRadius: 3, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                                • Anomali ve İhlal Tespiti
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Aynı kartla kısa süreli tekrarlı geçiş denemelerinde %12 düşüş gözlemlendi. AI risk radarı aktif olarak izlemeye devam ediyor.
                            </Typography>
                        </Box>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 2.5, pt: 0 }}>
                    <Button variant="contained" onClick={() => setIsAiReportModalOpen(false)} sx={{ borderRadius: 2.5 }}>
                        Kapat
                    </Button>
                </DialogActions>
            </Dialog>

            {/* MODAL: YOLCU KART BAŞVURU YÖNETİMİ */}
            <Dialog
                open={isApplicationsModalOpen}
                onClose={() => setIsApplicationsModalOpen(false)}
                maxWidth="xl"
                fullWidth
                slotProps={{ paper: { sx: { borderRadius: 4, p: 1, minHeight: '80vh' } } }}
            >
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                        <Avatar sx={{ bgcolor: '#ea580c' }}>
                            <ApplicationIcon />
                        </Avatar>
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 800 }}>
                                Yolcu Kart Başvuruları Yönetimi
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Yolcuların başvurularını, belgelerini inceleyin ve aksiyon alın
                            </Typography>
                        </Box>
                    </Stack>
                    <IconButton onClick={() => setIsApplicationsModalOpen(false)}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <Divider />
                <DialogContent sx={{ py: 2, px: 2 }}>
                    <CardApplicationsTab />
                </DialogContent>
                <DialogActions sx={{ p: 2.5, pt: 0 }}>
                    <Button variant="contained" color="inherit" onClick={() => setIsApplicationsModalOpen(false)} sx={{ borderRadius: 2.5 }}>
                        Kapat
                    </Button>
                </DialogActions>
            </Dialog>

            {/* MODAL: SAYFALAMALI ŞÜPHELİ İŞLEMLER */}
            <Dialog
                open={isSuspiciousModalOpen}
                onClose={() => setIsSuspiciousModalOpen(false)}
                maxWidth="lg"
                fullWidth
                slotProps={{ paper: { sx: { borderRadius: 4, p: 1 } } }}
            >
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                        <Avatar sx={{ bgcolor: '#ef4444' }}>
                            <ShieldIcon />
                        </Avatar>
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 800 }}>
                                Şüpheli İşlem & AI İhlal Tespiti
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Anomali tespit edilen kart hareketleri ve aksiyon listesi
                            </Typography>
                        </Box>
                    </Stack>
                    <IconButton onClick={() => setIsSuspiciousModalOpen(false)}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <Divider />
                <DialogContent sx={{ py: 2, px: 3 }}>
                    {selectedSuspiciousItem && (
                        <Alert
                            severity="warning"
                            icon={<ShieldIcon />}
                            onClose={() => setSelectedSuspiciousItem(null)}
                            sx={{ mb: 2, borderRadius: 3 }}
                        >
                            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                                {selectedSuspiciousItem.cardNumber} ({selectedSuspiciousItem.cardType}) - İnceleme Detayı
                            </Typography>
                            <Typography variant="body2">{selectedSuspiciousItem.reason}</Typography>
                        </Alert>
                    )}
                    {suspiciousList.length === 0 ? (
                        <Box sx={{ py: 6, textAlign: 'center' }}>
                            <CheckCircleIcon sx={{ fontSize: 48, color: '#10b981', mb: 1 }} />
                            <Typography variant="h6" sx={{ fontWeight: 800 }}>
                                Tüm Kayıtlar Temiz
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                İncelenecek şüpheli veya kural ihlali içeren işlem bulunmuyor.
                            </Typography>
                        </Box>
                    ) : (
                        <>
                            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
                                <Table size="small">
                                    <TableHead sx={{ bgcolor: '#f8fafc' }}>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 800 }}>Saat</TableCell>
                                            <TableCell sx={{ fontWeight: 800 }}>Kart No</TableCell>
                                            <TableCell sx={{ fontWeight: 800 }}>Kart Tipi</TableCell>
                                            <TableCell sx={{ fontWeight: 800 }}>Geçiş Konumu</TableCell>
                                            <TableCell sx={{ fontWeight: 800 }}>Kategori</TableCell>
                                            <TableCell align="center" sx={{ fontWeight: 800 }}>
                                                AI Risk Skoru
                                            </TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 800 }}>
                                                Aksiyon
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {paginatedSuspiciousList.map((item) => (
                                            <TableRow key={item.id} hover>
                                                <TableCell sx={{ fontWeight: 700 }}>{item.time}</TableCell>
                                                <TableCell sx={{ fontFamily: 'monospace', fontWeight: 800, color: '#ef4444' }}>{item.cardNumber}</TableCell>
                                                <TableCell>{item.cardType}</TableCell>
                                                <TableCell>{item.location}</TableCell>
                                                <TableCell>
                                                    <Chip label={item.riskCategory} size="small" color="error" variant="outlined" sx={{ fontWeight: 700 }} />
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Typography variant="body2" color="error.main" sx={{ fontWeight: 900 }}>
                                                        %{item.riskScore}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                                                        <Button
                                                            size="small"
                                                            variant="outlined"
                                                            color="info"
                                                            onClick={() => setSelectedSuspiciousItem(item)}
                                                            sx={{ borderRadius: 2 }}
                                                        >
                                                            Detay
                                                        </Button>
                                                        <Button
                                                            size="small"
                                                            variant="contained"
                                                            color="error"
                                                            startIcon={<BlockIcon />}
                                                            onClick={() => handleBlockCard(item)}
                                                            sx={{ borderRadius: 2 }}
                                                        >
                                                            Bloke Et
                                                        </Button>
                                                    </Stack>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <TablePagination
                                rowsPerPageOptions={[5, 10, 15]}
                                component="div"
                                count={suspiciousList.length}
                                rowsPerPage={rowsPerPage}
                                page={page}
                                onPageChange={handleChangePage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                                labelRowsPerPage="Kayıt:"
                                labelDisplayedRows={({ from, to, count }) => `${from}-${to} / Toplam ${count}`}
                            />
                        </>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2.5, pt: 0 }}>
                    <Button variant="contained" color="inherit" onClick={() => setIsSuspiciousModalOpen(false)} sx={{ borderRadius: 2.5 }}>
                        Kapat
                    </Button>
                </DialogActions>
            </Dialog>

            {/* BİLDİRİM TOAST */}
            <Snackbar
                open={!!toastMessage}
                autoHideDuration={4000}
                onClose={() => setToastMessage(null)}
                message={toastMessage}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            />
        </Box>
    );
};

export default OperatorDashboardPage;