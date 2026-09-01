import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import CardApplicationsTab from './CardApplicationsTab';

export const OperatorCardsPage: React.FC = () => {
    return (
        <Box sx={{ p: 3, width: '100%', minHeight: '100vh', bgcolor: '#f8fafc' }}>
            {/* Sayfa Üst Başlık */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>
                    Kart Başvuruları & Onay Yönetimi
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Yolcu portalından gelen kart başvurularını, yüklenen evrakları, teslimat adreslerini inceleyin ve onay/red işlemlerini gerçekleştirin.
                </Typography>
            </Box>

            {/* Gelişmiş Başvuru Yönetim Ekranı */}
            <Paper
                elevation={0}
                sx={{
                    p: 3,
                    borderRadius: 4,
                    bgcolor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 20px 0 rgba(0,0,0,0.03)',
                }}
            >
                <CardApplicationsTab />
            </Paper>
        </Box>
    );
};

export default OperatorCardsPage;