import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Box,
    Paper,
    Typography,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Chip,
    Button,
    TextField,
    InputAdornment,
    Stack,
    Avatar,
    IconButton,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Tabs,
    Tab,
    Snackbar,
    Alert,
    Card,
    CardContent,
    Divider,
} from '@mui/material';
import {
    Search as SearchIcon,
    Refresh as RefreshIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    HourglassEmpty as PendingIcon,
    AssignmentInd as CardIcon,
    Check as ApproveIcon,
    Clear as RejectIcon,
    Person as PersonIcon,
    Visibility as ViewIcon,
    Email as EmailIcon,
    Badge as BadgeIcon,
    School as SchoolIcon,
    Description as DocIcon,
    LocalShipping as ShippingIcon,
    Home as AddressIcon,
} from '@mui/icons-material';
import { CardService } from '../../../services/cardService';

// GERÇEK BACKEND VERİSİNİ DOĞRUDAN OKUYAN VE SAHTE VERİ ÜRETMEYEN DÖNÜŞTÜRÜCÜ
const normalizeApplication = (app: any) => {
    // 1. Başvuru Durumu
    const rawStatus = String(app?.status ?? app?.Status ?? app?.applicationStatus ?? app?.state ?? 'PENDING').toUpperCase();
    let status: 'PENDING' | 'APPROVED' | 'REJECTED' = 'PENDING';
    if (rawStatus === '0' || rawStatus.includes('PENDING') || rawStatus.includes('BEKLEMEDE') || rawStatus === 'WAITING') {
        status = 'PENDING';
    } else if (rawStatus === '1' || rawStatus.includes('APPROVED') || rawStatus.includes('ONAY')) {
        status = 'APPROVED';
    } else if (rawStatus === '2' || rawStatus.includes('REJECTED') || rawStatus.includes('RED')) {
        status = 'REJECTED';
    }

    // 2. Tarih Formatı
    const rawDate = app?.createdDate || app?.CreatedDate || app?.createdAt || app?.CreatedAt || app?.date || app?.Date;
    let formattedDate = '-';
    if (rawDate) {
        try {
            const d = new Date(rawDate);
            formattedDate = !isNaN(d.getTime())
                ? d.toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' })
                : String(rawDate);
        } catch {
            formattedDate = String(rawDate);
        }
    }

    // 3. Gerçek Belge Bağlantısı (Yoksa Boş Bırakılır)
    const documentUrl =
        app?.documentUrl ||
        app?.DocumentUrl ||
        app?.documentPath ||
        app?.DocumentPath ||
        app?.fileUrl ||
        app?.FileUrl ||
        app?.filePath ||
        app?.FilePath ||
        app?.document ||
        app?.Document ||
        app?.attachmentUrl ||
        app?.AttachmentUrl ||
        '';

    const documentName =
        app?.documentName ||
        app?.DocumentName ||
        app?.fileName ||
        app?.FileName ||
        (documentUrl ? 'Yuklenen_Belge.pdf' : '');

    // 4. Gerçek Adres Verisi
    const deliveryAddress =
        app?.deliveryAddress ||
        app?.DeliveryAddress ||
        app?.address ||
        app?.Address ||
        app?.fullAddress ||
        app?.FullAddress ||
        app?.shippingAddress ||
        app?.ShippingAddress ||
        app?.addressDetail ||
        app?.AddressDetail ||
        app?.userAddress ||
        app?.UserAddress ||
        '';

    // 5. Gerçek Teslimat Yöntemi
    const deliveryMethod =
        app?.deliveryMethod ||
        app?.DeliveryMethod ||
        app?.deliveryType ||
        app?.DeliveryType ||
        app?.shippingType ||
        '';

    return {
        id: app?.id || app?.Id || app?._id || '',
        userId: app?.userId || app?.UserId || '',
        applicantName: app?.applicantName || app?.ApplicantName || app?.fullName || app?.FullName || app?.userName || app?.UserName || app?.user?.fullName || '-',
        identityNumber: app?.identityNumber || app?.IdentityNumber || app?.tcNo || app?.TcNo || app?.identityNo || app?.IdentityNo || '-',
        email: app?.email || app?.Email || app?.userEmail || app?.UserEmail || app?.user?.email || '-',
        cardType: app?.cardType || app?.CardType || app?.requestedCardType || app?.RequestedCardType || app?.cardTypeName || '-',
        deliveryMethod,
        deliveryAddress,
        studentNo: app?.studentNo || app?.StudentNo || app?.studentNumber || app?.StudentNumber || '',
        documentUrl,
        documentName,
        status,
        createdDate: formattedDate,
        rejectionReason: app?.rejectionReason || app?.RejectionReason || app?.rejectReason || app?.RejectReason || app?.reason || '',
        cardNumber: app?.cardNumber || app?.CardNumber || '',
        raw: app, // Konsoldan orijinal payload incelemek için
    };
};

