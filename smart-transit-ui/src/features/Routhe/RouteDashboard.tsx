import React, { useState, useEffect, useMemo } from 'react';
import * as signalR from '@microsoft/signalr';
import {
    Box,
    Grid,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    IconButton,
    Tooltip,
    Button,
    Stack,
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Avatar,
    TextField,
    MenuItem,
    InputAdornment,
} from '@mui/material';
import {
    AltRoute as RouteIcon,
    Groups as PassengerIcon,
    Close as CloseIcon,
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Search as SearchIcon,
    DirectionsBus as BusIcon,
    DirectionsSubway as SubwayIcon,
    DirectionsBoat as BoatIcon,
    Tram as TramIcon,
    FormatListBulleted as ListIcon,
    CreditCard as CreditCardIcon,
    ConfirmationNumber as BoardingIcon,
} from '@mui/icons-material';

// Tipler
export type TransportType = 'OTOBUS' | 'METRO' | 'METROBUS' | 'TRAMVAY' | 'TELEFERIK' | 'VAPUR';

export interface RouteItem {
    routeId: string;
    lineCode: string;
    transportType: TransportType;
    routeName: string;
    stopCount: number;
    dailyBoardings: number;
    lastResetDate: string;
}

export interface VehicleItem {
    id: string;
    vehicleCode: string;
    plateNumber: string;
    vehicleType: TransportType;
    lineCode?: string | null;
    isInMaintenance: boolean;
    validatorStatus: 'ONLINE' | 'OFFLINE' | 'UYARI';
}

const ROUTES_STORAGE_KEY = 'smart_transit_routes_data';
const VEHICLES_STORAGE_KEY = 'smart_transit_vehicles_data';

const generateGuid = (): string => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
};

