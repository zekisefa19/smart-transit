import React, { useState, useEffect, useMemo } from 'react';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    IconButton,
    Button,
    Stack,
    Avatar,
    TextField,
    MenuItem,
    InputAdornment,
    Alert,
    CircularProgress,
    Grid,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Search as SearchIcon,
} from '@mui/icons-material';

import {
    getOperators,
    createOperator,
    updateOperator,
    deleteOperator,
    type OperatorDto,
} from '../../../services/adminService';

export const OperatorManagement: React.FC = () => {
    // --- STATE TANIMLARI ---
    const [operators, setOperators] = useState<OperatorDto[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [saving, setSaving] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOperatorId, setSelectedOperatorId] = useState<string | null>(null);

    // Form State
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('OPERATOR');
    const [assignedTask, setAssignedTask] = useState('');
    const [isActive, setIsActive] = useState<boolean>(true);

    // --- VERİ ÇEKME ---
    const fetchOperatorsList = async () => {
        try {
            setLoading(true);
            const data = await getOperators();
            setOperators(data);
        } catch (err: any) {
            console.error('Operatörler yüklenemedi:', err);
            setErrorMessage('Operatör listesi alınırken bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOperatorsList();
    }, []);

    // --- FORM TEMİZLEME & DÜZENLEME ---
    const resetForm = () => {
        setSelectedOperatorId(null);
        setFirstName('');
        setLastName('');
        setEmail('');
        setPassword('');
        setRole('OPERATOR');
        setAssignedTask('');
        setIsActive(true);
        setErrorMessage(null);
    };

    const handleSelectForEdit = (op: OperatorDto) => {
        setSelectedOperatorId(op.id);
        setFirstName(op.firstName);
        setLastName(op.lastName);
        setEmail(op.email);
        setPassword('');
        setRole(op.role || 'OPERATOR');
        setAssignedTask(op.assignedTask || '');
        setIsActive(op.isActive);
        setErrorMessage(null);
        setSuccessMessage(null);
    };

    // --- KAYDET / GÜNCELLE ---
    const handleSave = async () => {
        setErrorMessage(null);
        setSuccessMessage(null);

        if (!firstName.trim() || !lastName.trim() || !email.trim()) {
            setErrorMessage('Lütfen Ad, Soyad ve E-posta alanlarını doldurunuz.');
            return;
        }

        if (!selectedOperatorId && !password) {
            setErrorMessage('Yeni kayıt oluştururken şifre girilmesi zorunludur.');
            return;
        }

        try {
            setSaving(true);
            if (selectedOperatorId) {
                await updateOperator(selectedOperatorId, {
                    id: selectedOperatorId,
                    firstName: firstName.trim(),
                    lastName: lastName.trim(),
                    email: email.trim(),
                    password: password || undefined,
                    role,
                    assignedTask: assignedTask.trim() || null,
                    isActive,
                });
                setSuccessMessage('Operatör bilgileri başarıyla güncellendi.');
            } else {
                await createOperator({
                    firstName: firstName.trim(),
                    lastName: lastName.trim(),
                    email: email.trim(),
                    password,
                    role,
                });
                setSuccessMessage('Yeni operatör başarıyla sisteme eklendi.');
            }

            resetForm();
            await fetchOperatorsList();
        } catch (err: any) {
            console.error('Kaydetme hatası:', err);
            setErrorMessage(err.response?.data?.message || 'İşlem sırasında bir hata oluştu.');
        } finally {
            setSaving(false);
        }
    };

    // --- SİL İŞLEMİ ---
    const handleDelete = async (id: string, name: string) => {
        if (window.confirm(`"${name}" isimli operatörü silmek istediğinize emin misiniz?`)) {
            try {
                await deleteOperator(id);
                setSuccessMessage('Operatör başarıyla silindi.');
                await fetchOperatorsList();
                if (selectedOperatorId === id) resetForm();
            } catch (err) {
                console.error('Silme hatası:', err);
                setErrorMessage('Operatör silinirken bir hata oluştu.');
            }
        }
    };

    // --- ARAMA FİLTRESİ ---
    const filteredOperators = useMemo(() => {
        return operators.filter(
            (op) =>
                op.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                op.email?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [operators, searchTerm]);

    return (
        <Box sx={{ p: 2, maxWidth: 1400, margin: '0 auto' }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                Yönetim Paneli &gt; <span style={{ color: '#0f172a' }}>Operatör Yönetimi</span>
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mt: 1, mb: 3 }}>
                <Box sx={{ flexGrow: 1, textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a' }}>
                        Operatör Yönetimi
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Toplu taşıma operatörlerini, hat güzergah planlamalarını ve kart başvurularını yöneten ofis personelini kontrol edin.
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={resetForm}
                    sx={{
                        bgcolor: '#2563eb',
                        borderRadius: 2.5,
                        px: 3,
                        py: 1.2,
                        textTransform: 'none',
                        fontWeight: 700,
                        boxShadow: 'none',
                        whiteSpace: 'nowrap',
                        '&:hover': { bgcolor: '#1d4ed8', boxShadow: 'none' },
                    }}
                >
                    Yeni Operatör Ekle
                </Button>
            </Box>

            {errorMessage && (
                <Alert severity="error" onClose={() => setErrorMessage(null)} sx={{ mb: 2, borderRadius: 3 }}>
                    {errorMessage}
                </Alert>
            )}
            {successMessage && (
                <Alert severity="success" onClose={() => setSuccessMessage(null)} sx={{ mb: 2, borderRadius: 3 }}>
                    {successMessage}
                </Alert>
            )}

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 8 }}>
                    <Paper variant="outlined" sx={{ borderRadius: 4, p: 2.5, bgcolor: '#ffffff', borderColor: '#e2e8f0' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
                                Aktif Operatörler
                            </Typography>
                            <TextField
                                size="small"
                                placeholder="Operatör ara..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon fontSize="small" color="action" />
                                            </InputAdornment>
                                        ),
                                    },
                                }}
                                sx={{ width: 230, '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                            />
                        </Box>

                        <TableContainer>
                            <Table sx={{ minWidth: 500 }}>
                                <TableHead sx={{ bgcolor: '#f8fafc' }}>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 800, color: '#64748b', fontSize: '0.75rem', py: 1.5 }}>AD SOYAD</TableCell>
                                        <TableCell sx={{ fontWeight: 800, color: '#64748b', fontSize: '0.75rem', py: 1.5 }}>E-POSTA</TableCell>
                                        <TableCell sx={{ fontWeight: 800, color: '#64748b', fontSize: '0.75rem', py: 1.5 }}>ATANAN GÖREVLER</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 800, color: '#64748b', fontSize: '0.75rem', py: 1.5 }}>DURUM</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 800, color: '#64748b', fontSize: '0.75rem', py: 1.5 }}>İŞLEM</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                                                <CircularProgress size={32} />
                                            </TableCell>
                                        </TableRow>
                                    ) : filteredOperators.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} align="center" sx={{ py: 5, color: 'text.secondary' }}>
                                                Sistemde kayıtlı operatör bulunamadı.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredOperators.map((op) => (
                                            <TableRow key={op.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                                <TableCell sx={{ py: 1.8 }}>
                                                    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                                                        <Avatar sx={{ bgcolor: '#e2e8f0', color: '#334155', fontWeight: 700, width: 38, height: 38, fontSize: '0.9rem' }}>
                                                            {op.firstName?.[0]}{op.lastName?.[0]}
                                                        </Avatar>
                                                        <Box>
                                                            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
                                                                {op.fullName}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.72rem' }}>
                                                                ID: OF-{op.id.substring(0, 4)}
                                                            </Typography>
                                                        </Box>
                                                    </Stack>
                                                </TableCell>
                                                <TableCell sx={{ color: '#475569', fontWeight: 500, fontSize: '0.85rem' }}>
                                                    {op.email}
                                                </TableCell>
                                                <TableCell sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.85rem' }}>
                                                    {op.assignedTask || '-'}
                                                </TableCell>
                                                <TableCell align="center">
                                                    {op.isActive ? (
                                                        <Chip label="Aktif" size="small" sx={{ bgcolor: '#dcfce7', color: '#166534', fontWeight: 700, borderRadius: 1.5, px: 0.5 }} />
                                                    ) : (
                                                        <Chip label="Pasif" size="small" sx={{ bgcolor: '#fee2e2', color: '#991b1b', fontWeight: 700, borderRadius: 1.5, px: 0.5 }} />
                                                    )}
                                                </TableCell>
                                                <TableCell align="right">
                                                    <IconButton size="small" color="primary" onClick={() => handleSelectForEdit(op)}>
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                    <IconButton size="small" color="error" onClick={() => handleDelete(op.id, op.fullName)}>
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper variant="outlined" sx={{ borderRadius: 4, p: 3, bgcolor: '#ffffff', borderColor: '#e2e8f0' }}>
                        <Typography variant="h6" align="center" sx={{ fontWeight: 800, color: '#0f172a' }}>
                            {selectedOperatorId ? 'Operatörü Düzenle' : 'Operatör Ekle/Düzenle'}
                        </Typography>
                        <Typography variant="caption" align="center" color="text.secondary" sx={{ display: 'block', mb: 3 }}>
                            Ofis personeli bilgilerini ve yetkilerini güncelleyin.
                        </Typography>

                        <Stack spacing={2}>
                            <Grid container spacing={1.5}>
                                <Grid size={{ xs: 6 }}>
                                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155', mb: 0.5, display: 'block' }}>Ad</Typography>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        placeholder="Ad"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
                                    />
                                </Grid>
                                <Grid size={{ xs: 6 }}>
                                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155', mb: 0.5, display: 'block' }}>Soyad</Typography>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        placeholder="Soyad"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
                                    />
                                </Grid>
                            </Grid>

                            <Box>
                                <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155', mb: 0.5, display: 'block' }}>E-posta Adresi</Typography>
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder="ornek@transit.gov"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
                                />
                            </Box>

                            <Box>
                                <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155', mb: 0.5, display: 'block' }}>
                                    {selectedOperatorId ? 'Şifre (Değiştirmek İstemiyorsanız Boş Bırakın)' : 'Şifre'}
                                </Typography>
                                <TextField
                                    fullWidth
                                    type="password"
                                    size="small"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
                                />
                            </Box>

                            <Box>
                                <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155', mb: 0.5, display: 'block' }}>Rol</Typography>
                                <TextField
                                    select
                                    fullWidth
                                    size="small"
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
                                >
                                    <MenuItem value="OPERATOR">Operatör</MenuItem>
                                    <MenuItem value="ADMIN">Yönetici (Admin)</MenuItem>
                                </TextField>
                            </Box>

                            {selectedOperatorId && (
                                <>
                                    <Box>
                                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155', mb: 0.5, display: 'block' }}>Atanan Görev</Typography>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            placeholder="Örn: Güzergah Planlama"
                                            value={assignedTask}
                                            onChange={(e) => setAssignedTask(e.target.value)}
                                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
                                        />
                                    </Box>

                                    <Box>
                                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155', mb: 0.5, display: 'block' }}>Durum (Giriş İzni)</Typography>
                                        <TextField
                                            select
                                            fullWidth
                                            size="small"
                                            value={isActive ? 'true' : 'false'}
                                            onChange={(e) => setIsActive(e.target.value === 'true')}
                                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
                                        >
                                            <MenuItem value="true">Aktif (Giriş Yapabilir)</MenuItem>
                                            <MenuItem value="false">Pasif (Giriş Engellensin)</MenuItem>
                                        </TextField>
                                    </Box>
                                </>
                            )}

                            <Stack direction="row" spacing={1.5} sx={{ pt: 1.5 }}>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    color="inherit"
                                    onClick={resetForm}
                                    sx={{ borderRadius: 2.5, textTransform: 'none', fontWeight: 700, borderColor: '#cbd5e1' }}
                                >
                                    İptal
                                </Button>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    onClick={handleSave}
                                    disabled={saving}
                                    sx={{
                                        borderRadius: 2.5,
                                        bgcolor: '#2563eb',
                                        textTransform: 'none',
                                        fontWeight: 700,
                                        boxShadow: 'none',
                                        '&:hover': { bgcolor: '#1d4ed8', boxShadow: 'none' },
                                    }}
                                >
                                    {saving ? <CircularProgress size={22} color="inherit" /> : 'Kaydet'}
                                </Button>
                            </Stack>
                        </Stack>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default OperatorManagement;