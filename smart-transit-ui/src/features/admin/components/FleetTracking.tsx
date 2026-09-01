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
    TextField,
    MenuItem,
    InputAdornment,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Divider,
    LinearProgress,
    Badge,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import RefreshIcon from '@mui/icons-material/Refresh';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import CellTowerIcon from '@mui/icons-material/CellTower';

export interface VehicleStorageItem {
    id: string;
    vehicleCode: string;
    plateNumber: string;
    vehicleType: string;
    lineCode?: string | null;
    isInMaintenance: boolean;
    validatorStatus: 'ONLINE' | 'OFFLINE' | 'UYARI';
    driverName?: string | null; // Operatör panelinden atanabilen sürücü adı
}

export interface RouteStorageItem {
    routeId: string;
    lineCode: string;
    routeName: string;
}

export interface FleetTelemetry {
    id: string;
    vehicleCode: string;
    plateNumber: string;
    lineCode: string;
    lineName: string;
    driverName: string;
    currentSpeed: number;
    status: 'YOLDA' | 'DURAKTA' | 'ROTAR' | 'BAKIMDA';
    lastSignal: string;
    validatorStatus: 'ONLINE' | 'OFFLINE' | 'UYARI';
    fuelLevel: number;
}

const VEHICLES_STORAGE_KEY = 'smart_transit_vehicles_data';
const ROUTES_STORAGE_KEY = 'smart_transit_routes_data';

