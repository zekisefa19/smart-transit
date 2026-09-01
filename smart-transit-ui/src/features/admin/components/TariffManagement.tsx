import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Button,
    Stack,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Divider,
    Alert,
    InputAdornment,
    IconButton,
    Tooltip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import LockIcon from '@mui/icons-material/Lock';

export interface CardTariffItem {
    id: string;
    name: string;
    subtitle: string;
    singleFare: number;       // İlk Biniş Ücreti
    transferFare: number;     // 1. Aktarma Ücreti (%67.7)
    subscriptionPrice: number; // Aylık Abonman Paketi
    isFree: boolean;          // Ücretsiz kart mı?
    freeBadge?: string;
}

export interface TariffSystemState {
    serviceFee: number; // Abonman Hizmet Bedeli
    cards: CardTariffItem[];
}

// Önbellek çakışmasını önlemek için v2 anahtarı
export const TARIFFS_STORAGE_KEY = 'smart_transit_tariffs_v2';

// Backend Kademeli Aktarma Oranları
export const TRANSFER_RATES = {
    FIRST: 0.677,  // 1. Aktarma %67.7
    SECOND: 0.520, // 2. Aktarma %52.0
    THIRD: 0.170,  // 3.+ Aktarma %17.0
};

// Güncel Fiyatlar ve Kademeli Aktarma Verileri
export const DEFAULT_TARIFFS: TariffSystemState = {
    serviceFee: 8,
    cards: [
        {
            id: 'tam',
            name: '1. Tam İstanbulkart',
            subtitle: 'Standart Kullanıcı (CardType: 1)',
            singleFare: 46.20,
            transferFare: 31.28, // %67.7 (1. Aktarma)
            subscriptionPrice: 3628.00,
            isFree: false,
        },
        {
            id: 'ogrenci',
            name: '2. Öğrenci Kartı',
            subtitle: 'İlkokul, Lise, Üniversite (CardType: 2)',
            singleFare: 22.55,
            transferFare: 15.27, // %67.7 (1. Aktarma)
            subscriptionPrice: 653.00,
            isFree: false,
        },
        {
            id: 'sosyal',
            name: '3. Sosyal / İndirimli',
            subtitle: 'Öğretmen, 60+ Yaş (CardType: 4)',
            singleFare: 33.08,
            transferFare: 22.40, // %67.7 (1. Aktarma)
            subscriptionPrice: 1739.00,
            isFree: false,
        },
        {
            id: 'engelli',
            name: '4. Engelli Kartı',
            subtitle: '%40+ Sağlık Raporu (CardType: 3)',
            singleFare: 0.00,
            transferFare: 0.00,
            subscriptionPrice: 0,
            isFree: true,
            freeBadge: '%100 İNDİRİMLİ / ÜCRETSİZ',
        },
        {
            id: 'anne',
            name: '5. Anne Kartı',
            subtitle: '0-4 Yaş Çocuk Sahibi Anneler (CardType: 5)',
            singleFare: 0.00,
            transferFare: 0.00,
            subscriptionPrice: 0,
            isFree: true,
            freeBadge: 'AYLIK 150 ÜCRETSİZ KOTA',
        },
        {
            id: '65yasi',
            name: '6. +65 Yaş Kartı',
            subtitle: '65 Yaş ve Üzeri Vatandaşlar (CardType: 6)',
            singleFare: 0.00,
            transferFare: 0.00,
            subscriptionPrice: 0,
            isFree: true,
            freeBadge: 'SINIRSIZ ÜCRETSİZ KULLANIM',
        },
    ],
};

