import React, { useState, useEffect, useMemo } from 'react';
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
    Alert,
} from '@mui/material';
import {
    DirectionsBus as BusIcon,
    DirectionsSubway as SubwayIcon,
    DirectionsBoat as BoatIcon,
    Tram as TramIcon,
    AltRoute as RouteIcon,
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Search as SearchIcon,
    Close as CloseIcon,
    DirectionsCar as VehicleIcon,
    Build as MaintenanceIcon,
    CheckCircle as OnlineIcon,
    Error as WarningIcon,
    Cancel as OfflineIcon,
    Person as PersonIcon,
} from '@mui/icons-material';

// Tipler
export type TransportType = 'OTOBUS' | 'METRO' | 'METROBUS' | 'TRAMVAY' | 'TELEFERIK' | 'VAPUR';
export type ValidatorStatus = 'ONLINE' | 'OFFLINE' | 'UYARI';

export interface VehicleItem {
    id: string;
    vehicleCode: string; // Benzersiz Araç Kodu (Örn: #001)
    plateNumber: string; // Türkiye Plaka Formatı (Örn: 34 ABC 123)
    vehicleType: TransportType;
    lineCode?: string | null; // Atandığı Hat
    isInMaintenance: boolean; // Bakımda mı?
    validatorStatus: ValidatorStatus;
    driverName?: string | null; // Sürücü Adı Soyadı (Opsiyonel / Nullable)
}

export interface RouteItem {
    routeId: string;
    lineCode: string;
    routeName: string;
}

const VEHICLES_STORAGE_KEY = 'smart_transit_vehicles_data';
const ROUTES_STORAGE_KEY = 'smart_transit_routes_data';

// --- TÜRKİYE PLAKA DOĞRULAMA FONKSİYONU ---
export const isValidTurkishPlate = (plate: string): boolean => {
    const cleanPlate = plate.trim().toUpperCase().replace(/\s+/g, '');

    const plateRegex = /^(0[1-9]|[1-7][0-9]|8[01])([A-Z]{1,3})(\d{2,5})$/;
    const match = cleanPlate.match(plateRegex);

    if (!match) return false;

    const [, , letters, numbers] = match;
    const letterCount = letters.length;
    const numberCount = numbers.length;

    if (letterCount === 1 && (numberCount < 4 || numberCount > 5)) return false;
    if (letterCount === 2 && (numberCount < 3 || numberCount > 4)) return false;
    if (letterCount === 3 && (numberCount < 2 || numberCount > 4)) return false;

    return true;
};

// Plakayı Standart Formatına Getirme (Örn: "34abc123" -> "34 ABC 123")
export const formatTurkishPlate = (plate: string): string => {
    const clean = plate.trim().toUpperCase().replace(/\s+/g, '');
    const match = clean.match(/^(0[1-9]|[1-7][0-9]|8[01])([A-Z]{1,3})(\d{2,5})$/);
    if (!match) return plate.toUpperCase();
    return `${match[1]} ${match[2]} ${match[3]}`;
};

