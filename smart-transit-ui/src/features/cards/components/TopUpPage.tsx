import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    TextField,
    Paper,
    CircularProgress,
    Alert,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Chip,
    Divider,
} from '@mui/material';
import { CardService, type CardDto, getUserNameFromToken } from '../../../services/cardService';

export const TopUpPage: React.FC = () => {
    const [loading, setLoading] = useState<boolean>(true);
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const [cards, setCards] = useState<CardDto[]>([]);
    const [selectedCardId, setSelectedCardId] = useState<string>('');
    const [amount, setAmount] = useState<number>(100);
    const [userName, setUserName] = useState<string>('');

    const loadCards = async () => {
        setLoading(true);
        setErrorMessage(null);
        try {
            setUserName(getUserNameFromToken());
            const data = await CardService.getUserCards();
            setCards(data);

            if (data.length > 0) {
                setSelectedCardId(data[0].id);
            }
        } catch (err: any) {
            console.error('Kart yükleme hatası:', err);
            setErrorMessage(
                err.response?.data?.message || err.response?.data || 'Kartlar backend sunucusundan çekilemedi.'
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCards();
    }, []);

    const handleTopUp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCardId) {
            setErrorMessage('Lütfen işlem yapılacak kartı seçin.');
            return;
        }
        if (amount <= 0) {
            setErrorMessage('Lütfen geçerli bir bakiye tutarı girin.');
            return;
        }

        setSubmitting(true);
        setErrorMessage(null);
        setSuccessMessage(null);

        try {
            await CardService.topUpBalance(selectedCardId, amount);
            setSuccessMessage(`₺${amount} tutarındaki yükleme başarıyla işlendi.`);
            await loadCards(); // Güncel bakiyeyi tekrar çek
        } catch (err: any) {
            console.error('Bakiye yükleme hatası:', err);
            setErrorMessage(
                err.response?.data?.Message ||
                err.response?.data?.message ||
                'Bakiye yükleme işlemi esnasında bir hata oluştu.'
            );
        } finally {
            setSubmitting(false);
        }
    };

    const selectedCard = cards.find((c) => c.id === selectedCardId);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: 650, mx: 'auto', p: 3 }}>
            <Paper elevation={2} sx={{ p: 4, borderRadius: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                    Bakiye Yükleme
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Kullanıcı: <strong>{userName}</strong>
                </Typography>

                {errorMessage && (
                    <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                        {errorMessage}
                    </Alert>
                )}

                {successMessage && (
                    <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                        {successMessage}
                    </Alert>
                )}

                {cards.length === 0 ? (
                    <Alert severity="warning" sx={{ borderRadius: 2 }}>
                        Sistemde kayıtlı aktif kartınız bulunmamaktadır.
                    </Alert>
                ) : (
                    <form onSubmit={handleTopUp}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            {/* KART SEÇİMİ */}
                            <FormControl fullWidth>
                                <InputLabel id="card-select-label">Yüklenecek Kart</InputLabel>
                                <Select
                                    labelId="card-select-label"
                                    value={selectedCardId}
                                    label="Yüklenecek Kart"
                                    onChange={(e) => setSelectedCardId(e.target.value)}
                                >
                                    {cards.map((card) => (
                                        <MenuItem key={card.id} value={card.id} disabled={card.isBlocked}>
                                            {card.cardName || 'Ulaşım Kartı'} - ({card.cardNumber || card.id})
                                            {card.isBlocked ? ' [BLOKE]' : ''}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            {/* SEÇİLİ KART BİLGİSİ */}
                            {selectedCard && (
                                <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="body2" color="text.secondary">
                                            Mevcut Bakiye:
                                        </Typography>
                                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a' }}>
                                            ₺{selectedCard.balance.toFixed(2)}
                                        </Typography>
                                    </Box>
                                    <Divider sx={{ my: 1 }} />
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="body2" color="text.secondary">
                                            Yükleme Sonrası Bakiye:
                                        </Typography>
                                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#16a34a' }}>
                                            ₺{(selectedCard.balance + (Number(amount) || 0)).toFixed(2)}
                                        </Typography>
                                    </Box>
                                </Paper>
                            )}

                            {/* TUTAR SEÇENEKLERİ */}
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                {[50, 100, 200, 500].map((preset) => (
                                    <Chip
                                        key={preset}
                                        label={`₺${preset}`}
                                        clickable
                                        color={amount === preset ? 'primary' : 'default'}
                                        onClick={() => setAmount(preset)}
                                        sx={{ fontWeight: 700, px: 1 }}
                                    />
                                ))}
                            </Box>

                            {/* TUTAR GİRDİSİ */}
                            <TextField
                                label="Yüklenecek Tutar (₺)"
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(Number(e.target.value))}
                                fullWidth
                                slotProps={{
                                    htmlInput: { min: 1, step: 'any' }
                                }}
                            />

                            {/* GÖNDER BUTONU */}
                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                disabled={submitting || !selectedCardId || selectedCard?.isBlocked}
                                sx={{ py: 1.5, fontWeight: 700, textTransform: 'none', fontSize: '1rem' }}
                            >
                                {submitting ? <CircularProgress size={24} color="inherit" /> : 'Bakiyeyi Onayla ve Yükle'}
                            </Button>
                        </Box>
                    </form>
                )}
            </Paper>
        </Box>
    );
};

export default TopUpPage;