export const RouteDashboardPage: React.FC = () => {
    const [routes, setRoutes] = useState<RouteItem[]>(() => {
        try {
            const savedData = localStorage.getItem(ROUTES_STORAGE_KEY);
            return savedData ? JSON.parse(savedData) : [];
        } catch (e) {
            console.error('Hat verileri yüklenemedi:', e);
            return [];
        }
    });

    const [vehicles, setVehicles] = useState<VehicleItem[]>(() => {
        try {
            const savedData = localStorage.getItem(VEHICLES_STORAGE_KEY);
            return savedData ? JSON.parse(savedData) : [];
        } catch (e) {
            return [];
        }
    });

    const [searchTerm, setSearchTerm] = useState('');

    const [isRouteModalOpen, setIsRouteModalOpen] = useState(false);
    const [editingRouteId, setEditingRouteId] = useState<string | null>(null);
    const [formLineCode, setFormLineCode] = useState('');
    const [formTransportType, setFormTransportType] = useState<TransportType>('OTOBUS');
    const [formRouteName, setFormRouteName] = useState('');
    const [formStopCount, setFormStopCount] = useState<number | ''>('');

    const [isAddVehicleModalOpen, setIsAddVehicleModalOpen] = useState(false);
    const [selectedRouteForVehicle, setSelectedRouteForVehicle] = useState<RouteItem | null>(null);
    const [inputVehicleCode, setInputVehicleCode] = useState('');

    const [isVehicleListModalOpen, setIsVehicleListModalOpen] = useState(false);
    const [selectedRouteVehicleList, setSelectedRouteVehicleList] = useState<RouteItem | null>(null);

    // --- SIGNALR CANLI DINLEME ---
    useEffect(() => {
        const connection = new signalR.HubConnectionBuilder()
            .withUrl('http://localhost:5176/boardingHub')
            .withAutomaticReconnect()
            .build();

        connection
            .start()
            .then(() => console.log('🟢 SignalR Bağlantısı Başarılı'))
            .catch((err) => console.error('🔴 SignalR Bağlantı Hatası:', err));

        connection.on('ReceiveBoarding', (payload: any) => {
            console.log('📩 Backend SignalR Ham Veri:', payload);

            // 1. JSON String olarak geldiyse nesneye çevir
            let data = payload;
            if (typeof payload === 'string') {
                try {
                    data = JSON.parse(payload);
                } catch {
                    data = payload; // Düz metin/id ise koru
                }
            }

            // 2. Hem PascalCase (C#) hem camelCase (JS) hem de düz değerleri yakala
            const targetId = String(
                data?.routeId ?? data?.RouteId ?? data?.id ?? data?.Id ?? (typeof data !== 'object' ? data : '')
            ).trim().toUpperCase();

            const targetLine = String(
                data?.lineCode ?? data?.LineCode ?? data?.line ?? data?.Line ?? ''
            ).trim().toUpperCase();

            console.log(`🔍 Aranan -> ID/Kod: "${targetId}" | Hat Kodu: "${targetLine}"`);

            // 3. Eşleşmeyi sağla ve state'i güncelle
            setRoutes((prevRoutes) => {
                let hasMatched = false;

                const updatedRoutes = prevRoutes.map((route) => {
                    const currentRouteId = String(route.routeId).trim().toUpperCase();
                    const currentLineCode = String(route.lineCode).trim().toUpperCase();

                    // Esnek Eşleştirme Mantığı
                    const isMatch =
                        (targetId !== '' && (currentRouteId === targetId || currentLineCode === targetId)) ||
                        (targetLine !== '' && currentLineCode === targetLine);

                    if (isMatch) {
                        hasMatched = true;
                        return {
                            ...route,
                            dailyBoardings: (route.dailyBoardings || 0) + 1,
                        };
                    }
                    return route;
                });

                if (!hasMatched) {
                    console.warn('⚠️ SignalR verisi geldi fakat mevcut hatlarla eşleşmedi!', {
                        gelenData: payload,
                        mevcutHatKodlari: prevRoutes.map((r) => r.lineCode),
                    });
                }

                return updatedRoutes;
            });
        });

        return () => {
            connection.stop();
        };
    }, []);
    // Gece yarısı 00:00 sıfırlama kontrolü
    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        setRoutes((prevRoutes) =>
            prevRoutes.map((r) => {
                if (r.lastResetDate !== today) {
                    return { ...r, dailyBoardings: 0, lastResetDate: today };
                }
                return r;
            })
        );
    }, []);

    useEffect(() => {
        localStorage.setItem(ROUTES_STORAGE_KEY, JSON.stringify(routes));
    }, [routes]);

    useEffect(() => {
        localStorage.setItem(VEHICLES_STORAGE_KEY, JSON.stringify(vehicles));
    }, [vehicles]);

    const totalRoutesCount = routes.length;
    const totalDailyBoardings = useMemo(() => {
        return routes.reduce((sum, r) => sum + (r.dailyBoardings || 0), 0);
    }, [routes]);

    const filteredRoutes = useMemo(() => {
        return routes.filter(
            (r) =>
                r.lineCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                r.routeName.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [routes, searchTerm]);

    // Manuel Yolcu Arttırma Test Fonksiyonu
    const handleSimulateBoarding = (routeId: string) => {
        setRoutes((prev) =>
            prev.map((r) => (r.routeId === routeId ? { ...r, dailyBoardings: (r.dailyBoardings || 0) + 1 } : r))
        );
    };

    const handleOpenAddRoute = () => {
        setEditingRouteId(null);
        setFormLineCode('');
        setFormTransportType('OTOBUS');
        setFormRouteName('');
        setFormStopCount('');
        setIsRouteModalOpen(true);
    };

    const handleOpenEditRoute = (route: RouteItem) => {
        setEditingRouteId(route.routeId);
        setFormLineCode(route.lineCode);
        setFormTransportType(route.transportType);
        setFormRouteName(route.routeName);
        setFormStopCount(route.stopCount);
        setIsRouteModalOpen(true);
    };

    const handleSaveRoute = () => {
        if (!formLineCode.trim() || !formRouteName.trim() || !formStopCount) {
            alert('Lütfen tüm alanları doldurunuz.');
            return;
        }

        const trimmedLineCode = formLineCode.trim().toUpperCase();

        const isDuplicate = routes.some(
            (r) => r.lineCode.toUpperCase() === trimmedLineCode && r.routeId !== editingRouteId
        );

        if (isDuplicate) {
            alert(`"${trimmedLineCode}" kodlu hat zaten kayıtlı!`);
            return;
        }

        const today = new Date().toISOString().split('T')[0];

        if (editingRouteId) {
            setRoutes((prev) =>
                prev.map((r) =>
                    r.routeId === editingRouteId
                        ? {
                            ...r,
                            lineCode: trimmedLineCode,
                            transportType: formTransportType,
                            routeName: formRouteName,
                            stopCount: Number(formStopCount),
                        }
                        : r
                )
            );
        } else {
            const newRoute: RouteItem = {
                routeId: generateGuid(),
                lineCode: trimmedLineCode,
                transportType: formTransportType,
                routeName: formRouteName,
                stopCount: Number(formStopCount),
                dailyBoardings: 0,
                lastResetDate: today,
            };
            setRoutes((prev) => [newRoute, ...prev]);
        }
        setIsRouteModalOpen(false);
    };

    const handleDeleteRoute = (routeId: string, lineCode: string) => {
        if (window.confirm(`"${lineCode}" kodlu hattı silmek istediğinize emin misiniz?`)) {
            setRoutes((prev) => prev.filter((r) => r.routeId !== routeId));
            setVehicles((prev) =>
                prev.map((v) => (v.lineCode === lineCode ? { ...v, lineCode: null } : v))
            );
        }
    };

    const handleOpenAddVehicleModal = (route: RouteItem) => {
        setSelectedRouteForVehicle(route);
        setInputVehicleCode('');
        setIsAddVehicleModalOpen(true);
    };

    const handleAssignVehicleToRoute = () => {
        if (!inputVehicleCode.trim() || !selectedRouteForVehicle) return;

        const code = inputVehicleCode.trim();
        const existingVehicleIndex = vehicles.findIndex(
            (v) => v.vehicleCode.toLowerCase() === code.toLowerCase()
        );

        if (existingVehicleIndex !== -1) {
            setVehicles((prev) =>
                prev.map((v, idx) =>
                    idx === existingVehicleIndex
                        ? { ...v, lineCode: selectedRouteForVehicle.lineCode }
                        : v
                )
            );
        } else {
            const newVehicle: VehicleItem = {
                id: generateGuid(),
                vehicleCode: code,
                plateNumber: `34 TV ${Math.floor(100 + Math.random() * 900)}`,
                vehicleType: selectedRouteForVehicle.transportType,
                lineCode: selectedRouteForVehicle.lineCode,
                isInMaintenance: false,
                validatorStatus: 'ONLINE',
            };
            setVehicles((prev) => [...prev, newVehicle]);
        }

        alert(`"${code}" kodlu araç "${selectedRouteForVehicle.lineCode}" hattına atandı.`);
        setIsAddVehicleModalOpen(false);
    };

    const handleRemoveVehicleFromRoute = (vehicleId: string) => {
        setVehicles((prev) =>
            prev.map((v) => (v.id === vehicleId ? { ...v, lineCode: null } : v))
        );
    };

    const getTransportBadge = (type: TransportType) => {
        switch (type) {
            case 'METRO':
                return { label: 'Metro', icon: <SubwayIcon fontSize="small" />, color: '#2563eb' };
            case 'METROBUS':
                return { label: 'Metrobüs', icon: <BusIcon fontSize="small" />, color: '#d97706' };
            case 'TRAMVAY':
                return { label: 'Tramvay', icon: <TramIcon fontSize="small" />, color: '#059669' };
            case 'VAPUR':
                return { label: 'Vapur', icon: <BoatIcon fontSize="small" />, color: '#0284c7' };
            case 'TELEFERIK':
                return { label: 'Teleferik', icon: <RouteIcon fontSize="small" />, color: '#9333ea' };
            default:
                return { label: 'Otobüs', icon: <BusIcon fontSize="small" />, color: '#16a34a' };
        }
    };

    return (
        <Box sx={{ width: '100%', minHeight: '100vh', pb: 4 }}>
            {/* Üst Başlık Kartı */}
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
                }}
            >
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                    <Avatar sx={{ bgcolor: '#2563eb', color: '#ffffff', width: 44, height: 44 }}>
                        <RouteIcon />
                    </Avatar>
                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: 800 }}>
                            Rota & Hat Yönetimi
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                            Hat Tanımlama, Güzergah ve Atanan Araç Kontrol Paneli
                        </Typography>
                    </Box>
                </Stack>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleOpenAddRoute}
                    sx={{
                        bgcolor: '#2563eb',
                        color: '#ffffff',
                        fontWeight: 800,
                        borderRadius: 3,
                        px: 3,
                        py: 1.2,
                        '&:hover': { bgcolor: '#1d4ed8' },
                    }}
                >
                    Yeni Hat Ekle
                </Button>
            </Paper>

            {/* İstatistik Kartları */}
            <Grid container spacing={2.5} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 2.5,
                            borderRadius: 4,
                            background: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)',
                            border: '1px solid #bae6fd',
                        }}
                    >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Avatar sx={{ bgcolor: '#0284c7', width: 44, height: 44 }}>
                                <RouteIcon />
                            </Avatar>
                            <Chip size="small" label="Canlı Veri" color="info" sx={{ fontWeight: 800, borderRadius: 2 }} />
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#0369a1', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                            Sistemdeki Hat Sayısı
                        </Typography>
                        <Typography variant="h4" sx={{ mt: 0.5, fontWeight: 900, color: '#0c4a6e' }}>
                            {totalRoutesCount} Hat
                        </Typography>
                    </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 2.5,
                            borderRadius: 4,
                            background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)',
                            border: '1px solid #bbf7d0',
                        }}
                    >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Avatar sx={{ bgcolor: '#16a34a', width: 44, height: 44 }}>
                                <PassengerIcon />
                            </Avatar>
                            <Chip size="small" label="Anlık Toplam (Boarding)" color="success" sx={{ fontWeight: 800, borderRadius: 2 }} />
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#15803d', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                            Günlük Taşınan Yolcu (00:00 Sıfırlanır)
                        </Typography>
                        <Typography variant="h4" sx={{ mt: 0.5, fontWeight: 900, color: '#14532d' }}>
                            {totalDailyBoardings.toLocaleString('tr-TR')} Yolcu
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>

            {/* Arama Barı */}
            <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 4, border: '1px solid #e2e8f0' }}>
                <TextField
                    fullWidth
                    size="small"
                    placeholder="Hat Kodu veya Güzergah Adı ile Arayın..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon color="action" />
                                </InputAdornment>
                            ),
                        },
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                />
            </Paper>

            {/* Operatör Hat Tablosu */}
            <Paper elevation={0} sx={{ borderRadius: 4, bgcolor: '#ffffff', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <Box sx={{ p: 2.5 }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
                        Operatör Hat Paneli ({filteredRoutes.length})
                    </Typography>
                </Box>
                <Divider />
                <TableContainer>
                    <Table>
                        <TableHead sx={{ bgcolor: '#f8fafc' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 800 }}>Hat Kodu</TableCell>
                                <TableCell sx={{ fontWeight: 800 }}>Ulaşım Tipi</TableCell>
                                <TableCell sx={{ fontWeight: 800 }}>Güzergah Adı</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 800 }}>Durak Sayısı</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 800 }}>Aktif Araç Sayısı</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 800 }}>Günlük Yolcu (Boarding)</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 800 }}>Araç Yönetimi</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 800 }}>İşlemler</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredRoutes.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                                        <Typography color="text.secondary">
                                            Kayıtlı hat bulunamadı. Lütfen "Yeni Hat Ekle" butonunu kullanın.
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredRoutes.map((route) => {
                                    const badge = getTransportBadge(route.transportType);
                                    const assignedVehicles = vehicles.filter((v) => v.lineCode === route.lineCode);
                                    const activeVehicleCount = assignedVehicles.length;

                                    return (
                                        <TableRow key={route.routeId} hover>
                                            <TableCell>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#0f172a' }}>
                                                    {route.lineCode}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    icon={badge.icon}
                                                    label={badge.label}
                                                    size="small"
                                                    sx={{
                                                        fontWeight: 700,
                                                        bgcolor: `${badge.color}15`,
                                                        color: badge.color,
                                                        '& .MuiChip-icon': { color: badge.color },
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 600, color: '#334155' }}>
                                                {route.routeName}
                                            </TableCell>
                                            <TableCell align="center">
                                                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                                    {route.stopCount} Durak
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Chip
                                                    label={`${activeVehicleCount} Araç`}
                                                    size="small"
                                                    color={activeVehicleCount > 0 ? 'primary' : 'default'}
                                                    sx={{ fontWeight: 800 }}
                                                />
                                            </TableCell>
                                            <TableCell align="center">
                                                <Stack direction="row" spacing={1} sx={{ justifyContent: 'center', alignItems: 'center' }}>
                                                    <Typography variant="body1" sx={{ fontWeight: 900, color: '#16a34a' }}>
                                                        {route.dailyBoardings}
                                                    </Typography>
                                                    <CreditCardIcon sx={{ color: '#16a34a', fontSize: 20 }} />
                                                    <Tooltip title="Test Amaçlı Yolcu Ekle">
                                                        <IconButton
                                                            size="small"
                                                            color="success"
                                                            onClick={() => handleSimulateBoarding(route.routeId)}
                                                            sx={{ bgcolor: '#f0fdf4', ml: 0.5 }}
                                                        >
                                                            <BoardingIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Stack>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Stack direction="row" spacing={1} sx={{ justifyContent: 'center' }}>
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        startIcon={<AddIcon />}
                                                        onClick={() => handleOpenAddVehicleModal(route)}
                                                        sx={{ fontSize: '0.7rem', fontWeight: 800, borderRadius: 2 }}
                                                    >
                                                        Araç Ekle
                                                    </Button>
                                                    <Button
                                                        size="small"
                                                        variant="contained"
                                                        color="info"
                                                        startIcon={<ListIcon />}
                                                        onClick={() => {
                                                            setSelectedRouteVehicleList(route);
                                                            setIsVehicleListModalOpen(true);
                                                        }}
                                                        sx={{ fontSize: '0.7rem', fontWeight: 800, borderRadius: 2 }}
                                                    >
                                                        Araç Listesi ({activeVehicleCount})
                                                    </Button>
                                                </Stack>
                                            </TableCell>
                                            <TableCell align="right">
                                                <Tooltip title="Düzenle">
                                                    <IconButton color="primary" onClick={() => handleOpenEditRoute(route)}>
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Sil">
                                                    <IconButton color="error" onClick={() => handleDeleteRoute(route.routeId, route.lineCode)}>
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* MODAL 1: YENİ HAT EKLE / DÜZENLE */}
            <Dialog open={isRouteModalOpen} onClose={() => setIsRouteModalOpen(false)} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: 4, p: 1 } } }}>
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>
                        {editingRouteId ? 'Hat Bilgilerini Düzenle' : 'Yeni Hat Ekle'}
                    </Typography>
                    <IconButton onClick={() => setIsRouteModalOpen(false)}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <Divider />
                <DialogContent sx={{ pt: 2.5 }}>
                    <Stack spacing={2.5}>
                        <TextField fullWidth label="Hat Kodu (örn: 34BZ)" value={formLineCode} onChange={(e) => setFormLineCode(e.target.value)} />
                        <TextField select fullWidth label="Ulaşım Tipi" value={formTransportType} onChange={(e) => setFormTransportType(e.target.value as TransportType)}>
                            <MenuItem value="OTOBUS">Otobüs</MenuItem>
                            <MenuItem value="METRO">Metro</MenuItem>
                            <MenuItem value="METROBUS">Metrobüs</MenuItem>
                            <MenuItem value="TRAMVAY">Tramvay</MenuItem>
                            <MenuItem value="TELEFERIK">Teleferik</MenuItem>
                            <MenuItem value="VAPUR">Vapur</MenuItem>
                        </TextField>
                        <TextField fullWidth label="Güzergah Adı (örn: Beylikdüzü - Zincirlikuyu)" value={formRouteName} onChange={(e) => setFormRouteName(e.target.value)} />
                        <TextField fullWidth type="number" label="Durak Sayısı" value={formStopCount} onChange={(e) => setFormStopCount(e.target.value ? Number(e.target.value) : '')} />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 2.5 }}>
                    <Button color="inherit" onClick={() => setIsRouteModalOpen(false)}>İptal</Button>
                    <Button variant="contained" color="primary" onClick={handleSaveRoute} sx={{ borderRadius: 2.5, px: 3, fontWeight: 800 }}>
                        {editingRouteId ? 'Güncelle' : 'Kaydet'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* MODAL 2: HATTA ARAÇ EKLE */}
            <Dialog open={isAddVehicleModalOpen} onClose={() => setIsAddVehicleModalOpen(false)} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: 4, p: 1 } } }}>
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>Hatta Araç Tanımla</Typography>
                    <IconButton onClick={() => setIsAddVehicleModalOpen(false)}><CloseIcon /></IconButton>
                </DialogTitle>
                <Divider />
                <DialogContent sx={{ pt: 2.5 }}>
                    <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                        <b>{selectedRouteForVehicle?.lineCode}</b> hattına atamak istediğiniz aracın kodunu giriniz.
                    </Typography>
                    <TextField fullWidth label="Araç Kodu (örn: #001)" value={inputVehicleCode} onChange={(e) => setInputVehicleCode(e.target.value)} />
                </DialogContent>
                <DialogActions sx={{ p: 2.5 }}>
                    <Button color="inherit" onClick={() => setIsAddVehicleModalOpen(false)}>İptal</Button>
                    <Button variant="contained" color="success" onClick={handleAssignVehicleToRoute} sx={{ borderRadius: 2.5, px: 3, fontWeight: 800 }}>
                        Hatta Tanımla
                    </Button>
                </DialogActions>
            </Dialog>

            {/* MODAL 3: HATTA TANIMLI ARAÇLARIN LİSTESİ */}
            <Dialog open={isVehicleListModalOpen} onClose={() => setIsVehicleListModalOpen(false)} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: 4, p: 1 } } }}>
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>
                        {selectedRouteVehicleList?.lineCode} Hattına Tanımlı Araçlar
                    </Typography>
                    <IconButton onClick={() => setIsVehicleListModalOpen(false)}><CloseIcon /></IconButton>
                </DialogTitle>
                <Divider />
                <DialogContent sx={{ pt: 2 }}>
                    {(() => {
                        const lineVehicles = vehicles.filter((v) => v.lineCode === selectedRouteVehicleList?.lineCode);
                        if (lineVehicles.length === 0) {
                            return (
                                <Typography color="text.secondary" align="center" sx={{ py: 3 }}>
                                    Bu hatta henüz tanımlanmış bir araç bulunmamaktadır.
                                </Typography>
                            );
                        }
                        return (
                            <TableContainer>
                                <Table size="small">
                                    <TableHead sx={{ bgcolor: '#f8fafc' }}>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 800 }}>Araç Kodu</TableCell>
                                            <TableCell sx={{ fontWeight: 800 }}>Plakası</TableCell>
                                            <TableCell sx={{ fontWeight: 800 }}>Araç Cinsi</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 800 }}>İşlem</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {lineVehicles.map((v) => (
                                            <TableRow key={v.id} hover>
                                                <TableCell sx={{ fontWeight: 800 }}>{v.vehicleCode}</TableCell>
                                                <TableCell>{v.plateNumber}</TableCell>
                                                <TableCell>
                                                    <Chip label={v.vehicleType} size="small" variant="outlined" />
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Button size="small" color="error" onClick={() => handleRemoveVehicleFromRoute(v.id)}>
                                                        Hattan Çıkar
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        );
                    })()}
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setIsVehicleListModalOpen(false)}>Kapat</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default RouteDashboardPage;