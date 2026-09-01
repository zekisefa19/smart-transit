import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import type { CardApplicationDto } from '../types/cards';

export interface CardDto {
    id: string;
    cardNumber?: string;
    cardName?: string;
    balance: number;
    isBlocked?: boolean;
}

export interface CardTransactionDto {
    id: string;
    amount: number;
    transactionType: string;
    createdDate: string;
    balanceAfter?: number;
}

export interface PagedResult<T> {
    items: T[];
    pageNumber: number;
    pageSize: number;
    totalCount: number;
}

export interface SuspiciousAnalysisResultDto {
    riskScore: number;
    riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
    explanation: string;
    recommendedAction: string;
}

export interface AnalyzedSuspiciousItemDto {
    transactionId: string;
    cardNumber: string;
    cardType: string;
    routeName: string;
    amount: number;
    timestamp: string;
    systemReason: string;
    aiAnalysis?: SuspiciousAnalysisResultDto;
}

export interface PaginatedSuspiciousResponseDto {
    items: AnalyzedSuspiciousItemDto[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
}

export interface ApplyCardRequest {
    cardType: string;
    documentUrl?: string;
    document?: File | null;
    identityNumber?: string;
    applicantName?: string;
    email?: string;
    deliveryMethod?: string;
    deliveryAddress?: string;
    studentNo?: string;
}

const getToken = (): string | null => {
    return (
        sessionStorage.getItem('smarttransit_token') ||
        sessionStorage.getItem('token')
    );
};
export const api = axios.create({
    baseURL: '/api',
});

api.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const getUserIdFromToken = (): string | null => {
    const token = getToken();
    if (!token) return null;
    try {
        const decoded: any = jwtDecode(token);
        return (
            decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ||
            decoded.sub ||
            decoded.nameid ||
            null
        );
    } catch {
        return null;
    }
};

export const getUserNameFromToken = (): string => {
    const token = getToken();
    if (!token) return 'Kullanıcı';
    try {
        const decoded: any = jwtDecode(token);
        return (
            decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ||
            decoded.name ||
            decoded.fullName ||
            'Kullanıcı'
        );
    } catch {
        return 'Kullanıcı';
    }
};

// --- KART & BAŞVURU SERVİSLERİ ---
export const CardService = {
    getUserCards: async (ownerId?: string): Promise<CardDto[]> => {
        try {
            const response = await api.get<CardDto[]>('/Cards', {
                params: ownerId ? { ownerId } : undefined,
            });
            return Array.isArray(response.data) ? response.data : [];
        } catch (error) {
            console.error('Kullanıcı kartları alınırken hata oluştu:', error);
            return [];
        }
    },

    createCard: async (command: { cardName: string; cardNumber: string }): Promise<string> => {
        const response = await api.post<string>('/Cards', command);
        return response.data;
    },

    blockCard: async (id: string, reason?: string, anomalyId?: string): Promise<void> => {
        await api.put(`/Cards/${id}/block`, { reason, anomalyId });
    },

    unblockCard: async (id: string): Promise<void> => {
        await api.put(`/Cards/${id}/unblock`);
    },

    topUpBalance: async (id: string, amount: number): Promise<any> => {
        const idempotencyKey = crypto.randomUUID
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

        const response = await api.post(
            `/Cards/${id}/topup`,
            { amount: amount },
            { headers: { 'Idempotency-Key': idempotencyKey } }
        );
        return response.data;
    },

    purchaseSubscription: async (id: string): Promise<any> => {
        const response = await api.post(`/Cards/${id}/subscription`);
        return response.data;
    },

    tapCard: async (id: string, routeId: string): Promise<any> => {
        const response = await api.post(`/Cards/${id}/tap`, { routeId });
        return response.data;
    },

    getCardTransactions: async (
        id: string,
        pageNumber: number = 1,
        pageSize: number = 10
    ): Promise<PagedResult<CardTransactionDto>> => {
        const response = await api.get<PagedResult<CardTransactionDto>>(`/Cards/${id}/transactions`, {
            params: { pageNumber, pageSize },
        });
        return response.data;
    },

    // --- YOLCU: YENİ KART BAŞVURUSU YAPAN SERVİS (415 VE MULTIPART HATASINI ÇÖZEN BÖLÜM) ---
    applyForCard: async (data: FormData | ApplyCardRequest | Record<string, any>) => {
        let formData: FormData;

        if (data instanceof FormData) {
            formData = data;
        } else {
            formData = new FormData();

            // .NET Controller [FromForm] eşleşmesi için PascalCase alan adları
            if (data.cardType) formData.append('CardType', data.cardType);
            if (data.applicantName) formData.append('ApplicantName', data.applicantName);
            if (data.identityNumber) formData.append('IdentityNumber', data.identityNumber);
            if (data.email) formData.append('Email', data.email);
            if (data.deliveryMethod) formData.append('DeliveryMethod', data.deliveryMethod);
            if (data.deliveryAddress) formData.append('DeliveryAddress', data.deliveryAddress);
            if (data.studentNo) formData.append('StudentNo', data.studentNo);
            if (data.document) formData.append('Document', data.document);

            // Geriye kalan ek alanlar varsa aktar
            const handledKeys = [
                'cardtype',
                'applicantname',
                'identitynumber',
                'email',
                'deliverymethod',
                'deliveryaddress',
                'studentno',
                'document',
            ];

            Object.keys(data).forEach((key) => {
                if (!handledKeys.includes(key.toLowerCase())) {
                    const value = data[key];
                    if (value !== undefined && value !== null) {
                        formData.append(key, value);
                    }
                }
            });
        }

        const response = await api.post<{ applicationId: string; message: string }>(
            '/passenger/card-applications',
            formData
        );
        return response.data;
    },

    // --- OPERATÖR: BAŞVURULARI LİSTELEYEN SERVİS (VERİ TİPİ VE YETKİ KORUMALI) ---
    getCardApplications: async (status?: string): Promise<CardApplicationDto[]> => {
        try {
            const response = await api.get('/operator/card-applications', {
                params: status ? { status } : undefined,
            });

            const data = response.data;

            // Yanıt tipi kontrolleri (Dizi, EF Core $values veya paginated items)
            if (Array.isArray(data)) return data;
            if (data?.items && Array.isArray(data.items)) return data.items;
            if (data?.$values && Array.isArray(data.$values)) return data.$values;

            return [];
        } catch (error: any) {
            console.error(
                'Başvurular çekilirken hata oluştu:',
                error?.response?.status,
                error?.response?.data || error?.message
            );
            return [];
        }
    },

    // --- OPERATÖR: ONAYLAMA SERVİSİ ---
    approveCardApplication: async (applicationId: string, cardNumber?: string) => {
        const response = await api.post(`/operator/card-applications/${applicationId}/approve`, { cardNumber });
        return response.data;
    },

    // --- OPERATÖR: REDDETME SERVİSİ ---
    rejectCardApplication: async (applicationId: string, reason: string) => {
        const response = await api.post(`/operator/card-applications/${applicationId}/reject`, { reason });
        return response.data;
    },
};

// --- ŞÜPHELİ İŞLEMLER SERVİSİ ---
export const ReportService = {
    getSuspiciousTransactions: async (page = 1, pageSize = 10, onlyUnresolved = true): Promise<PaginatedSuspiciousResponseDto> => {
        const response = await api.get<PaginatedSuspiciousResponseDto>('/Reports/suspicious', {
            params: { page, pageSize, onlyUnresolved },
        });
        return response.data;
    },

    resolveSuspiciousActivity: async (id: string, note?: string) => {
        const response = await api.put(`/Reports/suspicious/${id}/resolve`, { note });
        return response.data;
    },

    dismissSuspiciousActivity: async (id: string) => {
        const response = await api.put(`/Reports/suspicious/${id}/dismiss`);
        return response.data;
    },
};