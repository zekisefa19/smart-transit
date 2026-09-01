import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Box,
    Typography,
    Paper,
    Button,
    Grid
} from '@mui/material';

// İkonlar
import DashboardIcon from '@mui/icons-material/Dashboard';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PeopleIcon from '@mui/icons-material/People';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import RefreshIcon from '@mui/icons-material/Refresh';
import AttachMoneyOutlinedIcon from '@mui/icons-material/AttachMoneyOutlined';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import CreditCardOutlinedIcon from '@mui/icons-material/CreditCardOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';

// Birleştirilmiş Tarife Yönetim Bileşeni
import { TariffManagement } from './TariffManagement';
import { FleetStatusTable } from './FleetStatusTables';

type TabType = 'overview' | 'fare' | 'operator' | 'assistant' | 'fleet';

export const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // URL Senkronizasyonu
    const getActiveTab = (): TabType => {
        const path = location.pathname;
        if (path.includes('/tariffs') || path.includes('/tarife') || path.includes('/fare')) return 'fare';
        if (path.includes('/operators') || path.includes('/operator')) return 'operator';
        if (path.includes('/assistant') || path.includes('/asistan')) return 'assistant';
        if (path.includes('/fleet') || path.includes('/filo')) return 'fleet';
        return 'overview';
    };

    const activeTab = getActiveTab();

    const menuItems = [
        { id: 'overview' as TabType, label: 'Genel Bakış', path: '/admin/dashboard', icon: <DashboardIcon /> },
        { id: 'fare' as TabType, label: 'Tarife Yönetimi', path: '/admin/tariffs', icon: <AttachMoneyIcon /> },
        { id: 'operator' as TabType, label: 'Operatör Yönetimi', path: '/admin/operators', icon: <PeopleIcon /> },
        { id: 'assistant' as TabType, label: 'Akıllı Asistan', path: '/admin/assistant', icon: <AutoAwesomeIcon /> },
        { id: 'fleet' as TabType, label: 'Filo Takibi', path: '/admin/fleet', icon: <DirectionsBusIcon /> }
    ];

    return (
        <Box sx={{ p: 3, width: '100%', minHeight: '100vh', bgcolor: '#f8fafc' }}>
            {/* Üst Ana Menü Barı */}
            <Paper elevation={0} sx={{ p: 1, mb: 3, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {menuItems.map((tab) => (
                        <Button
                            key={tab.id}
                            onClick={() => navigate(tab.path)}
                            startIcon={tab.icon}
                            sx={{
                                borderRadius: 2,
                                px: 2.5,
                                py: 1,
                                textTransform: 'none',
                                fontWeight: 700,
                                bgcolor: activeTab === tab.id ? '#e6f4ff' : 'transparent',
                                color: activeTab === tab.id ? '#0958d9' : '#64748b',
                                '&:hover': { bgcolor: activeTab === tab.id ? '#bae0ff' : '#f8fafc' }
                            }}
                        >
                            {tab.label}
                        </Button>
                    ))}
                </Box>
            </Paper>

            {/* 1. GENEL BAKIŞ SEKMESİ */}
            {activeTab === 'overview' && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid #e2e8f0', bgcolor: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>
                                Yönetici Kontrol Paneli
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
                                Canlı filo akışı, tarifeler, operatör yönetimi ve yapay zeka analizleri
                            </Typography>
                        </Box>
                        <Button
                            variant="contained"
                            startIcon={<RefreshIcon />}
                            sx={{ borderRadius: 2.5, bgcolor: '#0f172a', textTransform: 'none', fontWeight: 700, '&:hover': { bgcolor: '#1e293b' } }}
                        >
                            Verileri Yenile
                        </Button>
                    </Paper>

                    {/* İstatistik Kartları */}
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
                                <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>TOPLAM CİRO</Typography>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                                    <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>₺0</Typography>
                                    <Box sx={{ p: 1, borderRadius: 2, bgcolor: '#dc262615', color: '#dc2626' }}><AttachMoneyOutlinedIcon /></Box>
                                </Box>
                            </Paper>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
                                <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>TOPLAM YOLCU</Typography>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                                    <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>0</Typography>
                                    <Box sx={{ p: 1, borderRadius: 2, bgcolor: '#2563eb15', color: '#2563eb' }}><GroupOutlinedIcon /></Box>
                                </Box>
                            </Paper>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
                                <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>BEKLEYEN BAŞVURU</Typography>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                                    <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>0</Typography>
                                    <Box sx={{ p: 1, borderRadius: 2, bgcolor: '#d9770615', color: '#d97706' }}><CreditCardOutlinedIcon /></Box>
                                </Box>
                            </Paper>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid #fecaca', bgcolor: '#fef2f2' }}>
                                <Typography variant="caption" sx={{ fontWeight: 700, color: '#991b1b', textTransform: 'uppercase' }}>ŞÜPHELİ İŞLEMLER</Typography>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                                    <Typography variant="h5" sx={{ fontWeight: 800, color: '#991b1b' }}>0 Uyarı</Typography>
                                    <Box sx={{ p: 1, borderRadius: 2, bgcolor: '#dc262620', color: '#dc2626' }}><WarningAmberOutlinedIcon /></Box>
                                </Box>
                            </Paper>
                        </Grid>
                    </Grid>

                    <FleetStatusTable />
                </Box>
            )}

            {/* 2. TARİFE YÖNETİMİ SEKMESİ */}
            {activeTab === 'fare' && <TariffManagement />}

            {/* 3. OPERATÖR YÖNETİMİ SEKMESİ */}
            {activeTab === 'operator' && (
                <Paper sx={{ p: 4, borderRadius: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>Operatör Yönetimi Ekranı</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Operatörlerin listesi ve izin yönetimi bu ekranda yer alacak.
                    </Typography>
                </Paper>
            )}

            {/* 4. AKILLI ASİSTAN SEKMESİ */}
            {activeTab === 'assistant' && (
                <Paper sx={{ p: 4, borderRadius: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>Akıllı Asistan & Anomaliler</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Yapay zeka tahmin modeli ve hat yoğunluk analizleri bu ekranda yer alacak.
                    </Typography>
                </Paper>
            )}

            {/* 5. FİLO TAKİBİ SEKMESİ */}
            {activeTab === 'fleet' && <FleetStatusTable />}
        </Box>
    );
};

export default AdminDashboard;