export const TariffManagement: React.FC = () => {
    const [tariffData, setTariffData] = useState<TariffSystemState>(() => {
        try {
            const saved = localStorage.getItem(TARIFFS_STORAGE_KEY);
            return saved ? JSON.parse(saved) : DEFAULT_TARIFFS;
        } catch {
            return DEFAULT_TARIFFS;
        }
    });

    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [percentageRate, setPercentageRate] = useState<string>('10');
    const [rateType, setRateType] = useState<'HIKE' | 'DISCOUNT'>('HIKE');

    const [selectedCard, setSelectedCard] = useState<CardTariffItem | null>(null);
    const [editSingleFare, setEditSingleFare] = useState<number>(0);
    const [editTransferFare, setEditTransferFare] = useState<number>(0);
    const [editSubPrice, setEditSubPrice] = useState<number>(0);

    const [editServiceFee, setEditServiceFee] = useState<number>(tariffData.serviceFee);

    useEffect(() => {
        localStorage.setItem(TARIFFS_STORAGE_KEY, JSON.stringify(tariffData));
    }, [tariffData]);

    const handleSingleFareChange = (val: number) => {
        setEditSingleFare(val);
        setEditTransferFare(Number((val * TRANSFER_RATES.FIRST).toFixed(2)));
    };

    const handleApplyBulkRate = () => {
        const rate = parseFloat(percentageRate);
        if (isNaN(rate) || rate <= 0) return;

        const multiplier = rateType === 'HIKE' ? (1 + rate / 100) : (1 - rate / 100);

        setTariffData((prev) => ({
            ...prev,
            cards: prev.cards.map((card) => {
                if (card.isFree) return card;
                const newSingle = Number((card.singleFare * multiplier).toFixed(2));
                return {
                    ...card,
                    singleFare: newSingle,
                    transferFare: Number((newSingle * TRANSFER_RATES.FIRST).toFixed(2)),
                    subscriptionPrice: Number((card.subscriptionPrice * multiplier).toFixed(2)),
                };
            }),
        }));

        setIsBulkModalOpen(false);
    };

    const handleSaveCardEdit = () => {
        if (!selectedCard) return;

        setTariffData((prev) => ({
            ...prev,
            cards: prev.cards.map((card) =>
                card.id === selectedCard.id
                    ? {
                        ...card,
                        singleFare: editSingleFare,
                        transferFare: editTransferFare,
                        subscriptionPrice: editSubPrice,
                    }
                    : card
            ),
        }));

        setSelectedCard(null);
    };

    const handleSaveGlobalFees = () => {
        setTariffData((prev) => ({
            ...prev,
            serviceFee: editServiceFee,
        }));
    };

    return (
        <Box sx={{ width: '100%', p: { xs: 1, md: 2 } }}>
            {/* Üst Bilgi Kartı */}
            <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 4, bgcolor: '#0f172a', color: '#ffffff' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: 800 }}>Ulaşım Tarife ve Ücret Yönetimi</Typography>
                        <Typography variant="body2" sx={{ color: '#94a3b8', mt: 0.5 }}>
                            Şehir içi toplu taşıma biniş, kademeli aktarma (%67.7 / %52.0 / %17.0) ve abonman ücretleri.
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        color="warning"
                        startIcon={<TrendingUpIcon />}
                        onClick={() => setIsBulkModalOpen(true)}
                        sx={{ borderRadius: 3, fontWeight: 800, textTransform: 'none', px: 2.5, py: 1 }}
                    >
                        Toplu Zam / İndirim Uygula
                    </Button>
                </Box>
            </Paper>

            {/* Abonman Hizmet Bedeli Kartı */}
            <Paper elevation={0} sx={{ p: 2.5, mb: 3, borderRadius: 3, border: '1px solid #e2e8f0' }}>
                <Stack direction="row" spacing={2} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 800 }}>ABONMAN HİZMET BEDELİ (SABİT)</Typography>
                        <Typography variant="h5" sx={{ fontWeight: 900, color: '#0f172a', mt: 0.5 }}>
                            ₺{tariffData.serviceFee.toFixed(2)}
                        </Typography>
                    </Box>
                    <Stack direction="row" spacing={1}>
                        <TextField
                            size="small"
                            type="number"
                            label="Yeni Bedel (₺)"
                            sx={{ width: 140 }}
                            value={editServiceFee}
                            onChange={(e) => setEditServiceFee(Number(e.target.value))}
                        />
                        <Button variant="contained" size="small" onClick={handleSaveGlobalFees} sx={{ borderRadius: 2 }}>
                            Kaydet
                        </Button>
                    </Stack>
                </Stack>
            </Paper>

            {/* Tarife Tablosu */}
            <Paper elevation={0} sx={{ borderRadius: 4, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <Box sx={{ p: 2.5, bgcolor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>Aktif Kart Tarifleri</Typography>
                </Box>
                <TableContainer>
                    <Table>
                        <TableHead sx={{ bgcolor: '#ffffff' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 800 }}>Kart Tipi</TableCell>
                                <TableCell sx={{ fontWeight: 800 }}>İlk Biniş Ücreti</TableCell>
                                <TableCell sx={{ fontWeight: 800 }}>Kademeli Aktarmalar (1. / 2. / 3.+)</TableCell>
                                <TableCell sx={{ fontWeight: 800 }}>Aylık Abonman (200 Basım)</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 800 }}>İşlem</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {tariffData.cards.map((card) => {
                                const transfer1 = card.transferFare;
                                const transfer2 = (card.singleFare * TRANSFER_RATES.SECOND).toFixed(2);
                                const transfer3 = (card.singleFare * TRANSFER_RATES.THIRD).toFixed(2);

                                return (
                                    <TableRow key={card.id} hover>
                                        <TableCell>
                                            <Typography variant="body2" sx={{ fontWeight: 800 }}>{card.name}</Typography>
                                            <Typography variant="caption" sx={{ color: '#64748b' }}>{card.subtitle}</Typography>
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>
                                            {card.isFree ? <Chip label="Ücretsiz" color="success" size="small" /> : `₺${card.singleFare.toFixed(2)}`}
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>
                                            {card.isFree ? (
                                                <Chip label="Ücretsiz" color="success" size="small" />
                                            ) : (
                                                <Stack spacing={0.3}>
                                                    <Typography variant="body2" sx={{ fontWeight: 800, color: '#0f172a' }}>
                                                        1. Aktarma (%67.7): ₺{transfer1.toFixed(2)}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                                                        2. Aktarma (%52): ₺{transfer2} | 3.+: ₺{transfer3}
                                                    </Typography>
                                                </Stack>
                                            )}
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 800, color: card.isFree ? '#16a34a' : '#2563eb' }}>
                                            {card.isFree ? (
                                                <Chip label={card.freeBadge} size="small" sx={{ bgcolor: '#f0fdf4', color: '#16a34a', fontWeight: 800 }} />
                                            ) : (
                                                `₺${card.subscriptionPrice.toFixed(2)} (+₺${tariffData.serviceFee} Hizmet)`
                                            )}
                                        </TableCell>
                                        <TableCell align="center">
                                            {card.isFree ? (
                                                <Tooltip title="Ücretsiz kart tarifesi değiştirilemez">
                                                    <LockIcon fontSize="small" sx={{ color: '#cbd5e1' }} />
                                                </Tooltip>
                                            ) : (
                                                <IconButton
                                                    color="primary"
                                                    onClick={() => {
                                                        setSelectedCard(card);
                                                        setEditSingleFare(card.singleFare);
                                                        setEditTransferFare(card.transferFare);
                                                        setEditSubPrice(card.subscriptionPrice);
                                                    }}
                                                >
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* TOPLU ZAM / İNDİRİM MODALI */}
            <Dialog open={isBulkModalOpen} onClose={() => setIsBulkModalOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ fontWeight: 800 }}>Toplu Fiyat Güncelleme</DialogTitle>
                <Divider />
                <DialogContent sx={{ pt: 2 }}>
                    <Stack spacing={2.5}>
                        <Alert severity="info" sx={{ borderRadius: 2 }}>
                            Ücretsiz kartlar etkilenmez. Aktarma ücretleri biniş ücretine bağlı olarak otomatize şekilde güncellenir.
                        </Alert>
                        <Stack direction="row" spacing={1}>
                            <Button
                                fullWidth
                                variant={rateType === 'HIKE' ? 'contained' : 'outlined'}
                                color="error"
                                onClick={() => setRateType('HIKE')}
                                sx={{ borderRadius: 2, fontWeight: 700 }}
                            >
                                Zam Yap (+%)
                            </Button>
                            <Button
                                fullWidth
                                variant={rateType === 'DISCOUNT' ? 'contained' : 'outlined'}
                                color="success"
                                onClick={() => setRateType('DISCOUNT')}
                                sx={{ borderRadius: 2, fontWeight: 700 }}
                            >
                                İndirim Yap (-%)
                            </Button>
                        </Stack>

                        <TextField
                            fullWidth
                            label="Yüzde Oranı (%)"
                            type="number"
                            value={percentageRate}
                            onChange={(e) => setPercentageRate(e.target.value)}
                            slotProps={{
                                input: {
                                    startAdornment: <InputAdornment position="start">%</InputAdornment>,
                                },
                            }}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setIsBulkModalOpen(false)}>İptal</Button>
                    <Button variant="contained" color="warning" onClick={handleApplyBulkRate} sx={{ fontWeight: 800 }}>
                        Uygula ve Güncelle
                    </Button>
                </DialogActions>
            </Dialog>

            {/* TEKİL KART DÜZENLEME MODALI */}
            <Dialog open={Boolean(selectedCard)} onClose={() => setSelectedCard(null)} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ fontWeight: 800 }}>{selectedCard?.name} Tarifesi</DialogTitle>
                <Divider />
                <DialogContent sx={{ pt: 2 }}>
                    <Stack spacing={2}>
                        <TextField
                            label="İlk Biniş Ücreti (₺)"
                            type="number"
                            value={editSingleFare}
                            onChange={(e) => handleSingleFareChange(Number(e.target.value))}
                        />
                        <TextField
                            label="1. Aktarma Ücreti (%67.7) (₺)"
                            type="number"
                            value={editTransferFare}
                            onChange={(e) => setEditTransferFare(Number(e.target.value))}
                        />
                        <TextField
                            label="Aylık Abonman Paket Ücreti (₺)"
                            type="number"
                            value={editSubPrice}
                            onChange={(e) => setEditSubPrice(Number(e.target.value))}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setSelectedCard(null)}>İptal</Button>
                    <Button variant="contained" onClick={handleSaveCardEdit} sx={{ fontWeight: 800 }}>Kaydet</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default TariffManagement;