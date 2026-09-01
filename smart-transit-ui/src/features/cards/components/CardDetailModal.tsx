import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Pagination,
    Box,
    CircularProgress,
    Chip,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { getCardTransactionsApi } from '../api/cardsApi';

interface CardDetailModalProps {
    open: boolean;
    cardId: string | null;
    onClose: () => void;
}

export const CardDetailModal: React.FC<CardDetailModalProps> = ({ open, cardId, onClose }) => {
    const [page, setPage] = useState<number>(1);

    const { data, isLoading } = useQuery({
        queryKey: ['cardTransactions', cardId, page],
        queryFn: () => getCardTransactionsApi(cardId!, page, 5),
        enabled: !!cardId && open, // Sadece modal açık ve cardId varsa tetiklenir
    });

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ fontWeight: 'bold' }}>Kart İşlem Geçmişi 📊</DialogTitle>
            <DialogContent>
                {isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <>
                        <TableContainer component={Paper} variant="outlined" sx={{ mt: 1 }}>
                            <Table size="small">
                                <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                                    <TableRow>
                                        <TableCell><strong>Tarih</strong></TableCell>
                                        <TableCell><strong>İşlem Tipi</strong></TableCell>
                                        <TableCell><strong>Tutar</strong></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {data?.items && data.items.length > 0 ? (
                                        data.items.map((tx) => (
                                            <TableRow key={tx.id}>
                                                <TableCell>{new Date(tx.timestamp).toLocaleString('tr-TR')}</TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={tx.transactionType}
                                                        size="small"
                                                        color={tx.amount > 0 ? 'success' : 'error'}
                                                    />
                                                </TableCell>
                                                <TableCell sx={{ fontWeight: 'bold' }}>
                                                    {tx.amount > 0 ? `+${tx.amount} ₺` : `${tx.amount} ₺`}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={3} align="center">
                                                Henüz işlem kaydı bulunmuyor.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {data && data.totalPages > 1 && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                                <Pagination
                                    count={data.totalPages}
                                    page={page}
                                    onChange={(_, value) => setPage(value)}
                                    color="primary"
                                />
                            </Box>
                        )}
                    </>
                )}
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose}>Kapat</Button>
            </DialogActions>
        </Dialog>
    );
};