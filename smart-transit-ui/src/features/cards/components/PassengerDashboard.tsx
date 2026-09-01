import React, { useState, useEffect, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
    Box,
    Typography,
    Paper,
    Button,
    CircularProgress,
    Alert,
    TextField,
    InputAdornment,
    IconButton,
    Avatar,
    Badge,
    Chip,
    Divider,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    Popover,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Switch,
    FormControlLabel,
    Stack,
    Menu,
} from '@mui/material';
import {
    GridView,
    CreditCard,
    AddCard,
    History,
    ConfirmationNumber,
    HelpOutlined,
    Logout,
    Search,
    Notifications,
    DirectionsBus,
    Subway,
    AutoAwesome,
    Nfc,
    TrendingUp,
    CheckCircle,
    Person,
    School,
    LocalOffer,
    Send,
    AssignmentTurnedIn,
    AccountBalanceWallet,
    Security,
    FlashOn,
    Train,
    ConfirmationNumberOutlined,
    Email,
    Phone,
    LocationOn,
    Check,
    DoneAll,
    Info,
    Warning,
    Edit,
    CloudUpload,
    Accessible,
    Elderly,
    ChildFriendly,
} from '@mui/icons-material';
import {
    CardService,
    type CardDto,
    type CardTransactionDto,
} from '../../../services/cardService';
import SupportDashboard from '../../support/component/SupportDashboard';

export interface ExtendedCardTransactionDto extends CardTransactionDto {
    balanceAfter?: number;
    cardName?: string;
    cardId?: string;
    createdAt?: string;
    transactionDate?: string;
    date?: string;
    type?: string;
    description?: string;
    category?: string;
    isTopUp?: boolean;
}

export interface FareRateDto {
    id: string;
    type?: 'tam' | 'ogrenci' | 'sosyal' | 'engelli' | 'anne' | '65ustu' | string;
    iconType?: 'person' | 'school' | 'offer' | 'accessible' | 'child' | 'elderly' | string;
    title: string;
    subtitle: string;
    packageInfo: string;
    badgeText: string;
    price: number;
    formattedPrice?: string;
}

interface NotificationItem {
    id: string;
    title: string;
    message: string;
    date: string;
    read: boolean;
    type: 'success' | 'info' | 'warning';
}

const initialDefaultFares: FareRateDto[] = [
    {
        id: '1',
        type: 'tam',
        iconType: 'person',
        title: '1. Tam İstanbulkart',
        subtitle: 'Standart Kullanıcı',
        packageInfo: 'Paket: ₺3.628,00 + ₺8 Hizmet Bedeli',
        badgeText: 'AYLIK ABONMAN (200 BASIM)',
        price: 3636,
        formattedPrice: '₺3.636,00',
    },
    {
        id: '2',
        type: 'ogrenci',
        iconType: 'school',
        title: '2. Öğrenci Kartı',
        subtitle: 'İlkokul, Lise, Üniversite',
        packageInfo: 'Paket: ₺653,00 + ₺8 Hizmet Bedeli',
        badgeText: 'AYLIK ABONMAN (200 BASIM)',
        price: 661,
        formattedPrice: '₺661,00',
    },
    {
        id: '3',
        type: 'sosyal',
        iconType: 'offer',
        title: '3. Sosyal / İndirimli',
        subtitle: 'Öğretmen, 60+ Yaş',
        packageInfo: 'Paket: ₺1.739,00 + ₺8 Hizmet Bedeli',
        badgeText: 'AYLIK ABONMAN (200 BASIM)',
        price: 1747,
        formattedPrice: '₺1.747,00',
    },
    {
        id: '4',
        type: 'engelli',
        iconType: 'accessible',
        title: '4. Engelli Kartı',
        subtitle: '%40+ Sağlık Raporlu',
        packageInfo: 'Sınırsız / Muafiyetli Geçiş',
        badgeText: '%100 İNDİRİMLİ / ÜCRETSİZ',
        price: 0,
        formattedPrice: '₺0,00',
    },
    {
        id: '5',
        type: 'anne',
        iconType: 'child',
        title: '5. Anne Kartı',
        subtitle: '0-4 Yaş Çocuk Sahibi Anneler',
        packageInfo: 'Aylık Tanımlanan Kota',
        badgeText: 'AYLIK 150 ÜCRETSİZ KOTA',
        price: 0,
        formattedPrice: '₺0,00',
    },
    {
        id: '6',
        type: '65ustu',
        iconType: 'elderly',
        title: '6. +65 Yaş Kartı',
        subtitle: '65 Yaş ve Üzeri Vatandaşlar',
        packageInfo: 'Şehir İçi Tüm Geçişlerde Geçerli',
        badgeText: 'SINIRSIZ ÜCRETSİZ KULLANIM',
        price: 0,
        formattedPrice: '₺0,00',
    },
];

const getDecodedUserInfo = (): { name: string | null; email: string | null } => {
    const token = localStorage.getItem('smarttransit_token') || localStorage.getItem('token');
    if (!token) return { name: null, email: null };
    try {
        const base64Url = token.split('.')[1];
        let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        while (base64.length % 4) {
            base64 += '=';
        }
        const jsonPayload = decodeURIComponent(
            window
                .atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        const payload = JSON.parse(jsonPayload);
        const name =
            payload.name ||
            payload.unique_name ||
            payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ||
            payload.sub ||
            null;
        const email =
            payload.email ||
            payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] ||
            null;
        return { name, email };
    } catch (error) {
        console.error('Token çözümleme hatası:', error);
        return { name: null, email: null };
    }
};

const isToday = (dateString?: string) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return false;
    const today = new Date();
    return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
    );
};

