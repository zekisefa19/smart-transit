import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Card, CardContent, CircularProgress, Alert, Grid
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

import { getOperatorDashboard, type OperatorDashboardDto } from '../../../services/adminService';

const VEHICLES_STORAGE_KEY = 'smart_transit_vehicles_data';

export const OverviewDashboard: React.FC = () => {
    const [dashboardData, setDashboardData] = useState<OperatorDashboardDto | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Operatör panelinin localStorage'a kaydettiği araç verilerini okuma
    const getLocalVehicleStats = () => {
        try {
            const saved = localStorage.getItem(VEHICLES_STORAGE_KEY);
            if (saved) {
                const list = JSON.parse(saved);
                if (Array.isArray(list) && list.length > 0) {
                    const activeCount = list.filter((v: { isInMaintenance?: boolean }) => !v.isInMaintenance).length;
                    return {
                        totalVehicles: list.length,
                        activeVehicles: activeCount
                    };
                }
            }
        } catch (e) {
            console.error('LocalStorage araç verileri okunamadı:', e);
        }
        return null;
    };

    const localVehicleStats = getLocalVehicleStats();

    const activeVehiclesDisplay = localVehicleStats
        ? localVehicleStats.activeVehicles
        : (dashboardData?.activeVehicleCount ?? 0);

    const totalVehiclesDisplay = localVehicleStats
        ? localVehicleStats.totalVehicles
        : dashboardData?.totalVehicleCount;

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const data = await getOperatorDashboard();
                setDashboardData(data);
            } catch (err) {
                console.error('Dashboard verisi yüklenemedi:', err);
                setError('Dashboard verileri alınırken bir hata oluştu.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }

    return (
        <Box sx={{ p: 2 }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a' }}>
                    Genel Bakış
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Bugünkü operasyonel performans ve sistem durumu.
                </Typography>
            </Box>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* 1. Toplam Yolcu */}
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card variant="outlined" sx={{ borderRadius: 3 }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                                    Toplam Yolcu (Bugün)
                                </Typography>
                                <PeopleIcon sx={{ color: '#2563eb' }} />
                            </Box>
                            <Typography variant="h3" sx={{ fontWeight: 800, color: '#0f172a' }}>
                                {dashboardData?.todayPassCount ?? 0}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* 2. Aktif Araçlar */}
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card variant="outlined" sx={{ borderRadius: 3 }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                                    Aktif Araçlar
                                </Typography>
                                <DirectionsBusIcon sx={{ color: '#2563eb' }} />
                            </Box>
                            <Typography variant="h3" sx={{ fontWeight: 800, color: '#0f172a' }}>
                                {activeVehiclesDisplay}
                            </Typography>
                            {totalVehiclesDisplay !== undefined && (
                                <Typography variant="caption" color="text.secondary">
                                    Sistemdeki {totalVehiclesDisplay} araçtan
                                </Typography>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* 3. Günlük Gelir */}
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card variant="outlined" sx={{ borderRadius: 3 }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                                    Günlük Gelir
                                </Typography>
                                <AccountBalanceWalletIcon sx={{ color: '#2563eb' }} />
                            </Box>
                            <Typography variant="h3" sx={{ fontWeight: 800, color: '#0f172a' }}>
                                ₺{dashboardData?.todayTotalRevenue ? dashboardData.todayTotalRevenue.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0,00'}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* 4. Sistem Uyarıları */}
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card variant="outlined" sx={{ borderRadius: 3, bgcolor: '#fef2f2', borderColor: '#fecaca' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Typography variant="caption" sx={{ color: '#dc2626', fontWeight: 600 }}>
                                    Sistem Uyarıları
                                </Typography>
                                <WarningAmberIcon sx={{ color: '#dc2626' }} />
                            </Box>
                            <Typography variant="h3" sx={{ fontWeight: 800, color: '#dc2626' }}>
                                {dashboardData?.suspiciousTransactionCount ?? 0}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Grafikler */}
            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 8 }}>
                    <Card variant="outlined" sx={{ borderRadius: 3, p: 2 }}>
                        <Typography variant="h6" align="center" sx={{ fontWeight: 700, mb: 3 }}>
                            Yolcu Yoğunluğu (Saatlik)
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', height: 200, pt: 2 }}>
                            {dashboardData?.hourlyActivities?.map((item, index) => {
                                const maxVal = Math.max(...(dashboardData.hourlyActivities.map(h => h.passengerCount) || [1]), 1);
                                const heightPercent = (item.passengerCount / maxVal) * 80; // Max %80 yükseklik

                                return (
                                    <Box
                                        key={index}
                                        sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            width: '12%',
                                            height: '100%',            // Düzeltme: Kapsayıcıya tam yükseklik verildi
                                            justifyContent: 'flex-end'  // Düzeltme: Çubuklar tabana hizalandı
                                        }}
                                    >
                                        {/* Yolcu sayısı varsa mavi, yoksa açık gri gösterilir */}
                                        <Box
                                            sx={{
                                                width: '100%',
                                                height: `${Math.max(heightPercent, 6)}%`,
                                                bgcolor: item.passengerCount > 0 ? '#2563eb' : '#e2e8f0',
                                                borderRadius: 1,
                                                transition: 'height 0.3s ease'
                                            }}
                                        />
                                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, fontSize: '0.7rem', fontWeight: 600 }}>
                                            {item.hour}
                                        </Typography>
                                    </Box>
                                );
                            })}
                        </Box>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                    <Card variant="outlined" sx={{ borderRadius: 3, p: 2, height: '100%' }}>
                        <Typography variant="h6" align="center" sx={{ fontWeight: 700, mb: 3 }}>
                            Aktif Uyarılar
                        </Typography>
                        <Box sx={{ border: '1px dashed #cbd5e1', borderRadius: 2, p: 4, textAlign: 'center', color: 'text.secondary', minHeight: 150, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Typography variant="body2">
                                {dashboardData?.suspiciousTransactionCount ? `${dashboardData.suspiciousTransactionCount} adet şüpheli işlem tespit edildi.` : 'Şu an için aktif uyarı bulunmamaktadır.'}
                            </Typography>
                        </Box>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default OverviewDashboard;