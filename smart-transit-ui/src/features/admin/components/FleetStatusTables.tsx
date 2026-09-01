import React, { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    IconButton,
    Tooltip,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import MoreVertIcon from '@mui/icons-material/MoreVert';

export interface VehicleStorageItem {
    id: string;
    vehicleCode: string;
    plateNumber: string;
    vehicleType: string;
    lineCode?: string | null;
    isInMaintenance: boolean;
    validatorStatus: 'ONLINE' | 'OFFLINE' | 'UYARI';
}

export interface RouteStorageItem {
    routeId: string;
    lineCode: string;
    routeName: string;
}

export interface FleetItem {
    id: string;
    plateNumber: string;
    routeName: string;
    driverName: string;
    speed: string;
    status: 'active' | 'delayed' | 'maintenance' | 'offline';
    lastSignal: string;
}

const VEHICLES_STORAGE_KEY = 'smart_transit_vehicles_data';
const ROUTES_STORAGE_KEY = 'smart_transit_routes_data';

const DRIVER_POOL = [
    'Ahmet Yılmaz',
    'Mehmet Demir',
    'Ali Kaya',
    'Ayşe Şahin',
    'Mustafa Öztürk',
    'Canan Yıldız',
    'Emre Çelik',
    'Fatma Aydın'
];

const statusConfig = {
    active: { label: 'Yolda / Aktif', color: 'success' as const },
    delayed: { label: 'Rötar Var', color: 'warning' as const },
    maintenance: { label: 'Bakımda', color: 'error' as const },
    offline: { label: 'Sinyal Yok', color: 'default' as const },
};

export const FleetStatusTable: React.FC = () => {
    const [fleetData, setFleetData] = useState<FleetItem[]>([]);

    useEffect(() => {
        loadFleetFromStorage();
    }, []);

    const loadFleetFromStorage = () => {
        try {
            const savedVehicles: VehicleStorageItem[] = JSON.parse(
                localStorage.getItem(VEHICLES_STORAGE_KEY) || '[]'
            );
            const savedRoutes: RouteStorageItem[] = JSON.parse(
                localStorage.getItem(ROUTES_STORAGE_KEY) || '[]'
            );

            const dynamicFleet: FleetItem[] = savedVehicles.map((vehicle, index) => {
                const matchedRoute = savedRoutes.find(
                    (r) => r.lineCode === vehicle.lineCode
                );

                let routeName = 'Atanmadı (Boşta)';
                if (matchedRoute) {
                    routeName = `${matchedRoute.lineCode} - ${matchedRoute.routeName}`;
                } else if (vehicle.lineCode) {
                    routeName = `${vehicle.lineCode} Hattı`;
                }

                let status: FleetItem['status'] = 'active';
                let speed = '42 km/s';
                let lastSignal = 'Az önce';

                if (vehicle.isInMaintenance) {
                    status = 'maintenance';
                    speed = '0 km/s';
                    lastSignal = '15 dk önce';
                } else if (vehicle.validatorStatus === 'OFFLINE') {
                    status = 'offline';
                    speed = '0 km/s (Sinyal Yok)';
                    lastSignal = '25 dk önce';
                } else if (vehicle.validatorStatus === 'UYARI') {
                    status = 'delayed';
                    speed = '14 km/s';
                    lastSignal = '3 dk önce';
                } else if (index % 3 === 0) {
                    speed = '0 km/s (Durakta)';
                    lastSignal = '1 dk önce';
                }

                const driverName = vehicle.isInMaintenance
                    ? 'Sürücü Atanmadı'
                    : DRIVER_POOL[index % DRIVER_POOL.length];

                return {
                    id: vehicle.id,
                    plateNumber: vehicle.plateNumber,
                    routeName,
                    driverName,
                    speed,
                    status,
                    lastSignal,
                };
            });

            setFleetData(dynamicFleet);
        } catch {
            setFleetData([]);
        }
    };

    return (
        <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.04)', mb: 4 }}>
            <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            Canlı Filo Durumu
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Sistemdeki araçların anlık konum ve durum bilgileri
                        </Typography>
                    </Box>
                    <IconButton color="default" onClick={loadFleetFromStorage}>
                        <MoreVertIcon color="action" />
                    </IconButton>
                </Box>

                <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid rgba(0,0,0,0.08)', borderRadius: 2 }}>
                    <Table sx={{ minWidth: 650 }} aria-label="filo tablosu">
                        <TableHead sx={{ bgcolor: 'grey.50' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 600 }}>Araç Plaka</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Hat</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Sürücü</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Anlık Hız</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Durum</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Son Sinyal</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 600 }}>İşlem</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {fleetData.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                                        <Typography color="text.secondary">
                                            Sistemde kayıtlı araç bulunamadı. Lütfen Araç Filo Yönetimi panelinden araç ekleyin.
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                fleetData.map((row) => {
                                    const config = statusConfig[row.status];
                                    return (
                                        <TableRow key={row.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                            <TableCell sx={{ fontWeight: 600 }}>{row.plateNumber}</TableCell>
                                            <TableCell>{row.routeName}</TableCell>
                                            <TableCell>{row.driverName}</TableCell>
                                            <TableCell>{row.speed}</TableCell>
                                            <TableCell>
                                                <Chip label={config.label} color={config.color} size="small" sx={{ fontWeight: 600 }} />
                                            </TableCell>
                                            <TableCell sx={{ color: 'text.secondary' }}>{row.lastSignal}</TableCell>
                                            <TableCell align="right">
                                                <Tooltip title="Haritada Göster / Detay">
                                                    <IconButton size="small" color="primary">
                                                        <VisibilityIcon fontSize="small" />
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
            </CardContent>
        </Card>
    );
};

export default FleetStatusTable;