export const CardApplicationsTab: React.FC = () => {
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState('');
    const [statusTab, setStatusTab] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(8);
    const [selectedApp, setSelectedApp] = useState<any | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
    const [assignCardNumber, setAssignCardNumber] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    // 1. GERÇEK BACKEND VERİSİ (Polling ile her 5 saniyede bir güncellenir)
    const { data: rawApplications = [], isLoading, isFetching, refetch } = useQuery({
        queryKey: ['cardApplications'],
        queryFn: async () => {
            const res = await CardService.getCardApplications();
            return Array.isArray(res) ? res : [];
        },
        refetchInterval: 5000,
    });

    const applications = rawApplications.map(normalizeApplication);

    // 2. ONAYLAMA MUTASYONU
    const approveMutation = useMutation({
        mutationFn: async ({ id, cardNumber }: { id: string; cardNumber?: string }) => {
            return await CardService.approveCardApplication(id, cardNumber);
        },
        onSuccess: () => {
            setToastMessage('Kart başvurusu onaylandı.');
            setIsApproveDialogOpen(false);
            setIsDetailModalOpen(false);
            setAssignCardNumber('');
            setSelectedApp(null);
            queryClient.invalidateQueries({ queryKey: ['cardApplications'] });
        },
        onError: (err: any) => {
            setToastMessage(`Onaylama hatası: ${err?.response?.data?.message || err?.message || 'İşlem başarısız.'}`);
        },
    });

    // 3. REDDETME MUTASYONU
    const rejectMutation = useMutation({
        mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
            return await CardService.rejectCardApplication(id, reason);
        },
        onSuccess: () => {
            setToastMessage('Başvuru reddedildi.');
            setIsRejectDialogOpen(false);
            setIsDetailModalOpen(false);
            setRejectionReason('');
            setSelectedApp(null);
            queryClient.invalidateQueries({ queryKey: ['cardApplications'] });
        },
        onError: (err: any) => {
            setToastMessage(`Reddetme hatası: ${err?.response?.data?.message || err?.message || 'İşlem başarısız.'}`);
        },
    });

    // Arama ve Filtreleme
    const filteredApps = applications.filter((app) => {
        if (statusTab === 'PENDING' && app.status !== 'PENDING') return false;
        if (statusTab === 'APPROVED' && app.status !== 'APPROVED') return false;
        if (statusTab === 'REJECTED' && app.status !== 'REJECTED') return false;
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase().trim();
        return (
            app.applicantName.toLowerCase().includes(q) ||
            app.identityNumber.toLowerCase().includes(q) ||
            app.email.toLowerCase().includes(q) ||
            app.cardType.toLowerCase().includes(q) ||
            app.studentNo.toLowerCase().includes(q)
        );
    });

    const countPending = applications.filter((a) => a.status === 'PENDING').length;
    const countApproved = applications.filter((a) => a.status === 'APPROVED').length;
    const countRejected = applications.filter((a) => a.status === 'REJECTED').length;
    const paginatedApps = filteredApps.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    const handleConfirmApprove = () => {
        if (selectedApp) {
            approveMutation.mutate({
                id: selectedApp.id,
                cardNumber: assignCardNumber.trim() || undefined,
            });
        }
    };

    const handleConfirmReject = () => {
        if (selectedApp && rejectionReason.trim()) {
            rejectMutation.mutate({
                id: selectedApp.id,
                reason: rejectionReason.trim(),
            });
        }
    };

    return (
        <Box sx={{ width: '100%', pb: 4 }}>
            {/* BAŞLIK BANNERI */}
            <Paper
                elevation={0}
                sx={{
                    p: 3,
                    mb: 3,
                    borderRadius: 4,
                    background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                    color: '#ffffff',
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    justifyContent: 'space-between',
                    alignItems: { xs: 'flex-start', md: 'center' },
                    gap: 2,
                    boxShadow: '0 10px 25px -5px rgba(2, 132, 199, 0.3)',
                }}
            >
                <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 52, height: 52 }}>
                        <CardIcon sx={{ fontSize: 30, color: '#ffffff' }} />
                    </Avatar>
                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.5px' }}>
                            Kart Başvuruları & Onay Yönetimi
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.3 }}>
                            Gelen başvuruları, yüklenen evrakları ve teslimat adreslerini doğrudan inceleyin.
                        </Typography>
                    </Box>
                </Stack>
                <Tooltip title="Listeyi Yenile">
                    <IconButton
                        onClick={() => refetch()}
                        disabled={isFetching}
                        sx={{
                            color: '#ffffff',
                            bgcolor: 'rgba(255,255,255,0.15)',
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' },
                        }}
                    >
                        <RefreshIcon />
                    </IconButton>
                </Tooltip>
            </Paper>

            {/* METRİK KARTLARI */}
            <Grid container spacing={2.5} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card elevation={0} sx={{ borderRadius: 3.5, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
                        <CardContent sx={{ p: 2.5 }}>
                            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box>
                                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
                                        Toplam Başvuru
                                    </Typography>
                                    <Typography variant="h4" sx={{ fontWeight: 900, color: '#0f172a', mt: 0.5 }}>
                                        {applications.length}
                                    </Typography>
                                </Box>
                                <Avatar sx={{ bgcolor: '#0284c7', width: 44, height: 44 }}>
                                    <CardIcon />
                                </Avatar>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card elevation={0} sx={{ borderRadius: 3.5, border: '1px solid #fed7aa', bgcolor: '#fff7ed' }}>
                        <CardContent sx={{ p: 2.5 }}>
                            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box>
                                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#c2410c', textTransform: 'uppercase' }}>
                                        Bekleyen Başvuru
                                    </Typography>
                                    <Typography variant="h4" sx={{ fontWeight: 900, color: '#9a3412', mt: 0.5 }}>
                                        {countPending}
                                    </Typography>
                                </Box>
                                <Avatar sx={{ bgcolor: '#ea580c', width: 44, height: 44 }}>
                                    <PendingIcon />
                                </Avatar>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card elevation={0} sx={{ borderRadius: 3.5, border: '1px solid #bbf7d0', bgcolor: '#f0fdf4' }}>
                        <CardContent sx={{ p: 2.5 }}>
                            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box>
                                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#15803d', textTransform: 'uppercase' }}>
                                        Onaylanan Kartlar
                                    </Typography>
                                    <Typography variant="h4" sx={{ fontWeight: 900, color: '#14532d', mt: 0.5 }}>
                                        {countApproved}
                                    </Typography>
                                </Box>
                                <Avatar sx={{ bgcolor: '#16a34a', width: 44, height: 44 }}>
                                    <CheckCircleIcon />
                                </Avatar>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card elevation={0} sx={{ borderRadius: 3.5, border: '1px solid #fecdd3', bgcolor: '#fff1f2' }}>
                        <CardContent sx={{ p: 2.5 }}>
                            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box>
                                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#be123c', textTransform: 'uppercase' }}>
                                        Reddedilenler
                                    </Typography>
                                    <Typography variant="h4" sx={{ fontWeight: 900, color: '#881337', mt: 0.5 }}>
                                        {countRejected}
                                    </Typography>
                                </Box>
                                <Avatar sx={{ bgcolor: '#e11d48', width: 44, height: 44 }}>
                                    <CancelIcon />
                                </Avatar>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* ARAMA VE SEKMELER */}
            <Paper elevation={0} sx={{ p: 2.5, mb: 3, borderRadius: 4, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
                <Grid container spacing={2} sx={{ alignItems: 'center' }}>
                    <Grid size={{ xs: 12, md: 5 }}>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Ad Soyad, T.C. Kimlik No veya E-posta..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setPage(0);
                            }}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon color="action" />
                                        </InputAdornment>
                                    ),
                                    sx: { borderRadius: 3 },
                                },
                            }}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 7 }}>
                        <Tabs
                            value={statusTab}
                            onChange={(_, val) => {
                                setStatusTab(val);
                                setPage(0);
                            }}
                            textColor="primary"
                            indicatorColor="primary"
                            variant="scrollable"
                            scrollButtons="auto"
                            sx={{
                                '& .MuiTab-root': { fontWeight: 800, textTransform: 'none', fontSize: '0.875rem' },
                            }}
                        >
                            <Tab label={`Tüm Başvurular (${applications.length})`} value="ALL" />
                            <Tab label={`Bekleyenler (${countPending})`} value="PENDING" />
                            <Tab label={`Onaylananlar (${countApproved})`} value="APPROVED" />
                            <Tab label={`Reddedilenler (${countRejected})`} value="REJECTED" />
                        </Tabs>
                    </Grid>
                </Grid>
            </Paper>

            {/* BAŞVURU TABLOSU */}
            <Paper elevation={0} sx={{ borderRadius: 4, border: '1px solid #e2e8f0', overflow: 'hidden', bgcolor: '#ffffff' }}>
                <TableContainer>
                    <Table sx={{ minWidth: 800 }}>
                        <TableHead sx={{ bgcolor: '#f8fafc' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Başvuran Yolcu</TableCell>
                                <TableCell sx={{ fontWeight: 800, color: '#475569' }}>T.C. / Okul No</TableCell>
                                <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Talep Edilen Kart</TableCell>
                                <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Tarih</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 800, color: '#475569' }}>Durum</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 800, color: '#475569' }}>İşlemler</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                                        <Typography variant="body2" color="text.secondary">Veriler yükleniyor...</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : paginatedApps.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                                        <CardIcon sx={{ fontSize: 48, color: '#cbd5e1', mb: 1 }} />
                                        <Typography variant="h6" sx={{ fontWeight: 800, color: '#64748b' }}>Başvuru Kaydı Bulunamadı</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedApps.map((app) => {
                                    const isPending = app.status === 'PENDING';
                                    const isApproved = app.status === 'APPROVED';
                                    return (
                                        <TableRow key={app.id || Math.random()} hover>
                                            <TableCell>
                                                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                                                    <Avatar sx={{ bgcolor: '#e0f2fe', color: '#0284c7', fontWeight: 800 }}>
                                                        {app.applicantName.charAt(0).toUpperCase()}
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a' }}>
                                                            {app.applicantName}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {app.email}
                                                        </Typography>
                                                    </Box>
                                                </Stack>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 700, color: '#1e293b' }}>
                                                    {app.identityNumber}
                                                </Typography>
                                                {app.studentNo && (
                                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                                        Okul No: {app.studentNo}
                                                    </Typography>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={app.cardType}
                                                    size="small"
                                                    color="primary"
                                                    sx={{ fontWeight: 800, borderRadius: 2 }}
                                                />
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.85rem' }}>
                                                {app.createdDate}
                                            </TableCell>
                                            <TableCell align="center">
                                                <Chip
                                                    size="small"
                                                    label={isPending ? 'Beklemede' : isApproved ? 'Onaylandı' : 'Reddedildi'}
                                                    color={isPending ? 'warning' : isApproved ? 'success' : 'error'}
                                                    sx={{ fontWeight: 800, borderRadius: 2 }}
                                                />
                                            </TableCell>
                                            <TableCell align="right">
                                                <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        color="info"
                                                        startIcon={<ViewIcon />}
                                                        onClick={() => {
                                                            setSelectedApp(app);
                                                            setIsDetailModalOpen(true);
                                                        }}
                                                        sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 800 }}
                                                    >
                                                        İncele
                                                    </Button>
                                                    {isPending && (
                                                        <>
                                                            <Button
                                                                size="small"
                                                                variant="contained"
                                                                color="success"
                                                                startIcon={<ApproveIcon />}
                                                                onClick={() => {
                                                                    setSelectedApp(app);
                                                                    setIsApproveDialogOpen(true);
                                                                }}
                                                                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 800 }}
                                                            >
                                                                Onayla
                                                            </Button>
                                                            <Button
                                                                size="small"
                                                                variant="outlined"
                                                                color="error"
                                                                startIcon={<RejectIcon />}
                                                                onClick={() => {
                                                                    setSelectedApp(app);
                                                                    setIsRejectDialogOpen(true);
                                                                }}
                                                                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 800 }}
                                                            >
                                                                Reddet
                                                            </Button>
                                                        </>
                                                    )}
                                                </Stack>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[5, 8, 15, 25]}
                    component="div"
                    count={filteredApps.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={(_, p) => setPage(p)}
                    onRowsPerPageChange={(e) => {
                        setRowsPerPage(parseInt(e.target.value, 10));
                        setPage(0);
                    }}
                />
            </Paper>

            {/* BAŞVURU DETAY MODALI */}
            <Dialog open={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: 4 } } }}>
                <DialogTitle sx={{ fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    Başvuru Detayı & Evrak Kontrolü
                    {selectedApp && (
                        <Chip
                            label={selectedApp.status === 'PENDING' ? 'Beklemede' : selectedApp.status === 'APPROVED' ? 'Onaylandı' : 'Reddedildi'}
                            color={selectedApp.status === 'PENDING' ? 'warning' : selectedApp.status === 'APPROVED' ? 'success' : 'error'}
                            size="small"
                            sx={{ fontWeight: 800 }}
                        />
                    )}
                </DialogTitle>
                <Divider />
                <DialogContent>
                    {selectedApp && (
                        <Stack spacing={2.5} sx={{ pt: 1 }}>
                            {/* KİŞİSEL BİLGİLER */}
                            <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, bgcolor: '#f8fafc' }}>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, textTransform: 'uppercase' }}>
                                    Kişisel ve İletişim Bilgileri
                                </Typography>
                                <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                                            <PersonIcon fontSize="small" color="action" />
                                            <Typography variant="body2" sx={{ fontWeight: 700 }}>{selectedApp.applicantName}</Typography>
                                        </Stack>
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                                            <BadgeIcon fontSize="small" color="action" />
                                            <Typography variant="body2" sx={{ fontWeight: 700 }}>TC No: {selectedApp.identityNumber}</Typography>
                                        </Stack>
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                                            <EmailIcon fontSize="small" color="action" />
                                            <Typography variant="body2">{selectedApp.email}</Typography>
                                        </Stack>
                                    </Grid>
                                    {selectedApp.studentNo && (
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                                                <SchoolIcon fontSize="small" color="action" />
                                                <Typography variant="body2">Okul No: <b>{selectedApp.studentNo}</b></Typography>
                                            </Stack>
                                        </Grid>
                                    )}
                                </Grid>
                            </Paper>

                            {/* KART TİPİ VE YÜKLENEN EVRAK */}
                            <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, textTransform: 'uppercase' }}>
                                    Kart Talebi & Yüklenen Belge
                                </Typography>
                                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0284c7', mt: 0.5 }}>
                                    {selectedApp.cardType}
                                </Typography>

                                <Box sx={{ mt: 1.5, p: 1.5, border: '1px dashed #cbd5e1', borderRadius: 2, bgcolor: '#ffffff' }}>
                                    {selectedApp.documentUrl ? (
                                        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                                            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                                                <DocIcon color="primary" />
                                                <Box>
                                                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                                        {selectedApp.documentName || 'Yüklenen Belge'}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">Kullanıcı tarafından sisteme yüklendi</Typography>
                                                </Box>
                                            </Stack>
                                            <Button
                                                size="small"
                                                variant="contained"
                                                color="primary"
                                                component="a"
                                                href={selectedApp.documentUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                sx={{ textTransform: 'none', borderRadius: 2 }}
                                            >
                                                Belgeyi Aç / İndir
                                            </Button>
                                        </Stack>
                                    ) : (
                                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                                            <DocIcon color="disabled" />
                                            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                                Bu başvuru için yüklenmiş herhangi bir belge/evrak bulunamadı.
                                            </Typography>
                                        </Stack>
                                    )}
                                </Box>
                            </Paper>

                            {/* TESLİMAT BİLGİLERİ */}
                            <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, textTransform: 'uppercase' }}>
                                    Teslimat Tercihi & Adres
                                </Typography>
                                {selectedApp.deliveryMethod && (
                                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mt: 1 }}>
                                        <ShippingIcon fontSize="small" color="action" />
                                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{selectedApp.deliveryMethod}</Typography>
                                    </Stack>
                                )}
                                <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start', mt: 1 }}>
                                    <AddressIcon fontSize="small" color="action" sx={{ mt: 0.3 }} />
                                    <Typography variant="body2" sx={{ color: selectedApp.deliveryAddress ? '#0f172a' : 'text.secondary', fontWeight: selectedApp.deliveryAddress ? 600 : 400 }}>
                                        {selectedApp.deliveryAddress || 'Kullanıcı adres bilgisi girmemiş.'}
                                    </Typography>
                                </Stack>
                            </Paper>

                            {/* RED GEREKÇESİ */}
                            {selectedApp.status === 'REJECTED' && selectedApp.rejectionReason && (
                                <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, bgcolor: '#fff1f2', borderColor: '#fecdd3' }}>
                                    <Typography variant="caption" color="error" sx={{ fontWeight: 800, textTransform: 'uppercase' }}>
                                        Reddedilme Gerekçesi
                                    </Typography>
                                    <Typography variant="body2" color="error.dark" sx={{ mt: 0.5, fontWeight: 600 }}>
                                        {selectedApp.rejectionReason}
                                    </Typography>
                                </Paper>
                            )}
                        </Stack>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2.5, justifyContent: 'space-between' }}>
                    <Button variant="outlined" onClick={() => setIsDetailModalOpen(false)}>Kapat</Button>
                    {selectedApp?.status === 'PENDING' && (
                        <Stack direction="row" spacing={1}>
                            <Button
                                variant="outlined"
                                color="error"
                                startIcon={<RejectIcon />}
                                onClick={() => setIsRejectDialogOpen(true)}
                            >
                                Reddet
                            </Button>
                            <Button
                                variant="contained"
                                color="success"
                                startIcon={<ApproveIcon />}
                                onClick={() => setIsApproveDialogOpen(true)}
                            >
                                Onayla
                            </Button>
                        </Stack>
                    )}
                </DialogActions>
            </Dialog>

            {/* ONAYLAMA DİYALOGU */}
            <Dialog open={isApproveDialogOpen} onClose={() => setIsApproveDialogOpen(false)} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
                <DialogTitle sx={{ fontWeight: 800 }}>Başvuruyu Onayla</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                        <b>{selectedApp?.applicantName}</b> isimli kullanıcının kart başvurusunu onaylamak üzeresiniz.
                    </Typography>
                    <TextField
                        fullWidth
                        size="small"
                        label="Fiziksel Kart Seri No (İsteğe Bağlı)"
                        placeholder="Örn: 3401-9921-1002"
                        value={assignCardNumber}
                        onChange={(e) => setAssignCardNumber(e.target.value)}
                    />
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setIsApproveDialogOpen(false)}>İptal</Button>
                    <Button variant="contained" color="success" onClick={handleConfirmApprove} disabled={approveMutation.isPending}>
                        {approveMutation.isPending ? 'İşleniyor...' : 'Onayla'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* REDDETME DİYALOGU */}
            <Dialog open={isRejectDialogOpen} onClose={() => setIsRejectDialogOpen(false)} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
                <DialogTitle sx={{ fontWeight: 800, color: 'error.main' }}>Başvuruyu Reddet</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                        Lütfen kullanıcıya iletilecek reddetme nedenini girin:
                    </Typography>
                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        size="small"
                        label="Gerekçe"
                        placeholder="Örn: Yüklenen öğrenci belgesi okunaksız veya süresi dolmuş."
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                    />
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setIsRejectDialogOpen(false)}>İptal</Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleConfirmReject}
                        disabled={!rejectionReason.trim() || rejectMutation.isPending}
                    >
                        {rejectMutation.isPending ? 'İşleniyor...' : 'Reddet'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* BİLDİRİM TOAST */}
            <Snackbar open={!!toastMessage} autoHideDuration={4000} onClose={() => setToastMessage(null)}>
                <Alert severity="info" sx={{ width: '100%', borderRadius: 3 }}>{toastMessage}</Alert>
            </Snackbar>
        </Box>
    );
};

export default CardApplicationsTab;