export const FleetTracking: React.FC = () => {
    const [rawRoutes, setRawRoutes] = useState<RouteStorageItem[]>([]);
    const [fleetData, setFleetData] = useState<FleetTelemetry[]>([]);

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [lineFilter, setLineFilter] = useState<string>('ALL');

    const [isAutoLive, setIsAutoLive] = useState<boolean>(true);
    const [selectedVehicle, setSelectedVehicle] = useState<FleetTelemetry | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);

    const loadFleetData = () => {
        try {
            const savedVehicles: VehicleStorageItem[] = JSON.parse(localStorage.getItem(VEHICLES_STORAGE_KEY) || '[]');
            const savedRoutes: RouteStorageItem[] = JSON.parse(localStorage.getItem(ROUTES_STORAGE_KEY) || '[]');

            setRawRoutes(savedRoutes);

            const generatedFleet: FleetTelemetry[] = savedVehicles.map((v, index) => {
                const route = savedRoutes.find((r) => r.lineCode === v.lineCode);
                const lineName = route ? route.routeName : 'Atanmamış Hat';
                const lineCode = v.lineCode || 'HATSIZ';

                let status: FleetTelemetry['status'] = 'YOLDA';
                let speed = Math.floor(Math.random() * 40) + 20;

                if (v.isInMaintenance) {
                    status = 'BAKIMDA';
                    speed = 0;
                } else if (v.validatorStatus === 'OFFLINE' || v.validatorStatus === 'UYARI') {
                    status = 'ROTAR';
                    speed = Math.floor(Math.random() * 15) + 5;
                } else if (index % 3 === 0) {
                    status = 'DURAKTA';
                    speed = 0;
                }

                return {
                    id: v.id,
                    vehicleCode: v.vehicleCode,
                    plateNumber: v.plateNumber,
                    lineCode,
                    lineName,
                    // Sürücü ismi varsa araç verisinden al, yoksa 'Atanmadı' göster
                    driverName: v.driverName && v.driverName.trim() !== '' ? v.driverName : 'Atanmadı',
                    currentSpeed: speed,
                    status,
                    lastSignal: v.isInMaintenance ? '15 dk önce' : 'Az önce',
                    validatorStatus: v.validatorStatus,
                    fuelLevel: v.isInMaintenance ? 15 : Math.floor(Math.random() * 45) + 55,
                };
            });

            setFleetData(generatedFleet);
        } catch {
            setFleetData([]);
        }
    };

    useEffect(() => {
        loadFleetData();
    }, []);

    useEffect(() => {
        if (!isAutoLive) return;

        const interval = setInterval(() => {
            setFleetData((prev) =>
                prev.map((item) => {
                    if (item.status === 'BAKIMDA') return item;

                    const delta = Math.floor(Math.random() * 11) - 5;
                    const newSpeed = Math.max(0, Math.min(80, item.currentSpeed + delta));

                    let newStatus = item.status;
                    if (newSpeed === 0) newStatus = 'DURAKTA';
                    else if (item.status === 'DURAKTA' && newSpeed > 0) newStatus = 'YOLDA';

                    return {
                        ...item,
                        currentSpeed: newSpeed,
                        status: newStatus,
                        lastSignal: 'Az önce',
                    };
                })
            );
        }, 4000);

        return () => clearInterval(interval);
    }, [isAutoLive]);

    const filteredFleet = useMemo(() => {
        return fleetData.filter((item) => {
            const matchesSearch =
                item.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.vehicleCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.lineCode.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
            const matchesLine = lineFilter === 'ALL' || item.lineCode === lineFilter;

            return matchesSearch && matchesStatus && matchesLine;
        });
    }, [fleetData, searchTerm, statusFilter, lineFilter]);

    const totalCount = fleetData.length;
    const activeCount = fleetData.filter((f) => f.status === 'YOLDA' || f.status === 'DURAKTA').length;
    const delayedCount = fleetData.filter((f) => f.status === 'ROTAR').length;
    const maintenanceCount = fleetData.filter((f) => f.status === 'BAKIMDA').length;

    const getStatusChip = (status: FleetTelemetry['status']) => {
        switch (status) {
            case 'YOLDA':
                return <Chip label="Yolda / Aktif" size="small" color="success" sx={{ fontWeight: 700 }} />;
            case 'DURAKTA':
                return <Chip label="Durakta / Aktif" size="small" color="info" sx={{ fontWeight: 700 }} />;
            case 'ROTAR':
                return <Chip label="Rötar Var" size="small" color="warning" sx={{ fontWeight: 700 }} />;
            case 'BAKIMDA':
                return <Chip label="Bakımda" size="small" color="error" sx={{ fontWeight: 700 }} />;
        }
    };

    return (
        <Box sx={{ width: '100%', p: { xs: 1, md: 2 } }}>
            <Grid container spacing={2.5} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, sm: 3 }}>
                    <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid #e2e8f0' }}>
                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 800 }}>TOPLAM FİLO</Typography>
                        <Typography variant="h4" sx={{ fontWeight: 900, color: '#0f172a', mt: 0.5 }}>{totalCount}</Typography>
                    </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                    <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid #bbf7d0', bgcolor: '#f0fdf4' }}>
                        <Typography variant="caption" sx={{ color: '#16a34a', fontWeight: 800 }}>SEFERDEKİ ARAÇLAR</Typography>
                        <Typography variant="h4" sx={{ fontWeight: 900, color: '#14532d', mt: 0.5 }}>{activeCount}</Typography>
                    </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                    <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid #fde68a', bgcolor: '#fffbeb' }}>
                        <Typography variant="caption" sx={{ color: '#d97706', fontWeight: 800 }}>RÖTARLI ARAÇLAR</Typography>
                        <Typography variant="h4" sx={{ fontWeight: 900, color: '#78350f', mt: 0.5 }}>{delayedCount}</Typography>
                    </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                    <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid #fecaca', bgcolor: '#fef2f2' }}>
                        <Typography variant="caption" sx={{ color: '#dc2626', fontWeight: 800 }}>BAKIMDA / PASİF</Typography>
                        <Typography variant="h4" sx={{ fontWeight: 900, color: '#7f1d1d', mt: 0.5 }}>{maintenanceCount}</Typography>
                    </Paper>
                </Grid>
            </Grid>

            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>Canlı Filo Durumu</Typography>
                        <Typography variant="body2" sx={{ color: '#64748b', mt: 0.3 }}>Sistemdeki araçların anlık konum ve canlı telemetri bilgileri</Typography>
                    </Box>

                    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                        <Button
                            variant={isAutoLive ? 'contained' : 'outlined'}
                            color={isAutoLive ? 'success' : 'inherit'}
                            startIcon={<CellTowerIcon />}
                            onClick={() => setIsAutoLive(!isAutoLive)}
                            sx={{ borderRadius: 2.5, textTransform: 'none', fontWeight: 700 }}
                        >
                            {isAutoLive ? 'Canlı Akış Aktif' : 'Canlı Akış Durduruldu'}
                        </Button>
                        <Tooltip title="Yenile">
                            <IconButton onClick={loadFleetData} sx={{ border: '1px solid #cbd5e1', borderRadius: 2 }}>
                                <RefreshIcon />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                </Box>

                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Plaka, Araç Kodu, Sürücü veya Hat Ara..."
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
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <TextField
                            select
                            fullWidth
                            size="small"
                            label="Durum Filtresi"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                        >
                            <MenuItem value="ALL">Tüm Durumlar</MenuItem>
                            <MenuItem value="YOLDA">Yolda / Aktif</MenuItem>
                            <MenuItem value="DURAKTA">Durakta</MenuItem>
                            <MenuItem value="ROTAR">Rötar Var</MenuItem>
                            <MenuItem value="BAKIMDA">Bakımda</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <TextField
                            select
                            fullWidth
                            size="small"
                            label="Hat Filtresi"
                            value={lineFilter}
                            onChange={(e) => setLineFilter(e.target.value)}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                        >
                            <MenuItem value="ALL">Tüm Hatlar</MenuItem>
                            {rawRoutes.map((r) => (
                                <MenuItem key={r.routeId} value={r.lineCode}>
                                    {r.lineCode} - {r.routeName}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                </Grid>

                <TableContainer sx={{ border: '1px solid #f1f5f9', borderRadius: 3 }}>
                    <Table>
                        <TableHead sx={{ bgcolor: '#f8fafc' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 800 }}>Araç Plaka</TableCell>
                                <TableCell sx={{ fontWeight: 800 }}>Hat</TableCell>
                                <TableCell sx={{ fontWeight: 800 }}>Sürücü</TableCell>
                                <TableCell sx={{ fontWeight: 800 }}>Anlık Hız</TableCell>
                                <TableCell sx={{ fontWeight: 800 }}>Durum</TableCell>
                                <TableCell sx={{ fontWeight: 800 }}>Son Sinyal</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 800 }}>İşlem</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredFleet.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                                        <Typography color="text.secondary">Sistemde kayıtlı canlı araç bulunamadı.</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredFleet.map((row) => (
                                    <TableRow key={row.id} hover>
                                        <TableCell sx={{ fontWeight: 800 }}>
                                            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                                                <Badge variant="dot" color={row.status === 'BAKIMDA' ? 'error' : 'success'}>
                                                    <DirectionsBusIcon sx={{ color: '#475569', fontSize: 20 }} />
                                                </Badge>
                                                <Box>
                                                    <Typography variant="body2" sx={{ fontWeight: 800 }}>{row.plateNumber}</Typography>
                                                    <Typography variant="caption" sx={{ color: '#94a3b8' }}>{row.vehicleCode}</Typography>
                                                </Box>
                                            </Stack>
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>
                                            {row.lineCode !== 'HATSIZ' ? `${row.lineCode} - ${row.lineName}` : 'Atanmadı'}
                                        </TableCell>
                                        <TableCell>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    color: row.driverName === 'Atanmadı' ? '#94a3b8' : '#0f172a',
                                                    fontStyle: row.driverName === 'Atanmadı' ? 'italic' : 'normal',
                                                }}
                                            >
                                                {row.driverName}
                                            </Typography>
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>
                                            {row.status === 'DURAKTA' ? '0 km/s (Durakta)' : `${row.currentSpeed} km/s`}
                                        </TableCell>
                                        <TableCell>{getStatusChip(row.status)}</TableCell>
                                        <TableCell sx={{ color: '#64748b' }}>{row.lastSignal}</TableCell>
                                        <TableCell align="center">
                                            <Tooltip title="Detay Gör">
                                                <IconButton size="small" color="primary" onClick={() => { setSelectedVehicle(row); setIsDetailOpen(true); }}>
                                                    <VisibilityIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            <Dialog open={isDetailOpen} onClose={() => setIsDetailOpen(false)} maxWidth="sm" fullWidth>
                {selectedVehicle && (
                    <>
                        <DialogTitle sx={{ fontWeight: 800 }}>{selectedVehicle.plateNumber} ({selectedVehicle.vehicleCode}) Telemetri</DialogTitle>
                        <Divider />
                        <DialogContent sx={{ pt: 2 }}>
                            <Stack spacing={2}>
                                <Stack direction="row" spacing={2}>
                                    <Paper elevation={0} sx={{ p: 2, flex: 1, bgcolor: '#f8fafc', borderRadius: 2 }}>
                                        <Typography variant="caption" color="text.secondary">ANLIK HIZ</Typography>
                                        <Typography variant="h5" sx={{ fontWeight: 800 }}>{selectedVehicle.currentSpeed} km/s</Typography>
                                    </Paper>
                                    <Paper elevation={0} sx={{ p: 2, flex: 1, bgcolor: '#f8fafc', borderRadius: 2 }}>
                                        <Typography variant="caption" color="text.secondary">SÜRÜCÜ</Typography>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>{selectedVehicle.driverName}</Typography>
                                    </Paper>
                                </Stack>
                                <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
                                    <Typography variant="caption" color="text.secondary">BATARYA / YAKIT (%{selectedVehicle.fuelLevel})</Typography>
                                    <LinearProgress variant="determinate" value={selectedVehicle.fuelLevel} sx={{ mt: 1, height: 8, borderRadius: 4 }} />
                                </Box>
                            </Stack>
                        </DialogContent>
                        <DialogActions sx={{ p: 2 }}>
                            <Button onClick={() => setIsDetailOpen(false)}>Kapat</Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </Box>
    );
};

export default FleetTracking;