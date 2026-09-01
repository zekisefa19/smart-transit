import React, { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Paper,
    Typography,
    Button,
    Chip,
    TextField,
    IconButton,
    CircularProgress,
    Alert,
    Avatar,
    Card,
    CardContent,
    LinearProgress,
    InputAdornment,
    Breadcrumbs,
    Link
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SendIcon from '@mui/icons-material/Send';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import PsychologyIcon from '@mui/icons-material/Psychology';
import RefreshIcon from '@mui/icons-material/Refresh';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

import { assistantService } from '../../../services/assistantService';
import type { AssistantDashboardData } from '../../../services/assistantService';
interface ChatMessage {
    id: string;
    sender: 'ai' | 'user';
    text: string;
    time: string;
}

const INITIAL_MESSAGES: ChatMessage[] = [
    {
        id: '1',
        sender: 'ai',
        text: 'Merhaba! Ben SmartTransit AI Asistanı. Sistemdeki anomali tespitleri, araç durumları (#0001), hat yoğunlukları veya bakım bilgileri hakkında bana soru sorabilirsiniz.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
];

export const SmartAssistant: React.FC = () => {
    const [dashboardData, setDashboardData] = useState<AssistantDashboardData | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
    const [inputQuery, setInputQuery] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [aiAnalyzing, setAiAnalyzing] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchAssistantData();
    }, []);

    const fetchAssistantData = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await assistantService.getDashboardData();
            setDashboardData(data);
        } catch {
            setError('Canlı asistan ve anomali verileri alınırken bir sorun oluştu.');
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async () => {
        if (!inputQuery.trim() || aiAnalyzing) return;

        const currentPrompt = inputQuery.trim();
        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            sender: 'user',
            text: currentPrompt,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages((prev) => [...prev, userMsg]);
        setInputQuery('');
        setAiAnalyzing(true);

        try {
            const res = await assistantService.askAssistant(currentPrompt);
            const aiMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                sender: 'ai',
                text: res.reply,
                time: new Date(res.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages((prev) => [...prev, aiMsg]);
        } catch {
            const errorMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                sender: 'ai',
                text: 'Üzgünüm, sorunuzu analiz ederken veritabanı bağlantısında bir hata oluştu. Lütfen tekrar deneyin.',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages((prev) => [...prev, errorMsg]);
        } finally {
            setAiAnalyzing(false);
        }
    };

    const getSeverityChip = (severity: string) => {
        const sev = severity.toLowerCase();
        if (sev === 'critical' || sev === 'high' || sev === 'yüksek') {
            return <Chip label="Kritik" size="small" sx={{ bgcolor: '#ffe4e6', color: '#e11d48', fontWeight: 800 }} />;
        }
        if (sev === 'medium' || sev === 'orta') {
            return <Chip label="Orta Seviye" size="small" sx={{ bgcolor: '#fef3c7', color: '#d97706', fontWeight: 800 }} />;
        }
        return <Chip label="Düşük Risk" size="small" sx={{ bgcolor: '#f1f5f9', color: '#475569', fontWeight: 800 }} />;
    };

    const formatTime = (isoString: string) => {
        try {
            return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch {
            return 'Az önce';
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress size={40} sx={{ color: '#0052cc' }} />
            </Box>
        );
    }

    return (
        <Box sx={{ width: '100%', p: { xs: 1, md: 2 } }}>
            <Breadcrumbs
                separator={<NavigateNextIcon fontSize="small" sx={{ color: '#94a3b8' }} />}
                sx={{ mb: 2 }}
            >
                <Link underline="hover" color="inherit" href="#" sx={{ fontSize: '0.85rem', color: '#64748b' }}>
                    Yönetim Paneli
                </Link>
                <Typography sx={{ fontSize: '0.85rem', color: '#0f172a', fontWeight: 700 }}>
                    Akıllı Asistan & Anomali Tespiti
                </Typography>
            </Breadcrumbs>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>
                            Akıllı Asistan & Anomali Tespiti
                        </Typography>
                        <Chip
                            icon={<AutoAwesomeIcon style={{ color: '#7c3aed', fontSize: 16 }} />}
                            label="AI Powered"
                            size="small"
                            sx={{ bgcolor: '#f3e8ff', color: '#7c3aed', fontWeight: 800 }}
                        />
                    </Box>
                    <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
                        Yapay zeka analizleri, anlık ağ anomalileri ve otomatik operasyonel öneriler.
                    </Typography>
                </Box>

                <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={fetchAssistantData}
                    sx={{
                        borderRadius: 2.5,
                        textTransform: 'none',
                        fontWeight: 700,
                        borderColor: '#cbd5e1',
                        color: '#334155',
                        px: 2.5
                    }}
                >
                    Yenile
                </Button>
            </Box>

            {error && <Alert severity="warning" sx={{ mb: 3, borderRadius: 3 }}>{error}</Alert>}

            {/* Kart Metrikleri - Gerçek Veriler */}
            <Grid container spacing={2.5} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <Card elevation={0} sx={{ borderRadius: 3.5, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>
                                    AĞ SAĞLIK SKORU
                                </Typography>
                                <CheckCircleOutlinedIcon sx={{ color: '#16a34a' }} />
                            </Box>
                            <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a' }}>
                                %{dashboardData?.networkHealthScore ?? 100}
                            </Typography>
                            <LinearProgress
                                variant="determinate"
                                value={dashboardData?.networkHealthScore ?? 100}
                                sx={{ height: 6, borderRadius: 3, mt: 1.5, bgcolor: '#f1f5f9', '& .MuiLinearProgress-bar': { bgcolor: '#16a34a' } }}
                            />
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                    <Card elevation={0} sx={{ borderRadius: 3.5, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>
                                    TESPİT EDİLEN ANOMALİLER
                                </Typography>
                                <WarningAmberIcon sx={{ color: '#d97706' }} />
                            </Box>
                            <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a' }}>
                                {dashboardData?.activeAnomalyCount ?? 0}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#e11d48', fontWeight: 700, display: 'block', mt: 1 }}>
                                {dashboardData?.criticalAnomalyCount ?? 0} Kritik ilgilenilmesi gerekiyor
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                    <Card elevation={0} sx={{ borderRadius: 3.5, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>
                                    OTOMATİK ÖNERİLER
                                </Typography>
                                <PsychologyIcon sx={{ color: '#7c3aed' }} />
                            </Box>
                            <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a' }}>
                                {dashboardData?.recommendationCount ?? 0} Aktif
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#16a34a', fontWeight: 700, display: 'block', mt: 1 }}>
                                Canlı veri akışı optimize ediliyor
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Grid container spacing={3}>
                {/* Canlı Anomali Bildirim Listesi */}
                <Grid size={{ xs: 12, lg: 7 }}>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
                                Canlı Anomali Bildirimleri
                            </Typography>
                            <Chip label="Canlı İzleme" size="small" sx={{ bgcolor: '#dcfce7', color: '#15803d', fontWeight: 800 }} />
                        </Box>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {(!dashboardData?.liveAnomalies || dashboardData.liveAnomalies.length === 0) ? (
                                <Typography variant="body2" sx={{ color: '#64748b', py: 4, textAlign: 'center' }}>
                                    Şu anda sistemde çözülmemiş aktif anomali bulunmamaktadır.
                                </Typography>
                            ) : (
                                dashboardData.liveAnomalies.map((anom) => (
                                    <Paper
                                        key={anom.id}
                                        elevation={0}
                                        sx={{
                                            p: 2.5,
                                            borderRadius: 3,
                                            border: '1px solid #f1f5f9',
                                            bgcolor: '#f8fafc',
                                            '&:hover': { bgcolor: '#f1f5f9' },
                                            transition: '0.2s'
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <WarningAmberIcon
                                                    sx={{
                                                        color: anom.severity.toLowerCase() === 'critical' ? '#e11d48' : '#d97706'
                                                    }}
                                                />
                                                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a' }}>
                                                    {anom.title}
                                                </Typography>
                                            </Box>
                                            {getSeverityChip(anom.severity)}
                                        </Box>

                                        <Typography variant="body2" sx={{ color: '#475569', mb: 1.5, pl: 4 }}>
                                            {anom.description}
                                        </Typography>

                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pl: 4 }}>
                                            <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>
                                                Konum: {anom.location} • {formatTime(anom.timeStamp)}
                                            </Typography>
                                            <Button size="small" sx={{ textTransform: 'none', fontWeight: 700, color: '#0052cc' }}>
                                                Aksiyon Al →
                                            </Button>
                                        </Box>
                                    </Paper>
                                ))
                            )}
                        </Box>
                    </Paper>
                </Grid>

                {/* AI Chatbot Paneli */}
                <Grid size={{ xs: 12, lg: 5 }}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            borderRadius: 4,
                            border: '1px solid #e2e8f0',
                            bgcolor: '#ffffff',
                            display: 'flex',
                            flexDirection: 'column',
                            height: 540
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 2, borderBottom: '1px solid #f1f5f9' }}>
                            <Avatar sx={{ bgcolor: '#7c3aed', width: 36, height: 36 }}>
                                <AutoAwesomeIcon fontSize="small" />
                            </Avatar>
                            <Box>
                                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a' }}>
                                    SmartTransit Copilot
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#16a34a', fontWeight: 700 }}>
                                    ● Aktif ve Verileri Analiz Ediyor
                                </Typography>
                            </Box>
                        </Box>

                        <Box sx={{ flex: 1, overflowY: 'auto', py: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {messages.map((msg) => (
                                <Box
                                    key={msg.id}
                                    sx={{
                                        display: 'flex',
                                        justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start'
                                    }}
                                >
                                    <Box
                                        sx={{
                                            maxWidth: '85%',
                                            p: 2,
                                            borderRadius: 3,
                                            bgcolor: msg.sender === 'user' ? '#0052cc' : '#f1f5f9',
                                            color: msg.sender === 'user' ? '#ffffff' : '#0f172a',
                                            whiteSpace: 'pre-line'
                                        }}
                                    >
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                            {msg.text}
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                display: 'block',
                                                textAlign: 'right',
                                                mt: 0.5,
                                                opacity: 0.7,
                                                fontSize: '0.68rem'
                                            }}
                                        >
                                            {msg.time}
                                        </Typography>
                                    </Box>
                                </Box>
                            ))}

                            {aiAnalyzing && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#7c3aed', p: 1 }}>
                                    <CircularProgress size={16} color="inherit" />
                                    <Typography variant="caption" sx={{ fontWeight: 700 }}>
                                        Veritabanı Analiz Ediliyor...
                                    </Typography>
                                </Box>
                            )}
                        </Box>

                        <Box sx={{ display: 'flex', gap: 1, mb: 1.5, overflowX: 'auto', pb: 0.5 }}>
                            <Chip
                                label="Bakımda kaç araç var?"
                                onClick={() => setInputQuery('Bakımda kaç araç var?')}
                                size="small"
                                sx={{ cursor: 'pointer', bgcolor: '#f8fafc', fontSize: '0.72rem' }}
                            />
                            <Chip
                                label="399C hattında kaç araç var?"
                                onClick={() => setInputQuery('399C hattında kaç araç var?')}
                                size="small"
                                sx={{ cursor: 'pointer', bgcolor: '#f8fafc', fontSize: '0.72rem' }}
                            />
                            <Chip
                                label="Filo genel durumu"
                                onClick={() => setInputQuery('Filo genel durumu')}
                                size="small"
                                sx={{ cursor: 'pointer', bgcolor: '#f8fafc', fontSize: '0.72rem' }}
                            />
                        </Box>

                        <Box sx={{ pt: 1 }}>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Araç, hat veya filo durumu hakkında sorun..."
                                value={inputQuery}
                                onChange={(e) => setInputQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                slotProps={{
                                    input: {
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton onClick={handleSendMessage} color="primary" disabled={!inputQuery.trim() || aiAnalyzing}>
                                                    <SendIcon fontSize="small" />
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    },
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': { borderRadius: 3 }
                                }}
                            />
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default SmartAssistant;