export const VehicleDashboardPage: React.FC = () => {
    // 1. Araç Verilerini Yükle
    const [vehicles, setVehicles] = useState<VehicleItem[]>(() => {
        try {
            const saved = localStorage.getItem(VEHICLES_STORAGE_KEY);
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    // 2. Hat Verilerini Yükle
    const [routes] = useState<RouteItem[]>(() => {
        try {
            const saved = localStorage.getItem(ROUTES_STORAGE_KEY);
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    const [searchTerm, setSearchTerm] = useState('');

    // --- MODAL & FORM DURUMLARI ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null);

    const [formVehicleCode, setFormVehicleCode] = useState('');
    const [formPlateNumber, setFormPlateNumber] = useState('');
    const [formVehicleType, setFormVehicleType] = useState<TransportType>('OTOBUS');
    const [formLineCode, setFormLineCode] = useState<string>('');
    const [formDriverName, setFormDriverName] = useState<string>(''); // Sürücü alanı
    const [formIsInMaintenance, setFormIsInMaintenance] = useState(false);
    const [formValidatorStatus, setFormValidatorStatus] = useState<ValidatorStatus>('ONLINE');

    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        localStorage.setItem(VEHICLES_STORAGE_KEY, JSON.stringify(vehicles));
    }, [vehicles]);

    const totalVehicles = vehicles.length;
    const activeVehicles = useMemo(() => vehicles.filter((v) => !v.isInMaintenance).length, [vehicles]);
    const maintenanceVehicles = useMemo(() => vehicles.filter((v) => v.isInMaintenance).length, [vehicles]);

    const filteredVehicles = useMemo(() => {
        return vehicles.filter(
            (v) =>
                v.vehicleCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                v.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (v.driverName && v.driverName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (v.lineCode && v.lineCode.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [vehicles, searchTerm]);

    const handleOpenAddModal = () => {
        setEditingVehicleId(null);
        setFormVehicleCode('');
        setFormPlateNumber('');
        setFormVehicleType('OTOBUS');
        setFormLineCode('');
        setFormDriverName('');
        setFormIsInMaintenance(false);
        setFormValidatorStatus('ONLINE');
        setErrorMessage(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (vehicle: VehicleItem) => {
        setEditingVehicleId(vehicle.id);
        setFormVehicleCode(vehicle.vehicleCode);
        setFormPlateNumber(vehicle.plateNumber);
        setFormVehicleType(vehicle.vehicleType);
        setFormLineCode(vehicle.lineCode || '');
        setFormDriverName(vehicle.driverName || '');
        setFormIsInMaintenance(vehicle.isInMaintenance);
        setFormValidatorStatus(vehicle.validatorStatus);
        setErrorMessage(null);
        setIsModalOpen(true);
    };

    const handleSaveVehicle = () => {
        setErrorMessage(null);

        const trimmedCode = formVehicleCode.trim().toUpperCase();
        const trimmedPlate = formPlateNumber.trim().toUpperCase();
        const trimmedDriver = formDriverName.trim();

        if (!trimmedCode || !trimmedPlate) {
            setErrorMessage('Lütfen Araç Kodu ve Plaka alanlarını doldurunuz.');
            return;
        }

        const isDuplicateCode = vehicles.some(
            (v) => v.vehicleCode.toUpperCase() === trimmedCode && v.id !== editingVehicleId
        );
        if (isDuplicateCode) {
            setErrorMessage(`"${trimmedCode}" koduna sahip bir araç zaten sistemde kayıtlı!`);
            return;
        }

        if (!isValidTurkishPlate(trimmedPlate)) {
            setErrorMessage('Geçersiz Plaka! Lütfen geçerli bir Türkiye plakası giriniz (Örn: 34 ABC 123, 06 A 1234, 35 AB 123).');
            return;
        }

        const formattedPlate = formatTurkishPlate(trimmedPlate);

        if (editingVehicleId) {
            setVehicles((prev) =>
                prev.map((v) =>
                    v.id === editingVehicleId
                        ? {
                            ...v,
                            vehicleCode: trimmedCode,
                            plateNumber: formattedPlate,
                            vehicleType: formVehicleType,
                            lineCode: formLineCode || null,
                            driverName: trimmedDriver !== '' ? trimmedDriver : null,
                            isInMaintenance: formIsInMaintenance,
                            validatorStatus: formValidatorStatus,
                        }
                        : v
                )
            );
        } else {
            const newVehicle: VehicleItem = {
                id: crypto.randomUUID(),
                vehicleCode: trimmedCode,
                plateNumber: formattedPlate,
                vehicleType: formVehicleType,
                lineCode: formLineCode || null,
                driverName: trimmedDriver !== '' ? trimmedDriver : null,
                isInMaintenance: formIsInMaintenance,
                validatorStatus: formValidatorStatus,
            };
            setVehicles((prev) => [newVehicle, ...prev]);
        }

        setIsModalOpen(false);
    };

    const handleDeleteVehicle = (id: string, code: string) => {
        if (window.confirm(`"${code}" kodlu aracı silmek istediğinize emin misiniz?`)) {
            setVehicles((prev) => prev.filter((v) => v.id !== id));
        }
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
                        <VehicleIcon />
                    </Avatar>
                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: 800 }}>
                            Araç Filo Yönetimi
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                            Sistemdeki Tüm Araçların Plaka, Sürücü, Hat ve Validatör Durum Paneli
                        </Typography>
                    </Box>
                </Stack>

                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleOpenAddModal}
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
                    Yeni Araç Ekle
                </Button>
            </Paper>

            {/* İstatistik Kartları */}
            <Grid container spacing={2.5} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <Paper elevation={0} sx={{ p: 2.5, borderRadius: 4, border: '1px solid #e2e8f0' }}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>
                            TOPLAM ARAÇ SAYISI
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 900, mt: 0.5, color: '#0f172a' }}>
                            {totalVehicles}
                        </Typography>
                    </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <Paper elevation={0} sx={{ p: 2.5, borderRadius: 4, border: '1px solid #bbf7d0', bgcolor: '#f0fdf4' }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#16a34a' }}>
                            AKTİF FİLO
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 900, mt: 0.5, color: '#14532d' }}>
                            {activeVehicles}
                        </Typography>
                    </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <Paper elevation={0} sx={{ p: 2.5, borderRadius: 4, border: '1px solid #fecaca', bgcolor: '#fef2f2' }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#dc2626' }}>
                            BAKIMDA / SERVİS DIŞI
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 900, mt: 0.5, color: '#7f1d1d' }}>
                            {maintenanceVehicles}
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>

            {/* Arama Barı */}
            <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 4, border: '1px solid #e2e8f0' }}>
                <TextField
                    fullWidth
                    size="small"
                    placeholder="Araç Kodu, Plaka, Sürücü veya Hat Kodu ile Arayın..."
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

            {/* Araç Tablosu */}
            <Paper elevation={0} sx={{ borderRadius: 4, bgcolor: '#ffffff', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <TableContainer>
                    <Table>
                        <TableHead sx={{ bgcolor: '#f8fafc' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 800 }}>Araç Kodu</TableCell>
                                <TableCell sx={{ fontWeight: 800 }}>Plaka</TableCell>
                                <TableCell sx={{ fontWeight: 800 }}>Araç Türü</TableCell>
                                <TableCell sx={{ fontWeight: 800 }}>Atandığı Hat</TableCell>
                                <TableCell sx={{ fontWeight: 800 }}>Sürücü</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 800 }}>Durum</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 800 }}>Validatör</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 800 }}>İşlemler</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredVehicles.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                                        <Typography color="text.secondary">
                                            Kayıtlı araç bulunamadı. Lütfen "Yeni Araç Ekle" butonundan araç ekleyin.
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredVehicles.map((vehicle) => {
                                    const badge = getTransportBadge(vehicle.vehicleType);
                                    return (
                                        <TableRow key={vehicle.id} hover>
                                            <TableCell sx={{ fontWeight: 900, color: '#0f172a' }}>
                                                {vehicle.vehicleCode}
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={vehicle.plateNumber}
                                                    size="small"
                                                    sx={{ fontWeight: 800, bgcolor: '#e2e8f0', color: '#0f172a', borderRadius: 2 }}
                                                />
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
                                            <TableCell sx={{ fontWeight: 700, color: vehicle.lineCode ? '#0f172a' : '#94a3b8' }}>
                                                {vehicle.lineCode ? (
                                                    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                                                        <RouteIcon fontSize="small" color="action" />
                                                        <span>{vehicle.lineCode}</span>
                                                    </Stack>
                                                ) : (
                                                    'Boşta (Atanmadı)'
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        fontWeight: vehicle.driverName ? 700 : 400,
                                                        color: vehicle.driverName ? '#0f172a' : '#94a3b8',
                                                        fontStyle: vehicle.driverName ? 'normal' : 'italic',
                                                    }}
                                                >
                                                    {vehicle.driverName || 'Atanmadı'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                {vehicle.isInMaintenance ? (
                                                    <Chip icon={<MaintenanceIcon />} label="Bakımda" color="error" size="small" sx={{ fontWeight: 800 }} />
                                                ) : (
                                                    <Chip label="Aktif" color="success" size="small" sx={{ fontWeight: 800 }} />
                                                )}
                                            </TableCell>
                                            <TableCell align="center">
                                                {vehicle.validatorStatus === 'ONLINE' && <Chip icon={<OnlineIcon />} label="Online" color="success" size="small" variant="outlined" />}
                                                {vehicle.validatorStatus === 'UYARI' && <Chip icon={<WarningIcon />} label="Uyarı" color="warning" size="small" variant="outlined" />}
                                                {vehicle.validatorStatus === 'OFFLINE' && <Chip icon={<OfflineIcon />} label="Offline" color="error" size="small" variant="outlined" />}
                                            </TableCell>
                                            <TableCell align="right">
                                                <Tooltip title="Düzenle">
                                                    <IconButton color="primary" onClick={() => handleOpenEditModal(vehicle)}>
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Sil">
                                                    <IconButton color="error" onClick={() => handleDeleteVehicle(vehicle.id, vehicle.vehicleCode)}>
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

            {/* ARAÇ EKLEME / DÜZENLEME MODALI */}
            <Dialog
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                maxWidth="xs"
                fullWidth
                slotProps={{ paper: { sx: { borderRadius: 4, p: 1 } } }}
            >
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>
                        {editingVehicleId ? 'Araç Bilgilerini Düzenle' : 'Yeni Araç Kaydı'}
                    </Typography>
                    <IconButton onClick={() => setIsModalOpen(false)}><CloseIcon /></IconButton>
                </DialogTitle>
                <Divider />
                <DialogContent sx={{ pt: 2.5 }}>
                    <Stack spacing={2.5}>
                        {errorMessage && (
                            <Alert severity="error" sx={{ borderRadius: 3 }}>
                                {errorMessage}
                            </Alert>
                        )}

                        <TextField
                            fullWidth
                            label="Araç Kodu (Örn: #001)"
                            value={formVehicleCode}
                            onChange={(e) => setFormVehicleCode(e.target.value)}
                            helperText="Araç kodu sistem genelinde benzersiz olmalıdır."
                        />

                        <TextField
                            fullWidth
                            label="Araç Plakası (Örn: 34 ABC 123)"
                            value={formPlateNumber}
                            onChange={(e) => setFormPlateNumber(e.target.value.toUpperCase())}
                            helperText="Geçerli Türkiye plaka formatı giriniz."
                        />

                        <TextField
                            fullWidth
                            label="Sürücü Adı Soyadı (Opsiyonel)"
                            value={formDriverName}
                            onChange={(e) => setFormDriverName(e.target.value)}
                            placeholder="Örn: Ahmet Yılmaz"
                            helperText="Araçta sürücü atanmadıysa boş bırakabilirsiniz."
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <PersonIcon color="action" />
                                        </InputAdornment>
                                    ),
                                },
                            }}
                        />

                        <TextField
                            select
                            fullWidth
                            label="Araç Türü"
                            value={formVehicleType}
                            onChange={(e) => setFormVehicleType(e.target.value as TransportType)}
                        >
                            <MenuItem value="OTOBUS">Otobüs</MenuItem>
                            <MenuItem value="METRO">Metro</MenuItem>
                            <MenuItem value="METROBUS">Metrobüs</MenuItem>
                            <MenuItem value="TRAMVAY">Tramvay</MenuItem>
                            <MenuItem value="TELEFERIK">Teleferik</MenuItem>
                            <MenuItem value="VAPUR">Vapur</MenuItem>
                        </TextField>

                        <TextField
                            select
                            fullWidth
                            label="Atanacağı Hat (Opsiyonel)"
                            value={formLineCode}
                            onChange={(e) => setFormLineCode(e.target.value)}
                        >
                            <MenuItem value="">-- Hatta Atama Yapma (Boşta) --</MenuItem>
                            {routes.map((r) => (
                                <MenuItem key={r.routeId} value={r.lineCode}>
                                    {r.lineCode} - {r.routeName}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            select
                            fullWidth
                            label="Servis Durumu"
                            value={formIsInMaintenance ? 'MAINTENANCE' : 'ACTIVE'}
                            onChange={(e) => setFormIsInMaintenance(e.target.value === 'MAINTENANCE')}
                        >
                            <MenuItem value="ACTIVE">Aktif (Seferde)</MenuItem>
                            <MenuItem value="MAINTENANCE">Bakımda (Servis Dışı)</MenuItem>
                        </TextField>

                        <TextField
                            select
                            fullWidth
                            label="Validatör Durumu"
                            value={formValidatorStatus}
                            onChange={(e) => setFormValidatorStatus(e.target.value as ValidatorStatus)}
                        >
                            <MenuItem value="ONLINE">Online (Çalışıyor)</MenuItem>
                            <MenuItem value="UYARI">Uyarı (Düşük Sinyal/Kağıt Az)</MenuItem>
                            <MenuItem value="OFFLINE">Offline (Arızalı)</MenuItem>
                        </TextField>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 2.5 }}>
                    <Button color="inherit" onClick={() => setIsModalOpen(false)}>İptal</Button>
                    <Button variant="contained" color="primary" onClick={handleSaveVehicle} sx={{ borderRadius: 2.5, px: 3, fontWeight: 800 }}>
                        {editingVehicleId ? 'Güncelle' : 'Kaydet'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default VehicleDashboardPage;