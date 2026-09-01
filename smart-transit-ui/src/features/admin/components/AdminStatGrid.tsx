// src/features/admin/components/AdminStatGrid.tsx
import React from 'react';
import { Grid, Card, CardContent, Typography, Avatar, Box } from '@mui/material';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PeopleIcon from '@mui/icons-material/People';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

// Prop arayüzünü Dashboard'dan gelen değerlere göre tanımlıyoruz
export interface AdminStatsGridProps {
    totalRevenue: number;
    totalPassengers: number;
    pendingApplications: number;
    suspiciousCount: number;
}

export const AdminStatsGrid: React.FC<AdminStatsGridProps> = ({
    totalRevenue,
    totalPassengers,
    pendingApplications,
    suspiciousCount,
}) => {
    return (
        <Grid container spacing={2.5}>
            {/* Toplam Ciro */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3 }}>
                    <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                                TOPLAM CİRO
                            </Typography>
                            <Typography variant="h5" sx={{ fontWeight: 900, mt: 0.5 }}>
                                ₺{totalRevenue.toLocaleString('tr-TR')}
                            </Typography>
                        </Box>
                        <Avatar sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', width: 44, height: 44 }}>
                            <AttachMoneyIcon />
                        </Avatar>
                    </CardContent>
                </Card>
            </Grid>

            {/* Toplam Yolcu */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3 }}>
                    <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                                TOPLAM YOLCU
                            </Typography>
                            <Typography variant="h5" sx={{ fontWeight: 900, mt: 0.5 }}>
                                {totalPassengers.toLocaleString('tr-TR')}
                            </Typography>
                        </Box>
                        <Avatar sx={{ bgcolor: '#e3f2fd', color: '#1976d2', width: 44, height: 44 }}>
                            <PeopleIcon />
                        </Avatar>
                    </CardContent>
                </Card>
            </Grid>

            {/* Bekleyen Başvuru */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3 }}>
                    <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                                BEKLEYEN BAŞVURU
                            </Typography>
                            <Typography variant="h5" sx={{ fontWeight: 900, mt: 0.5, color: '#d97706' }}>
                                {pendingApplications}
                            </Typography>
                        </Box>
                        <Avatar sx={{ bgcolor: '#fff3e0', color: '#ed6c02', width: 44, height: 44 }}>
                            <CreditCardIcon />
                        </Avatar>
                    </CardContent>
                </Card>
            </Grid>

            {/* Şüpheli İşlemler */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card elevation={0} sx={{ border: '1px solid #fecdd3', bgcolor: '#fff1f2', borderRadius: 3 }}>
                    <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                            <Typography variant="caption" color="error.main" sx={{ fontWeight: 700 }}>
                                ŞÜPHELİ İŞLEMLER
                            </Typography>
                            <Typography variant="h5" color="error.main" sx={{ fontWeight: 900, mt: 0.5 }}>
                                {suspiciousCount} Uyarı
                            </Typography>
                        </Box>
                        <Avatar sx={{ bgcolor: '#ffebee', color: '#d32f2f', width: 44, height: 44 }}>
                            <WarningAmberIcon />
                        </Avatar>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );
};

export default AdminStatsGrid;