const PageHeader = ({ title, subtitle, badge }: { title: string; subtitle: string; badge?: string }) => (
    <Box
        sx={{
            p: 3.5,
            mb: 3.5,
            borderRadius: 4,
            background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',
            color: 'white',
            boxShadow: '0 10px 30px -5px rgba(15, 23, 42, 0.3)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
        }}
    >
        <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.5px' }}>
                    {title}
                </Typography>
                {badge && (
                    <Chip
                        label={badge}
                        size="small"
                        sx={{
                            bgcolor: 'rgba(99, 102, 241, 0.25)',
                            color: '#a5b4fc',
                            fontWeight: 700,
                            border: '1px solid rgba(165, 180, 252, 0.3)',
                        }}
                    />
                )}
            </Box>
            <Typography variant="body2" sx={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                {subtitle}
            </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip
                icon={<FlashOn sx={{ color: '#f59e0b !important', fontSize: '16px' }} />}
                label="Sistem Aktif"
                sx={{ bgcolor: 'rgba(255,255,255,0.08)', color: '#f3f4f6', fontWeight: 600 }}
            />
        </Box>
    </Box>
);

const getFareStyle = (typeKey?: string) => {
    switch (typeKey) {
        case 'ogrenci':
        case 'school':
            return {
                border: '2px solid #4f46e5',
                avatarBg: '#e0e7ff',
                avatarColor: '#4f46e5',
                boxBg: '#e0e7ff',
                badgeColor: '#4f46e5',
                priceColor: '#4f46e5',
                icon: <School />,
            };
        case 'sosyal':
        case 'offer':
            return {
                border: '1px solid #e2e8f0',
                avatarBg: '#f0fdf4',
                avatarColor: '#16a34a',
                boxBg: '#f0fdf4',
                badgeColor: '#16a34a',
                priceColor: '#16a34a',
                icon: <LocalOffer />,
            };
        case 'engelli':
        case 'accessible':
            return {
                border: '1px solid #e2e8f0',
                avatarBg: '#fef3c7',
                avatarColor: '#d97706',
                boxBg: '#fef3c7',
                badgeColor: '#b45309',
                priceColor: '#d97706',
                icon: <Accessible />,
            };
        case 'anne':
        case 'child':
            return {
                border: '1px solid #e2e8f0',
                avatarBg: '#fdf2f8',
                avatarColor: '#ec4899',
                boxBg: '#fdf2f8',
                badgeColor: '#be185d',
                priceColor: '#ec4899',
                icon: <ChildFriendly />,
            };
        case '65ustu':
        case 'elderly':
            return {
                border: '1px solid #e2e8f0',
                avatarBg: '#ccfbf1',
                avatarColor: '#0d9488',
                boxBg: '#ccfbf1',
                badgeColor: '#0f766e',
                priceColor: '#0d9488',
                icon: <Elderly />,
            };
        case 'tam':
        case 'person':
        default:
            return {
                border: '1px solid #e2e8f0',
                avatarBg: '#0f172a',
                avatarColor: '#ffffff',
                boxBg: '#f8fafc',
                badgeColor: '#64748b',
                priceColor: '#0f172a',
                icon: <Person />,
            };
    }
};

export const PassengerDashboard: React.FC = () => {
    const queryClient = useQueryClient();
    const [activeMenu, setActiveMenuState] = useState<string>(() => {
        return localStorage.getItem('passenger_active_menu') || 'overview';
    });
    const setActiveMenu = (menuId: string) => {
        setActiveMenuState(menuId);
        localStorage.setItem('passenger_active_menu', menuId);
    };
    const [userName, setUserName] = useState<string>('');
    const [cards, setCards] = useState<CardDto[]>([]);
    const [selectedCardId, setSelectedCardId] = useState<string>('');
    const [transactions, setTransactions] = useState<ExtendedCardTransactionDto[]>([]);
    const [loadingCards, setLoadingCards] = useState<boolean>(true);
    const [loadingTransactions, setLoadingTransactions] = useState<boolean>(false);
    const [cardsError, setCardsError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>('');

    // Dinamik Tarife Ücretleri State'leri
    const [fareRates, setFareRates] = useState<FareRateDto[]>(initialDefaultFares);
    const [loadingFares, setLoadingFares] = useState<boolean>(false);

    // Bakiye Yükleme State'leri
    const [topUpCardId, setTopUpCardId] = useState<string>('');
    const [topUpAmount, setTopUpAmount] = useState<number>(100);
    const [customAmount, setCustomAmount] = useState<string>('');
    const [topUpLoading, setTopUpLoading] = useState<boolean>(false);
    const [topUpSuccess, setTopUpSuccess] = useState<string | null>(null);
    const [topUpError, setTopUpError] = useState<string | null>(null);

    // Kart Başvurusu State'leri (6 Kart Tipi Entegrasyonu)
    const [cardType, setCardType] = useState<string>('ogrenci');
    const [fullName, setFullName] = useState<string>('');
    const [applicantEmail, setApplicantEmail] = useState<string>('');
    const [tcNo, setTcNo] = useState<string>('');
    const [studentNo, setStudentNo] = useState<string>('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [deliveryMethod, setDeliveryMethod] = useState<string>('kargo');
    const [applySuccess, setApplySuccess] = useState<boolean>(false);
    const [deliveryAddress, setDeliveryAddress] = useState<string>('');

    // Profil Dashboard State'leri
    const [profileName, setProfileName] = useState<string>('');
    const [profileEmail, setProfileEmail] = useState<string>('');
    const [profilePhone, setProfilePhone] = useState<string>('');
    const [profileCity, setProfileCity] = useState<string>('');
    const [emailNotify, setEmailNotify] = useState<boolean>(true);
    const [smsNotify, setSmsNotify] = useState<boolean>(true);
    const [twoFactor, setTwoFactor] = useState<boolean>(false);
    const [profileUpdateSuccess, setProfileUpdateSuccess] = useState<string | null>(null);

    // Menü Anchor State'leri
    const [profileMenuAnchorEl, setProfileMenuAnchorEl] = useState<null | HTMLElement>(null);
    const [notificationAnchorEl, setNotificationAnchorEl] = useState<null | HTMLElement>(null);

    // Bildirimler
    const [notificationsList, setNotificationsList] = useState<NotificationItem[]>([
        {
            id: '1',
            title: 'Bakiye Yükleme Başarılı',
            message: 'İstanbulkart *****4512 kartınıza ₺100.00 tutarında bakiye yüklendi.',
            date: '10 dakika önce',
            read: false,
            type: 'success',
        },
        {
            id: '2',
            title: 'Abonman Yenileme Hatırlatması',
            message: 'Öğrenci abonmanınızın süresi 5 gün içinde dolacaktır.',
            date: '2 saat önce',
            read: false,
            type: 'warning',
        },
        {
            id: '3',
            title: 'Sistem Duyurusu',
            message: 'M2 Metro hattında hafta sonu gece seferleri tarifesi güncellenmiştir.',
            date: 'Dün',
            read: true,
            type: 'info',
        },
    ]);
    const [midnightTick, setMidnightTick] = useState<number>(Date.now());

    useEffect(() => {
        const now = new Date();
        const nextMidnight = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() + 1,
            0, 0, 0, 0
        );
        const timeUntilMidnight = Math.max(1000, nextMidnight.getTime() - now.getTime());
        const timer = setTimeout(() => {
            setMidnightTick(Date.now());
        }, timeUntilMidnight);
        return () => clearTimeout(timer);
    }, [midnightTick]);

    useEffect(() => {
        const { name, email } = getDecodedUserInfo();
        const storedName = localStorage.getItem('user_fullname');
        const activeName = name || storedName || '';
        if (activeName) {
            setUserName(activeName);
            setFullName(activeName);
            setProfileName(activeName);
        }
        if (email) {
            setProfileEmail(email);
            setApplicantEmail(email);
        }
    }, []);

    const fetchFareRates = async () => {
        setLoadingFares(true);
        try {
            if ((CardService as any).getFareRates) {
                const data = await (CardService as any).getFareRates();
                if (data && data.length > 0) {
                    setFareRates(data);
                }
            } else {
                const res = await fetch('/api/fares').catch(() => null);
                if (res && res.ok) {
                    const data = await res.json();
                    if (data && data.length > 0) {
                        setFareRates(data);
                    }
                }
            }
        } catch (err) {
            console.error('Tarife verileri yüklenirken hata oluştu:', err);
        } finally {
            setLoadingFares(false);
        }
    };

    const fetchAllCardTransactions = async (userCards: CardDto[]) => {
        if (!userCards || userCards.length === 0) {
            setTransactions([]);
            return;
        }
        setLoadingTransactions(true);
        try {
            const txPromises = userCards.map((card) =>
                CardService.getCardTransactions(card.id, 1, 20)
                    .then((res) => (res?.items || []).map((item) => ({ ...item, cardId: card.id, cardName: card.cardName })))
                    .catch(() => [])
            );
            const results = await Promise.all(txPromises);
            const combined: ExtendedCardTransactionDto[] = results.flat();
            combined.sort((a, b) => {
                const dateA = new Date(a.createdDate || a.createdAt || a.transactionDate || 0).getTime();
                const dateB = new Date(b.createdDate || b.createdAt || b.transactionDate || 0).getTime();
                return dateB - dateA;
            });
            setTransactions(combined);
        } catch (err) {
            console.error('Anlık işlem geçmişi çekilemedi:', err);
        } finally {
            setLoadingTransactions(false);
        }
    };

    const fetchCards = async () => {
        setLoadingCards(true);
        setCardsError(null);
        try {
            const { name, email } = getDecodedUserInfo();
            const storedName = localStorage.getItem('user_fullname');
            const resolvedName = name || storedName;
            if (resolvedName) {
                setUserName(resolvedName);
                setFullName((prev) => prev || resolvedName);
                setProfileName((prev) => prev || resolvedName);
            }
            if (email) {
                setProfileEmail((prev) => prev || email);
                setApplicantEmail((prev) => prev || email);
            }
            const userCards = await CardService.getUserCards();
            setCards(userCards || []);
            if (userCards && userCards.length > 0) {
                setSelectedCardId((prev) => prev || userCards[0].id);
                setTopUpCardId((prev) => prev || userCards[0].id);
                await fetchAllCardTransactions(userCards);
            }
        } catch (err: any) {
            console.error('Kart yükleme hatası:', err);
            setCardsError(err.response?.data?.message || 'Kart bilgileri çekilemedi.');
        } finally {
            setLoadingCards(false);
        }
    };

    useEffect(() => {
        fetchCards();
        fetchFareRates();
    }, []);

    const handleTopUpSubmit = async () => {
        setTopUpError(null);
        setTopUpSuccess(null);
        const amountNum = customAmount ? parseFloat(customAmount) : topUpAmount;
        if (!topUpCardId) {
            setTopUpError('Lütfen bir kart seçin.');
            return;
        }
        if (isNaN(amountNum) || amountNum <= 0) {
            setTopUpError('Geçerli bir tutar girin.');
            return;
        }
        setTopUpLoading(true);
        try {
            await CardService.topUpBalance(topUpCardId, amountNum);
            setTopUpSuccess(`₺${amountNum.toFixed(2)} tutarındaki bakiye başarıyla yüklendi!`);
            const newNotif: NotificationItem = {
                id: Date.now().toString(),
                title: 'Bakiye Yüklendi',
                message: `Kartınıza ₺${amountNum.toFixed(2)} bakiye aktarıldı.`,
                date: 'Az önce',
                read: false,
                type: 'success',
            };
            setNotificationsList((prev) => [newNotif, ...prev]);
            await fetchCards();
            setCustomAmount('');
        } catch (err: any) {
            setTopUpError(err.response?.data?.message || 'Yükleme başarısız.');
        } finally {
            setTopUpLoading(false);
        }
    };

    const handleCardApplySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!tcNo || tcNo.trim().length !== 11) {
            alert('Lütfen 11 haneli T.C. Kimlik Numaranızı eksiksiz ve doğru giriniz.');
            return;
        }
        if (!applicantEmail || !applicantEmail.includes('@')) {
            alert('Lütfen geçerli bir e-posta adresi giriniz.');
            return;
        }
        if (deliveryMethod === 'kargo' && !deliveryAddress.trim()) {
            alert('Lütfen teslimat için açık adresinizi giriniz.');
            return;
        }
        try {
            await CardService.applyForCard({
                cardType,
                applicantName: fullName,
                identityNumber: tcNo,
                email: applicantEmail,
                deliveryMethod: deliveryMethod,
                deliveryAddress: deliveryMethod === 'kargo' ? deliveryAddress : undefined,
                studentNo: cardType === 'ogrenci' ? studentNo : undefined,
                documentUrl: selectedFile ? selectedFile.name : undefined,
            });
            setApplySuccess(true);
            if (queryClient) {
                queryClient.invalidateQueries({ queryKey: ['cardApplications'] });
            }
            setTimeout(() => {
                setApplySuccess(false);
                setSelectedFile(null);
                setDeliveryAddress('');
                setTcNo('');
                setStudentNo('');
                setActiveMenu('cards');
            }, 2000);
        } catch (error: any) {
            console.error('Başvuru gönderilirken hata oluştu:', error);
            alert(error?.response?.data?.message || 'Başvuru iletilirken bir hata oluştu. Lütfen tekrar deneyin.');
        }
    };

    const handleProfileSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (profileName) {
            setUserName(profileName);
            localStorage.setItem('user_fullname', profileName);
        }
        setProfileUpdateSuccess('Profil bilgileriniz ve tercihleriniz başarıyla güncellendi.');
        setTimeout(() => setProfileUpdateSuccess(null), 3000);
    };

    const handleLogout = () => {
        localStorage.removeItem('smarttransit_token');
        localStorage.removeItem('token');
        localStorage.removeItem('passenger_active_menu');
        localStorage.removeItem('user_fullname');
        sessionStorage.clear();
        window.location.href = '/login';
    };

    const markAllNotificationsAsRead = () => {
        setNotificationsList((prev) => prev.map((n) => ({ ...n, read: true })));
    };

    const unreadNotificationsCount = notificationsList.filter((n) => !n.read).length;
    const totalBalance = cards.reduce((sum, card) => sum + (card.balance || 0), 0);

    const dailyStats = useMemo(() => {
        const todayTransactions = transactions.filter((t) => {
            const rawDate = t.createdDate || t.createdAt || t.transactionDate || t.date;
            return isToday(rawDate);
        });
        let totalSpent = 0;
        let abonmanCount = 0;
        let tlPassageCount = 0;
        todayTransactions.forEach((t) => {
            const rawType = [
                t.transactionType,
                t.type,
                t.description,
                t.category
            ].filter(Boolean).join(' ').toLowerCase();
            const normalizedType = rawType
                .replace(/ğ/g, 'g')
                .replace(/ü/g, 'u')
                .replace(/ş/g, 's')
                .replace(/ı/g, 'i')
                .replace(/ö/g, 'o')
                .replace(/ç/g, 'c');
            const isTopUp =
                normalizedType.includes('yukle') ||
                normalizedType.includes('topup') ||
                normalizedType.includes('top up') ||
                normalizedType.includes('deposit') ||
                normalizedType.includes('dolum') ||
                normalizedType.includes('kredi') ||
                t.isTopUp === true;
            if (!isTopUp) {
                const isAbonman =
                    normalizedType.includes('abonman') ||
                    normalizedType.includes('subscription') ||
                    normalizedType.includes('kota') ||
                    normalizedType.includes('pass');
                if (isAbonman) {
                    abonmanCount += 1;
                } else {
                    tlPassageCount += 1;
                    totalSpent += Math.abs(t.amount || 0);
                }
            }
        });
        return { totalSpent, abonmanCount, tlPassageCount };
    }, [transactions, midnightTick]);

    const filteredTransactions = useMemo(() => {
        let result = transactions;
        if (selectedCardId) {
            result = result.filter((t) => t.cardId === selectedCardId);
        }
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter((t) => {
                const typeStr = (t.transactionType || t.type || t.description || '').toLowerCase();
                const cardStr = (t.cardName || '').toLowerCase();
                return typeStr.includes(query) || cardStr.includes(query);
            });
        }
        return result;
    }, [transactions, selectedCardId, searchQuery]);

    const menuItems = [
        { id: 'overview', label: 'Genel Bakış', icon: <GridView fontSize="small" /> },
        { id: 'cards', label: 'Kartlarım & Abonmanlar', icon: <CreditCard fontSize="small" /> },
        { id: 'topup', label: 'Bakiye Yükle', icon: <AddCard fontSize="small" /> },
        { id: 'history', label: 'İşlem Geçmişi', icon: <History fontSize="small" /> },
        { id: 'fares', label: 'Tarife Ücretleri', icon: <ConfirmationNumber fontSize="small" /> },
    ];

    if (loadingCards) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100vw', height: '100vh', bgcolor: '#0b0f19' }}>
                <CircularProgress size={50} sx={{ color: '#6366f1' }} />
            </Box>
        );
    }

    const renderOverview = () => (
        <Box sx={{ width: '100%' }}>
            <PageHeader
                title={`Tekrar Hoş Geldin, ${userName || profileName || 'Kullanıcı'} 👋`}
                subtitle="Kart bakiyelerinizi, abonman kullanım durumunuzu ve anlık seyahat hareketlerinizi buradan takip edin."
                badge="CANLI ÖZET"
            />
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '8fr 4fr' }, gap: 3.5 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2.5 }}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 3,
                                borderRadius: 4,
                                border: '1px solid rgba(226, 232, 240, 0.8)',
                                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                                boxShadow: '0 4px 20px -2px rgba(0,0,0,0.03)',
                                position: 'relative',
                            }}
                        >
                            <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                TOPLAM BAKİYE
                            </Typography>
                            <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', my: 1 }}>
                                ₺{totalBalance.toFixed(2)}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#16a34a' }}>
                                <TrendingUp fontSize="small" />
                                <Typography variant="caption" sx={{ fontWeight: 700 }}>Aktif Yükleme Tamamlandı</Typography>
                            </Box>
                            <Box sx={{ position: 'absolute', top: 22, right: 22, p: 1.2, bgcolor: '#e0e7ff', color: '#4f46e5', borderRadius: 3 }}>
                                <AccountBalanceWallet fontSize="small" />
                            </Box>
                        </Paper>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 3,
                                borderRadius: 4,
                                border: '1px solid rgba(226, 232, 240, 0.8)',
                                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                                boxShadow: '0 4px 20px -2px rgba(0,0,0,0.03)',
                                position: 'relative',
                            }}
                        >
                            <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                KAYITLI KART
                            </Typography>
                            <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', my: 1 }}>
                                {cards.length} Adet
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Tüm kartlar aktif kullanımda</Typography>
                            <Box sx={{ position: 'absolute', top: 22, right: 22, p: 1.2, bgcolor: '#dbeafe', color: '#2563eb', borderRadius: 3 }}>
                                <CreditCard fontSize="small" />
                            </Box>
                        </Paper>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 3,
                                borderRadius: 4,
                                border: '1px solid rgba(226, 232, 240, 0.8)',
                                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                                boxShadow: '0 4px 20px -2px rgba(0,0,0,0.03)',
                                position: 'relative',
                            }}
                        >
                            <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                BUGÜNKÜ HARCAMA
                            </Typography>
                            <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', my: 1 }}>
                                ₺{dailyStats.totalSpent.toFixed(2)}
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                                    {dailyStats.tlPassageCount} Bakiye Geçişi Yapıldı
                                </Typography>
                                {dailyStats.abonmanCount > 0 && (
                                    <Chip
                                        icon={<ConfirmationNumberOutlined style={{ fontSize: '14px', color: '#16a34a' }} />}
                                        label={`${dailyStats.abonmanCount} Abonman Kullanımı`}
                                        size="small"
                                        sx={{
                                            bgcolor: '#f0fdf4',
                                            color: '#16a34a',
                                            fontWeight: 700,
                                            fontSize: '0.75rem',
                                            width: 'fit-content',
                                            height: '22px',
                                            border: '1px solid #bbf7d0',
                                        }}
                                    />
                                )}
                            </Box>
                            <Box sx={{ position: 'absolute', top: 22, right: 22, p: 1.2, bgcolor: '#fae8ff', color: '#c026d3', borderRadius: 3 }}>
                                <DirectionsBus fontSize="small" />
                            </Box>
                        </Paper>
                    </Box>
                    <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>Kartlarım</Typography>
                            <Button size="small" onClick={() => setActiveMenu('cards')} sx={{ fontWeight: 700, textTransform: 'none', color: '#4f46e5' }}>
                                Tümünü Yönet
                            </Button>
                        </Box>
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2.5 }}>
                            {cards.length === 0 ? (
                                <Paper elevation={0} sx={{ p: 4, textAlign: 'center', gridColumn: '1 / -1', bgcolor: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: 4 }}>
                                    <Typography variant="body2" color="text.secondary">Kayıtlı bir kartınız bulunmamaktadır.</Typography>
                                </Paper>
                            ) : (
                                cards.map((card, idx) => (
                                    <Paper
                                        key={card.id}
                                        elevation={0}
                                        sx={{
                                            p: 3.5,
                                            borderRadius: 4,
                                            color: 'white',
                                            background: idx % 2 === 0
                                                ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
                                                : 'linear-gradient(135deg, #312e81 0%, #4f46e5 100%)',
                                            boxShadow: '0 12px 25px -5px rgba(15, 23, 42, 0.25)',
                                            position: 'relative',
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                                            <Typography variant="caption" sx={{ fontWeight: 800, opacity: 0.9, letterSpacing: '1.5px' }}>
                                                {card.cardName?.toUpperCase() || 'SMARTKART PASS'}
                                            </Typography>
                                            <Nfc fontSize="small" sx={{ opacity: 0.8 }} />
                                        </Box>
                                        <Typography variant="h6" sx={{ fontFamily: 'monospace', letterSpacing: '3px', mb: 3 }}>
                                            **** **** **** {card.cardNumber?.slice(-4) || '4512'}
                                        </Typography>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                            <Box>
                                                <Typography variant="caption" sx={{ opacity: 0.7, display: 'block', fontWeight: 600 }}>Kalan Bakiye</Typography>
                                                <Typography variant="h5" sx={{ fontWeight: 800 }}>₺{(card.balance || 0).toFixed(2)}</Typography>
                                            </Box>
                                            <Button
                                                variant="contained"
                                                size="small"
                                                startIcon={<AddCard />}
                                                onClick={() => {
                                                    setTopUpCardId(card.id);
                                                    setActiveMenu('topup');
                                                }}
                                                sx={{
                                                    bgcolor: 'rgba(255,255,255,0.2)',
                                                    backdropFilter: 'blur(10px)',
                                                    fontWeight: 700,
                                                    textTransform: 'none',
                                                    borderRadius: 2.5,
                                                    '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                                                }}
                                            >
                                                Bakiye Yükle
                                            </Button>
                                        </Box>
                                    </Paper>
                                ))
                            )}
                        </Box>
                    </Box>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            borderRadius: 4,
                            bgcolor: '#e0e7ff',
                            border: '1px solid #c7d2fe',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2.5,
                        }}
                    >
                        <Box sx={{ p: 1.5, bgcolor: '#4f46e5', color: 'white', borderRadius: '50%', display: 'flex' }}>
                            <AutoAwesome />
                        </Box>
                        <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1e1b4b' }}>Akıllı Abonman Önerisi</Typography>
                            <Typography variant="body2" sx={{ color: '#3730a3', fontSize: '0.88rem', mt: 0.2 }}>
                                Sık kullandığınız rotalara göre, aylık abonman yüklemesi yaparak tekli basımlara kıyasla aylık yaklaşık <strong>₺1500-₺3000 </strong> tasarruf sağlayabilirsiniz.
                            </Typography>
                        </Box>
                    </Paper>
                </Box>
                <Paper elevation={0} sx={{ p: 3.5, borderRadius: 4, border: '1px solid #e2e8f0', height: 'fit-content' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>Son Hareketler</Typography>
                        <History color="action" />
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {loadingTransactions ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                                <CircularProgress size={30} />
                            </Box>
                        ) : transactions.length === 0 ? (
                            <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                                Henüz bir işlem hareketi bulunmuyor.
                            </Typography>
                        ) : (
                            transactions.slice(0, 5).map((item) => {
                                const rawType = [item.transactionType, item.type, item.description].filter(Boolean).join(' ').toLowerCase();
                                const isTopUp = rawType.includes('yukle') || rawType.includes('topup') || rawType.includes('deposit') || rawType.includes('dolum') || rawType.includes('kredi');
                                const isSubway = rawType.includes('metro');
                                const isTrain = rawType.includes('marmaray');
                                return (
                                    <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, borderRadius: 2.5, '&:hover': { bgcolor: '#f8fafc' } }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Box sx={{ p: 1.2, borderRadius: 2.5, bgcolor: isTopUp ? '#dcfce7' : isSubway || isTrain ? '#fef3c7' : '#e0e7ff', color: isTopUp ? '#16a34a' : isSubway || isTrain ? '#d97706' : '#4f46e5' }}>
                                                {isTopUp ? <AddCard /> : isTrain ? <Train /> : isSubway ? <Subway /> : <DirectionsBus />}
                                            </Box>
                                            <Box>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.85rem' }}>{item.transactionType || 'Geçiş İşlemi'}</Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {item.createdDate ? new Date(item.createdDate).toLocaleString('tr-TR') : '-'}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Box sx={{ textAlign: 'right' }}>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: isTopUp ? '#16a34a' : '#dc2626' }}>
                                                {isTopUp ? `+ ₺${Math.abs(item.amount || 0).toFixed(2)}` : `- ₺${Math.abs(item.amount || 0).toFixed(2)}`}
                                            </Typography>
                                            {item.balanceAfter !== undefined && (
                                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                                    ₺{item.balanceAfter.toFixed(2)} kaldı
                                                </Typography>
                                            )}
                                        </Box>
                                    </Box>
                                );
                            })
                        )}
                    </Box>
                    <Button fullWidth variant="text" onClick={() => setActiveMenu('history')} sx={{ mt: 3, fontWeight: 700, textTransform: 'none', color: '#4f46e5' }}>
                        Tüm Geçmişi Görüntüle ➔
                    </Button>
                </Paper>
            </Box>
        </Box>
    );

    const renderCards = () => (
        <Box sx={{ width: '100%' }}>
            <PageHeader
                title="Kartlarım & Abonman Yönetimi"
                subtitle="Tanımlı tüm fiziki ve dijital kartlarınızı, abonman kullanım kotalarınızı tek ekrandan yönetin."
                badge="KART YÖNETİMİ"
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
                <Button
                    variant="contained"
                    startIcon={<AddCard />}
                    onClick={() => setActiveMenu('register')}
                    sx={{
                        background: 'linear-gradient(135deg, #4f46e5 0%, #2563eb 100%)',
                        fontWeight: 700,
                        borderRadius: 3,
                        textTransform: 'none',
                        px: 3,
                        py: 1.2,
                        boxShadow: '0 8px 20px -4px rgba(79, 70, 229, 0.4)',
                    }}
                >
                    + Yeni Kart Başvurusu
                </Button>
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 3 }}>
                {cards.map((card, idx) => {
                    const nameLower = (card.cardName || '').toLowerCase();
                    const isStudent = nameLower.includes('öğrenci') || nameLower.includes('ogrenci') || nameLower.includes('student') || idx === 0;
                    return (
                        <Paper elevation={0} key={card.id} sx={{ p: 3.5, borderRadius: 4, border: '1px solid #e2e8f0', bgcolor: '#ffffff', position: 'relative' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Avatar sx={{ bgcolor: isStudent ? '#e0e7ff' : '#f0fdf4', color: isStudent ? '#4f46e5' : '#16a34a' }}>
                                        {isStudent ? <School /> : <CreditCard />}
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1.05rem' }}>
                                            {card.cardName || (isStudent ? 'Öğrenci İstanbulkart' : 'Tam İstanbulkart')}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                                            Seri No: **** {card.cardNumber?.slice(-4) || '9821'}
                                        </Typography>
                                    </Box>
                                </Box>
                                <Chip label="Aktif" color="success" size="small" sx={{ fontWeight: 800, borderRadius: 1.5 }} />
                            </Box>
                            <Divider sx={{ my: 2 }} />
                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
                                <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 3, border: '1px solid #f1f5f9' }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>BAKİYE</Typography>
                                    <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', mt: 0.5 }}>
                                        ₺{(card.balance || 0).toFixed(2)}
                                    </Typography>
                                </Box>
                                <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 3, border: '1px solid #f1f5f9' }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>ABONMAN KOTASI</Typography>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: isStudent ? '#4f46e5' : '#64748b', mt: 0.5 }}>
                                        {isStudent ? '142 / 200 Basım' : 'Tanımlı Değil'}
                                    </Typography>
                                    {isStudent && <Typography variant="caption" color="text.secondary">Son: 30 Mayıs 2026</Typography>}
                                </Box>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1.5 }}>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    startIcon={<AccountBalanceWallet />}
                                    onClick={() => {
                                        setTopUpCardId(card.id);
                                        setActiveMenu('topup');
                                    }}
                                    sx={{ bgcolor: '#4f46e5', fontWeight: 700, borderRadius: 2.5, textTransform: 'none' }}
                                >
                                    Bakiye Yükle
                                </Button>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    startIcon={<History />}
                                    onClick={() => {
                                        setSelectedCardId(card.id);
                                        setActiveMenu('history');
                                    }}
                                    sx={{ borderColor: '#cbd5e1', color: '#0f172a', fontWeight: 700, borderRadius: 2.5, textTransform: 'none' }}
                                >
                                    Hareketler
                                </Button>
                            </Box>
                        </Paper>
                    );
                })}
            </Box>
        </Box>
    );

    const renderTopUp = () => {
        const selectedCard = cards.find((c) => c.id === topUpCardId) || cards[0];
        const finalAmount = customAmount ? parseFloat(customAmount) || 0 : topUpAmount;
        return (
            <Box sx={{ width: '100%' }}>
                <PageHeader
                    title="Bakiye & Abonman Yükleme"
                    subtitle="3D Secure altyapısıyla güvenli bir şekilde kartınıza anında bakiye aktarın."
                    badge="GÜVENLİ ÖDEME"
                />
                {topUpError && <Alert severity="error" sx={{ mb: 3 }}>{topUpError}</Alert>}
                {topUpSuccess && <Alert severity="success" icon={<CheckCircle />} sx={{ mb: 3 }}>{topUpSuccess}</Alert>}
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '7fr 5fr' }, gap: 3.5 }}>
                    <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', mb: 2 }}>
                            1. Yüklenecek Kartı Seçin
                        </Typography>
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2, mb: 4 }}>
                            {cards.map((c) => {
                                const isSelected = topUpCardId === c.id;
                                return (
                                    <Paper
                                        key={c.id}
                                        onClick={() => setTopUpCardId(c.id)}
                                        elevation={0}
                                        sx={{
                                            p: 2.5,
                                            borderRadius: 3,
                                            cursor: 'pointer',
                                            border: isSelected ? '2px solid #4f46e5' : '1px solid #e2e8f0',
                                            bgcolor: isSelected ? '#e0e7ff' : '#ffffff',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            transition: 'all 0.2s',
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <CreditCard sx={{ color: isSelected ? '#4f46e5' : '#64748b' }} />
                                            <Box>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a' }}>{c.cardName || 'Smart Kart'}</Typography>
                                                <Typography variant="caption" color="text.secondary">Bakiye: ₺{(c.balance || 0).toFixed(2)}</Typography>
                                            </Box>
                                        </Box>
                                        {isSelected && <CheckCircle sx={{ color: '#4f46e5' }} />}
                                    </Paper>
                                );
                            })}
                        </Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', mb: 2 }}>
                            2. Yükleme Tutarını Belirleyin
                        </Typography>
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1.5, mb: 3 }}>
                            {[50, 100, 200, 500].map((amt) => (
                                <Button
                                    key={amt}
                                    variant={topUpAmount === amt && !customAmount ? 'contained' : 'outlined'}
                                    onClick={() => {
                                        setTopUpAmount(amt);
                                        setCustomAmount('');
                                    }}
                                    sx={{
                                        py: 1.8,
                                        borderRadius: 3,
                                        fontWeight: 800,
                                        fontSize: '1rem',
                                        textTransform: 'none',
                                        borderColor: '#cbd5e1',
                                        bgcolor: topUpAmount === amt && !customAmount ? '#4f46e5' : 'transparent',
                                        '&:hover': { bgcolor: topUpAmount === amt && !customAmount ? '#4338ca' : '#f8fafc' },
                                    }}
                                >
                                    ₺{amt}
                                </Button>
                            ))}
                        </Box>
                        <TextField
                            fullWidth
                            label="Özel Tutar Girin"
                            placeholder="Örn: 150"
                            value={customAmount}
                            onChange={(e) => setCustomAmount(e.target.value)}
                            slotProps={{
                                input: {
                                    startAdornment: <InputAdornment position="start">₺</InputAdornment>,
                                },
                            }}
                            sx={{ mb: 4 }}
                        />
                        <Button
                            fullWidth
                            size="large"
                            variant="contained"
                            onClick={handleTopUpSubmit}
                            disabled={topUpLoading}
                            startIcon={<AccountBalanceWallet />}
                            sx={{
                                py: 2,
                                borderRadius: 3,
                                fontWeight: 800,
                                fontSize: '1.05rem',
                                background: 'linear-gradient(135deg, #4f46e5 0%, #2563eb 100%)',
                                textTransform: 'none',
                                boxShadow: '0 8px 25px -5px rgba(79, 70, 229, 0.4)',
                            }}
                        >
                            {topUpLoading ? <CircularProgress size={26} color="inherit" /> : `₺${finalAmount.toFixed(2)} Yüklemeyi Onayla`}
                        </Button>
                    </Paper>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 4,
                                borderRadius: 4,
                                color: 'white',
                                background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
                                boxShadow: '0 12px 30px -5px rgba(15, 23, 42, 0.3)',
                            }}
                        >
                            <Typography variant="overline" sx={{ color: '#a5b4fc', letterSpacing: '2px', fontWeight: 700 }}>
                                SEÇİLİ KART ÖNİZLEMESİ
                            </Typography>
                            <Typography variant="h5" sx={{ fontWeight: 800, mt: 1, mb: 3 }}>
                                {selectedCard?.cardName || 'Smart Kart'}
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.7 }}>Kart Seri Numarası</Typography>
                            <Typography variant="h6" sx={{ fontFamily: 'monospace', letterSpacing: '2px', mb: 3 }}>
                                **** **** **** {selectedCard?.cardNumber?.slice(-4) || '----'}
                            </Typography>
                            <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', my: 2 }} />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body2" sx={{ opacity: 0.8 }}>Mevcut Bakiye:</Typography>
                                <Typography variant="h6" sx={{ fontWeight: 800 }}>₺{(selectedCard?.balance || 0).toFixed(2)}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                                <Typography variant="body2" sx={{ opacity: 0.8 }}>Yüklenecek Tutar:</Typography>
                                <Typography variant="h6" sx={{ fontWeight: 800, color: '#34d399' }}>+ ₺{finalAmount.toFixed(2)}</Typography>
                            </Box>
                        </Paper>
                        <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                                <Security sx={{ color: '#16a34a' }} />
                                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>256-Bit SSL Güvenli Ödeme</Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                                Yapacağınız bakiye yüklemeleri bankanızın 3D Secure onay adımı ile gerçekleştirilir ve anında kartınıza tanımlanır.
                            </Typography>
                        </Paper>
                    </Box>
                </Box>
            </Box>
        );
    };

    const renderHistory = () => (
        <Box sx={{ width: '100%' }}>
            <PageHeader
                title="İşlem Geçmişi & Seyahat Detayları"
                subtitle="Hattınızda gerçekleşen tüm basımları, aktarma indirimlerini ve bakiye dökümlerini listeleyin."
                badge="DÖKÜM BİLGİSİ"
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>Seyahat ve Yükleme Hareketleri</Typography>
                <FormControl size="small" sx={{ minWidth: 240, bgcolor: 'white' }}>
                    <InputLabel>Kart Filtrele</InputLabel>
                    <Select value={selectedCardId} label="Kart Filtrele" onChange={(e) => setSelectedCardId(e.target.value)}>
                        <MenuItem value="">Tüm Kartlar</MenuItem>
                        {cards.map((c) => (
                            <MenuItem key={c.id} value={c.id}>{c.cardName || 'Smart Card'}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>
            <Paper elevation={0} sx={{ p: 3.5, borderRadius: 4, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
                {loadingTransactions ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                        <CircularProgress color="primary" />
                    </Box>
                ) : filteredTransactions.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                        Aramanıza veya seçili karta ait işlem hareketi bulunamadı.
                    </Typography>
                ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        {filteredTransactions.map((item) => {
                            const rawType = [item.transactionType, item.type, item.description].filter(Boolean).join(' ').toLowerCase();
                            const isTopUp = rawType.includes('yukle') || rawType.includes('topup') || rawType.includes('deposit') || rawType.includes('dolum') || rawType.includes('kredi');
                            const isSubway = rawType.includes('metro');
                            const isTrain = rawType.includes('marmaray');
                            return (
                                <Paper
                                    key={item.id}
                                    elevation={0}
                                    sx={{
                                        p: 2.5,
                                        borderRadius: 3,
                                        border: '1px solid #f1f5f9',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        '&:hover': { bgcolor: '#f8fafc', borderColor: '#e2e8f0' },
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Box
                                            sx={{
                                                p: 1.5,
                                                borderRadius: 3,
                                                bgcolor: isTopUp ? '#dcfce7' : isSubway || isTrain ? '#fef3c7' : '#e0e7ff',
                                                color: isTopUp ? '#16a34a' : isSubway || isTrain ? '#d97706' : '#4f46e5',
                                            }}
                                        >
                                            {isTopUp ? <AddCard /> : isTrain ? <Train /> : isSubway ? <Subway /> : <DirectionsBus />}
                                        </Box>
                                        <Box>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a' }}>
                                                {item.transactionType || 'Geçiş İşlemi'}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {item.createdDate ? new Date(item.createdDate).toLocaleString('tr-TR') : '-'}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Box sx={{ textAlign: 'right' }}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: isTopUp ? '#16a34a' : '#dc2626' }}>
                                            {isTopUp ? `+ ₺${Math.abs(item.amount || 0).toFixed(2)}` : `- ₺${Math.abs(item.amount || 0).toFixed(2)}`}
                                        </Typography>
                                        {item.balanceAfter !== undefined && (
                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                                Kalan Bakiye: ₺{item.balanceAfter.toFixed(2)}
                                            </Typography>
                                        )}
                                    </Box>
                                </Paper>
                            );
                        })}
                    </Box>
                )}
            </Paper>
        </Box>
    );

    // Dinamik Veri Çeken Güncellenmiş Tarife Ücretleri Alanı
    const renderFares = () => (
        <Box sx={{ width: '100%' }}>
            <PageHeader
                title="Güncel Kart ve Ücret Tarifeleri (6 Kart Tipi)"
                subtitle="Sistemde tanımlı tüm kart türleri ve geçerli aylık abonman / indirim koşulları."
                badge="GÜNCEL TARİFE"
            />
            {loadingFares ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress color="primary" />
                </Box>
            ) : fareRates.length === 0 ? (
                <Paper elevation={0} sx={{ p: 4, textAlign: 'center', bgcolor: '#ffffff', borderRadius: 4, border: '1px solid #e2e8f0' }}>
                    <Typography variant="body2" color="text.secondary">Tarife bilgisi bulunamadı.</Typography>
                </Paper>
            ) : (
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 3.5 }}>
                    {fareRates.map((fare) => {
                        const style = getFareStyle(fare.type || fare.iconType);
                        return (
                            <Paper
                                key={fare.id || fare.title}
                                elevation={0}
                                sx={{
                                    p: 3.5,
                                    borderRadius: 4,
                                    border: style.border,
                                    bgcolor: '#ffffff',
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                                    <Avatar sx={{ bgcolor: style.avatarBg, color: style.avatarColor }}>
                                        {style.icon}
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h6" sx={{ fontWeight: 800 }}>{fare.title}</Typography>
                                        <Typography variant="caption" color="text.secondary">{fare.subtitle}</Typography>
                                    </Box>
                                </Box>
                                <Divider sx={{ my: 2 }} />
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    <Typography variant="body2" color="text.secondary">{fare.packageInfo}</Typography>
                                    <Box sx={{ p: 2, bgcolor: style.boxBg, borderRadius: 3, mt: 1 }}>
                                        <Typography variant="caption" sx={{ fontWeight: 700, color: style.badgeColor }}>
                                            {fare.badgeText}
                                        </Typography>
                                        <Typography variant="h5" sx={{ fontWeight: 800, color: style.priceColor, mt: 0.5 }}>
                                            {fare.formattedPrice || `₺${(fare.price || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Paper>
                        );
                    })}
                </Box>
            )}
        </Box>
    );

    const renderNewCardRequest = () => (
        <Box sx={{ width: '100%' }}>
            <PageHeader
                title="Yeni Ulaşım Kartı Başvurusu"
                subtitle="Adınıza tanımlı dijital veya adresinize kargolanacak yeni kart başvurusunu anında oluşturun."
                badge="BAŞVURU MERKEZİ"
            />
            {applySuccess && (
                <Alert severity="success" icon={<AssignmentTurnedIn />} sx={{ mb: 3 }}>
                    Başvurunuz ve yüklediğiniz belgeler başarıyla alındı! İnceleme sonrası kartınız adresinize kargolanacaktır.
                </Alert>
            )}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '7fr 5fr' }, gap: 3.5 }}>
                <Paper elevation={0} component="form" onSubmit={handleCardApplySubmit} sx={{ p: 4, borderRadius: 4, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, mb: 3, color: '#0f172a' }}>Kişisel Bilgiler & Kart Tercihi</Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5 }}>
                        {/* 6 Kart Tipi Seçim Kutusu */}
                        <Box sx={{ gridColumn: '1 / -1' }}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Başvuru Yapılacak Kart Türü (6 Çeşit)</InputLabel>
                                <Select value={cardType} label="Başvuru Yapılacak Kart Türü (6 Çeşit)" onChange={(e) => setCardType(e.target.value)}>
                                    <MenuItem value="tam">1. Standard İstanbulkart (Tam)</MenuItem>
                                    <MenuItem value="ogrenci">2. Öğrenci İndirimli Kart (Student)</MenuItem>
                                    <MenuItem value="sosyal">3. Sosyal / Öğretmen Kartı (Discounted)</MenuItem>
                                    <MenuItem value="engelli">4. Engelli Ulaşım Kartı (%100 Ücretsiz)</MenuItem>
                                    <MenuItem value="anne">5. Anne Kartı (0-4 Yaş Çocuk / 150 Ücretsiz Kota)</MenuItem>
                                    <MenuItem value="65ustu">6. +65 Yaş Ücretsiz Kartı</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                        <Box>
                            <TextField fullWidth size="small" required label="Ad Soyad" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                        </Box>
                        <Box>
                            <TextField fullWidth size="small" required label="T.C. Kimlik No" value={tcNo} onChange={(e) => setTcNo(e.target.value)} />
                        </Box>
                        {/* Eklenen E-Posta Kutucuğu */}
                        <Box sx={{ gridColumn: '1 / -1' }}>
                            <TextField
                                fullWidth
                                size="small"
                                required
                                type="email"
                                label="E-Posta Adresi"
                                placeholder="örnek: name@domain.com"
                                value={applicantEmail}
                                onChange={(e) => setApplicantEmail(e.target.value)}
                            />
                        </Box>
                        {cardType === 'ogrenci' && (
                            <Box sx={{ gridColumn: '1 / -1' }}>
                                <TextField fullWidth size="small" required label="Öğrenci / Okul Numarası" value={studentNo} onChange={(e) => setStudentNo(e.target.value)} />
                            </Box>
                        )}
                        {/* Tam (Standard) Kart Hariç Tüm Kart Tiplerinde Gerçek Dosya Yükleme Kutusu */}
                        {cardType !== 'tam' && (
                            <Box sx={{ gridColumn: '1 / -1' }}>
                                <Typography variant="body2" sx={{ mb: 1, fontWeight: 700, color: '#334155' }}>
                                    Başvuru Belgesi Yükleyin {cardType === 'ogrenci' ? '(Öğrenci Belgesi / Öğrenci Kimliği)' : cardType === 'engelli' ? '(Sağlık Kurulu Raporu)' : cardType === 'anne' ? '(Çocuk Kimlik / Nüfus Kayıt)' : '(İlgili Kimlik Belgesi)'}
                                </Typography>
                                <Button
                                    component="label"
                                    variant="outlined"
                                    startIcon={<CloudUpload />}
                                    sx={{
                                        borderRadius: 3,
                                        textTransform: 'none',
                                        fontWeight: 700,
                                        borderColor: '#cbd5e1',
                                        color: '#0f172a',
                                        py: 1.5,
                                        px: 2,
                                        width: '100%',
                                        justifyContent: 'flex-start',
                                        bgcolor: '#f8fafc',
                                        '&:hover': { bgcolor: '#f1f5f9' },
                                    }}
                                >
                                    {selectedFile ? `Seçilen Belge: ${selectedFile.name}` : 'Cihazdan Dosya Seçin (PDF, JPG, PNG)'}
                                    <input
                                        type="file"
                                        hidden
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={(e) => {
                                            if (e.target.files && e.target.files[0]) {
                                                setSelectedFile(e.target.files[0]);
                                            }
                                        }}
                                    />
                                </Button>
                                {selectedFile && (
                                    <Typography variant="caption" sx={{ mt: 0.8, display: 'block', fontWeight: 700, color: '#16a34a' }}>
                                        ✓ Belge Eklendi: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                                    </Typography>
                                )}
                            </Box>
                        )}
                        {/* Teslimat Tercihi */}
                        <Box sx={{ gridColumn: '1 / -1' }}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Teslimat Tercihi</InputLabel>
                                <Select value={deliveryMethod} label="Teslimat Tercihi" onChange={(e) => setDeliveryMethod(e.target.value)}>
                                    <MenuItem value="kargo">Adrese Kargo Teslimatı (Ücretsiz)</MenuItem>
                                    <MenuItem value="gise">Başvuru Merkezinden Kendim Teslim Alacağım</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                        {/* Koşullu Dinamik Teslimat Adresi Kutusu */}
                        {deliveryMethod === 'kargo' && (
                            <Box sx={{ gridColumn: '1 / -1' }}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    required
                                    multiline
                                    rows={3}
                                    label="Teslimat Adresi"
                                    placeholder="Lütfen il, ilçe, mahalle, sokak, bina ve daire no içeren açık adresinizi giriniz..."
                                    value={deliveryAddress}
                                    onChange={(e) => setDeliveryAddress(e.target.value)}
                                />
                            </Box>
                        )}
                        <Box sx={{ gridColumn: '1 / -1', mt: 1 }}>
                            <Button
                                fullWidth
                                type="submit"
                                variant="contained"
                                size="large"
                                startIcon={<Send />}
                                sx={{
                                    py: 1.8,
                                    borderRadius: 3,
                                    background: 'linear-gradient(135deg, #4f46e5 0%, #2563eb 100%)',
                                    fontWeight: 800,
                                    fontSize: '1rem',
                                    textTransform: 'none',
                                    boxShadow: '0 8px 20px -4px rgba(79, 70, 229, 0.4)',
                                }}
                            >
                                Başvuruyu Tamamla ve Gönder
                            </Button>
                        </Box>
                    </Box>
                </Paper>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 4,
                            borderRadius: 4,
                            color: 'white',
                            background: 'linear-gradient(135deg, #1e1b4b 0%, #4338ca 100%)',
                            boxShadow: '0 12px 30px -5px rgba(67, 56, 202, 0.3)',
                        }}
                    >
                        <Typography variant="overline" sx={{ color: '#c7d2fe', letterSpacing: '2px', fontWeight: 700 }}>
                            CANLI DİJİTAL KART ÖNİZLEMESİ
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 800, mt: 1, mb: 1 }}>
                            {fullName || 'AD SOYAD'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#a5b4fc', display: 'block', mb: 2 }}>
                            {applicantEmail || 'email@domain.com'}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.7 }}>Kart Tipi</Typography>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 3, textTransform: 'uppercase' }}>
                            {cardType === 'ogrenci' ? 'ÖĞRENCİ İSTANBULKART'
                                : cardType === 'sosyal' ? 'SOSYAL İNDİRİMLİ KART'
                                    : cardType === 'engelli' ? 'ENGELLİ ULAŞIM KART'
                                        : cardType === 'anne' ? 'ANNE KART (150 KOTA)'
                                            : cardType === '65ustu' ? '+65 YAŞ ÜCRETSİZ KART'
                                                : 'TAM İSTANBULKART'}
                        </Typography>
                        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', my: 2 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" sx={{ opacity: 0.8 }}>Teslimat Yöntemi:</Typography>
                            <Chip label={deliveryMethod === 'kargo' ? 'Adrese Kargo' : 'Gişe Teslim'} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 700 }} />
                        </Box>
                    </Paper>
                </Box>
            </Box>
        </Box>
    );

    const renderProfile = () => {
        const displayUserName = profileName || userName || 'Kullanıcı';
        return (
            <Box sx={{ width: '100%' }}>
                <PageHeader
                    title="Profilim & Hesap Ayarları"
                    subtitle="Kişisel bilgilerinizi, iletişim tercihlerinizi ve hesap güvenliğinizi bu panelden kolayca güncelleyin."
                    badge="PROFİL YÖNETİMİ"
                />
                {profileUpdateSuccess && (
                    <Alert severity="success" icon={<CheckCircle />} sx={{ mb: 3 }}>
                        {profileUpdateSuccess}
                    </Alert>
                )}
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '4fr 8fr' }, gap: 3.5 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid #e2e8f0', bgcolor: '#ffffff', textAlign: 'center' }}>
                            <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
                                <Avatar
                                    sx={{
                                        width: 100,
                                        height: 100,
                                        bgcolor: '#4f46e5',
                                        fontSize: '2.5rem',
                                        fontWeight: 800,
                                        mx: 'auto',
                                        boxShadow: '0 8px 25px -5px rgba(79, 70, 229, 0.4)',
                                    }}
                                >
                                    {displayUserName ? displayUserName[0].toUpperCase() : 'U'}
                                </Avatar>
                                <IconButton
                                    size="small"
                                    sx={{
                                        position: 'absolute',
                                        bottom: 0,
                                        right: 0,
                                        bgcolor: '#0f172a',
                                        color: 'white',
                                        '&:hover': { bgcolor: '#1e293b' },
                                    }}
                                >
                                    <Edit fontSize="small" />
                                </IconButton>
                            </Box>
                            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
                                {displayUserName}
                            </Typography>
                            <Chip
                                icon={<CheckCircle style={{ fontSize: '14px', color: '#16a34a' }} />}
                                label="Onaylı Yolcu Hesabı"
                                size="small"
                                sx={{ bgcolor: '#f0fdf4', color: '#16a34a', fontWeight: 700, mt: 1, mb: 3 }}
                            />
                            <Divider sx={{ my: 2 }} />
                            <Box sx={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 1.8 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Email fontSize="small" sx={{ color: '#64748b' }} />
                                    <Typography variant="body2" sx={{ fontWeight: 600, color: profileEmail ? '#334155' : '#94a3b8' }}>
                                        {profileEmail || 'E-posta belirtilmemiş'}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Phone fontSize="small" sx={{ color: '#64748b' }} />
                                    <Typography variant="body2" sx={{ fontWeight: 600, color: profilePhone ? '#334155' : '#94a3b8' }}>
                                        {profilePhone || 'Telefon belirtilmemiş'}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <LocationOn fontSize="small" sx={{ color: '#64748b' }} />
                                    <Typography variant="body2" sx={{ fontWeight: 600, color: profileCity ? '#334155' : '#94a3b8' }}>
                                        {profileCity || 'Şehir/Adres belirtilmemiş'}
                                    </Typography>
                                </Box>
                            </Box>
                        </Paper>
                        <Paper elevation={0} sx={{ p: 3, borderRadius: 4, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', mb: 1.5 }}>
                                Hesap Özet Bilgileri
                            </Typography>
                            <Stack spacing={1}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="caption" color="text.secondary">Kayıtlı Kart Sayısı:</Typography>
                                    <Typography variant="caption" sx={{ fontWeight: 800 }}>{cards.length} Adet</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="caption" color="text.secondary">Toplam Bakiye:</Typography>
                                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#16a34a' }}>₺{totalBalance.toFixed(2)}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="caption" color="text.secondary">Hesap Türü:</Typography>
                                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#4f46e5' }}>Bireysel Yolcu</Typography>
                                </Box>
                            </Stack>
                        </Paper>
                    </Box>
                    <Paper elevation={0} component="form" onSubmit={handleProfileSave} sx={{ p: 4, borderRadius: 4, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
                        <Typography variant="h6" sx={{ fontWeight: 800, mb: 3, color: '#0f172a' }}>
                            Kişisel Bilgileri Düzenle
                        </Typography>
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5, mb: 4 }}>
                            <TextField
                                label="Ad Soyad"
                                value={profileName}
                                onChange={(e) => setProfileName(e.target.value)}
                                placeholder="Adınızı ve soyadınızı girin"
                                size="small"
                                fullWidth
                            />
                            <TextField
                                label="T.C. Kimlik No"
                                value={tcNo}
                                onChange={(e) => setTcNo(e.target.value)}
                                placeholder="11 haneli T.C. Kimlik No"
                                size="small"
                                fullWidth
                            />
                            <TextField
                                label="E-Posta Adresi"
                                value={profileEmail}
                                onChange={(e) => setProfileEmail(e.target.value)}
                                placeholder="Örn: ornek@email.com"
                                size="small"
                                fullWidth
                                type="email"
                            />
                            <TextField
                                label="Telefon Numarası"
                                value={profilePhone}
                                onChange={(e) => setProfilePhone(e.target.value)}
                                placeholder="Örn: +90 5xx xxx xx xx"
                                size="small"
                                fullWidth
                            />
                            <TextField
                                label="Şehir / Adres"
                                value={profileCity}
                                onChange={(e) => setProfileCity(e.target.value)}
                                placeholder="İl / İlçe veya açık adresiniz"
                                size="small"
                                fullWidth
                                sx={{ gridColumn: '1 / -1' }}
                            />
                        </Box>
                        <Divider sx={{ my: 3 }} />
                        <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, color: '#0f172a' }}>
                            Güvenlik & Bildirim Tercihleri
                        </Typography>
                        <Stack spacing={2} sx={{ mb: 4 }}>
                            <FormControlLabel
                                control={<Switch checked={emailNotify} onChange={(e) => setEmailNotify(e.target.checked)} color="primary" />}
                                label={
                                    <Box>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>E-Posta Bildirimleri</Typography>
                                        <Typography variant="caption" color="text.secondary">Bakiye yükleme ve dekont bilgileri e-posta adresinize gönderilsin.</Typography>
                                    </Box>
                                }
                            />
                            <FormControlLabel
                                control={<Switch checked={smsNotify} onChange={(e) => setSmsNotify(e.target.checked)} color="primary" />}
                                label={
                                    <Box>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>SMS Bakiye Uyarıları</Typography>
                                        <Typography variant="caption" color="text.secondary">Bakiyeniz ₺20 altına düştüğünde uyarı SMS'i alın.</Typography>
                                    </Box>
                                }
                            />
                            <FormControlLabel
                                control={<Switch checked={twoFactor} onChange={(e) => setTwoFactor(e.target.checked)} color="primary" />}
                                label={
                                    <Box>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>İki Adımlı Doğrulama (2FA)</Typography>
                                        <Typography variant="caption" color="text.secondary">Giriş yaparken telefonunuza SMS doğrulama kodu gönderilir.</Typography>
                                    </Box>
                                }
                            />
                        </Stack>
                        <Button
                            type="submit"
                            variant="contained"
                            size="large"
                            startIcon={<Check />}
                            sx={{
                                py: 1.5,
                                px: 4,
                                borderRadius: 3,
                                background: 'linear-gradient(135deg, #4f46e5 0%, #2563eb 100%)',
                                fontWeight: 800,
                                textTransform: 'none',
                            }}
                        >
                            Profil Değişikliklerini Kaydet
                        </Button>
                    </Paper>
                </Box>
            </Box>
        );
    };

    return (
        <Box sx={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden', bgcolor: '#f8fafc', margin: 0, padding: 0 }}>
            {/* Sol Kenar Çubuğu (Sidebar) */}
            <Box
                sx={{
                    width: 280,
                    minWidth: 280,
                    height: '100%',
                    background: 'linear-gradient(180deg, #0f172a 0%, #0b0f19 100%)',
                    color: 'white',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    p: 3,
                    borderRight: '1px solid rgba(255,255,255,0.05)',
                    boxSizing: 'border-box',
                }}
            >
                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.8, mb: 4, px: 1 }}>
                        <Box
                            sx={{
                                width: 42,
                                height: 42,
                                borderRadius: 3,
                                background: 'linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
                            }}
                        >
                            <DirectionsBus sx={{ color: 'white', fontSize: 24 }} />
                        </Box>
                        <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.2, letterSpacing: '-0.3px', fontSize: '1.05rem' }}>
                                Smart Transit
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600 }}>
                                Passenger Portal
                            </Typography>
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {menuItems.map((item) => {
                            const isActive = activeMenu === item.id;
                            return (
                                <Button
                                    key={item.id}
                                    fullWidth
                                    startIcon={item.icon}
                                    onClick={() => setActiveMenu(item.id)}
                                    sx={{
                                        justifyContent: 'flex-start',
                                        py: 1.4,
                                        px: 2.5,
                                        borderRadius: 3,
                                        textTransform: 'none',
                                        fontWeight: isActive ? 700 : 500,
                                        fontSize: '0.92rem',
                                        color: isActive ? '#ffffff' : '#94a3b8',
                                        background: isActive ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(59, 130, 246, 0.1) 100%)' : 'transparent',
                                        borderLeft: isActive ? '4px solid #6366f1' : '4px solid transparent',
                                        '&:hover': { bgcolor: 'rgba(255,255,255,0.05)', color: '#ffffff' },
                                    }}
                                >
                                    {item.label}
                                </Button>
                            );
                        })}
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Button
                        fullWidth
                        variant="contained"
                        startIcon={<AddCard />}
                        onClick={() => setActiveMenu('register')}
                        sx={{
                            py: 1.4,
                            borderRadius: 3,
                            fontWeight: 700,
                            textTransform: 'none',
                            background: 'linear-gradient(135deg, #4f46e5 0%, #2563eb 100%)',
                            boxShadow: '0 4px 15px rgba(79, 70, 229, 0.3)',
                            mb: 1.5,
                        }}
                    >
                        + Yeni Kayıt Oluştur
                    </Button>
                    <Button
                        fullWidth
                        startIcon={<HelpOutlined fontSize="small" />}
                        onClick={() => setActiveMenu('support')}
                        sx={{
                            justifyContent: 'flex-start',
                            color: activeMenu === 'support' ? '#ffffff' : '#94a3b8',
                            background: activeMenu === 'support' ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(59, 130, 246, 0.1) 100%)' : 'transparent',
                            borderLeft: activeMenu === 'support' ? '4px solid #6366f1' : '4px solid transparent',
                            py: 1.2,
                            px: 2.5,
                            borderRadius: 3,
                            textTransform: 'none',
                            fontSize: '0.85rem',
                            fontWeight: activeMenu === 'support' ? 700 : 500,
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.05)', color: '#ffffff' },
                        }}
                    >
                        Destek Al
                    </Button>
                    <Button
                        fullWidth
                        startIcon={<Logout fontSize="small" />}
                        onClick={handleLogout}
                        sx={{ justifyContent: 'flex-start', color: '#ef4444', textTransform: 'none', fontSize: '0.85rem', px: 2.5 }}
                    >
                        Oturumu Kapat
                    </Button>
                </Box>
            </Box>
            {/* Sağ Ana İçerik ve Üst Navbar */}
            <Box sx={{ flexGrow: 1, width: 'calc(100vw - 280px)', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {/* Üst Navbar */}
                <Box sx={{ height: 70, minHeight: 70, width: '100%', bgcolor: '#ffffff', borderBottom: '1px solid #e2e8f0', px: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxSizing: 'border-box' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <TextField
                            size="small"
                            placeholder="İşlem, durak veya kart ara..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            sx={{ width: 320, '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: '#f8fafc' } }}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Search fontSize="small" color="action" />
                                        </InputAdornment>
                                    ),
                                },
                            }}
                        />
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <IconButton
                            onClick={(e) => setNotificationAnchorEl(e.currentTarget)}
                            sx={{ bgcolor: '#f1f5f9' }}
                        >
                            <Badge badgeContent={unreadNotificationsCount} color="error">
                                <Notifications fontSize="small" />
                            </Badge>
                        </IconButton>
                        <Popover
                            open={Boolean(notificationAnchorEl)}
                            anchorEl={notificationAnchorEl}
                            onClose={() => setNotificationAnchorEl(null)}
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                            slotProps={{
                                paper: {
                                    sx: { width: 360, p: 2, borderRadius: 3, boxShadow: '0 10px 30px rgba(0,0,0,0.15)' },
                                },
                            }}
                        >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, px: 1 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a' }}>
                                    Bildirimler
                                </Typography>
                                {unreadNotificationsCount > 0 && (
                                    <Button
                                        size="small"
                                        startIcon={<DoneAll fontSize="small" />}
                                        onClick={markAllNotificationsAsRead}
                                        sx={{ textTransform: 'none', fontSize: '0.75rem', fontWeight: 700 }}
                                    >
                                        Tümünü Okundu İşaretle
                                    </Button>
                                )}
                            </Box>
                            <Divider sx={{ mb: 1 }} />
                            {notificationsList.length === 0 ? (
                                <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                                    Bildirim bulunmuyor.
                                </Typography>
                            ) : (
                                <List disablePadding>
                                    {notificationsList.map((notif) => (
                                        <ListItem
                                            key={notif.id}
                                            alignItems="flex-start"
                                            sx={{
                                                p: 1.5,
                                                borderRadius: 2,
                                                mb: 0.5,
                                                bgcolor: notif.read ? 'transparent' : '#f0fdf4',
                                                border: notif.read ? '1px solid transparent' : '1px solid #bbf7d0',
                                            }}
                                        >
                                            <ListItemAvatar sx={{ minWidth: 40, mt: 0.5 }}>
                                                {notif.type === 'success' ? (
                                                    <Avatar sx={{ width: 28, height: 28, bgcolor: '#dcfce7', color: '#16a34a' }}>
                                                        <CheckCircle fontSize="small" />
                                                    </Avatar>
                                                ) : notif.type === 'warning' ? (
                                                    <Avatar sx={{ width: 28, height: 28, bgcolor: '#fef3c7', color: '#d97706' }}>
                                                        <Warning fontSize="small" />
                                                    </Avatar>
                                                ) : (
                                                    <Avatar sx={{ width: 28, height: 28, bgcolor: '#e0e7ff', color: '#4f46e5' }}>
                                                        <Info fontSize="small" />
                                                    </Avatar>
                                                )}
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.85rem' }}>
                                                            {notif.title}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {notif.date}
                                                        </Typography>
                                                    </Box>
                                                }
                                                secondary={
                                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                                        {notif.message}
                                                    </Typography>
                                                }
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            )}
                        </Popover>
                        <Button
                            variant="outlined"
                            onClick={(e) => setProfileMenuAnchorEl(e.currentTarget)}
                            startIcon={
                                <Avatar sx={{ width: 28, height: 28, bgcolor: '#4f46e5', fontSize: '0.85rem' }}>
                                    {(profileName || userName) ? (profileName || userName)[0].toUpperCase() : 'A'}
                                </Avatar>
                            }
                            sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 700, color: '#0f172a', borderColor: '#cbd5e1', px: 2 }}
                        >
                            {profileName || userName || 'Hesabım'}
                        </Button>
                        <Menu
                            anchorEl={profileMenuAnchorEl}
                            open={Boolean(profileMenuAnchorEl)}
                            onClose={() => setProfileMenuAnchorEl(null)}
                            slotProps={{
                                paper: {
                                    sx: { width: 220, borderRadius: 3, mt: 1, boxShadow: '0 10px 25px rgba(0,0,0,0.1)' },
                                },
                            }}
                        >
                            <Box sx={{ px: 2, py: 1.5 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{profileName || userName || 'Kullanıcı'}</Typography>
                                <Typography variant="caption" color="text.secondary">{profileEmail || 'E-posta tanımlanmadı'}</Typography>
                            </Box>
                            <Divider sx={{ my: 0.5 }} />
                            <MenuItem
                                onClick={() => {
                                    setProfileMenuAnchorEl(null);
                                    setActiveMenu('profile');
                                }}
                                sx={{ gap: 1.5, py: 1 }}
                            >
                                <Person fontSize="small" color="action" />
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>Profilim & Ayarlar</Typography>
                            </MenuItem>
                            <MenuItem
                                onClick={() => {
                                    setProfileMenuAnchorEl(null);
                                    setActiveMenu('cards');
                                }}
                                sx={{ gap: 1.5, py: 1 }}
                            >
                                <CreditCard fontSize="small" color="action" />
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>Kartlarım</Typography>
                            </MenuItem>
                            <MenuItem
                                onClick={() => {
                                    setProfileMenuAnchorEl(null);
                                    setActiveMenu('support');
                                }}
                                sx={{ gap: 1.5, py: 1 }}
                            >
                                <HelpOutlined fontSize="small" color="action" />
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>Destek Al</Typography>
                            </MenuItem>
                            <Divider sx={{ my: 0.5 }} />
                            <MenuItem
                                onClick={() => {
                                    setProfileMenuAnchorEl(null);
                                    handleLogout();
                                }}
                                sx={{ gap: 1.5, py: 1, color: '#ef4444' }}
                            >
                                <Logout fontSize="small" sx={{ color: '#ef4444' }} />
                                <Typography variant="body2" sx={{ fontWeight: 700 }}>Oturumu Kapat</Typography>
                            </MenuItem>
                        </Menu>
                    </Box>
                </Box>
                {/* Dinamik Görünüm İçerik Alanı */}
                <Box sx={{ flexGrow: 1, overflowY: 'auto', p: activeMenu === 'support' ? 0 : 4, bgcolor: '#f8fafc' }}>
                    {cardsError && activeMenu !== 'support' && <Alert severity="error" sx={{ mb: 3 }}>{cardsError}</Alert>}
                    {activeMenu === 'overview' && renderOverview()}
                    {activeMenu === 'cards' && renderCards()}
                    {activeMenu === 'topup' && renderTopUp()}
                    {activeMenu === 'history' && renderHistory()}
                    {activeMenu === 'fares' && renderFares()}
                    {activeMenu === 'register' && renderNewCardRequest()}
                    {activeMenu === 'profile' && renderProfile()}
                    {activeMenu === 'support' && (
                        <SupportDashboard onBack={() => setActiveMenu('overview')} />
                    )}
                </Box>
            </Box>
        </Box>
    );
};

export default PassengerDashboard;