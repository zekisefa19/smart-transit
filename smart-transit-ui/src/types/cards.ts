// --- MEVCUT TİPLER ---
export interface CardDto {
    id: string;
    cardNumber: string;
    balance: number;
    isBlocked: boolean;
    hasSubscription: boolean;
    subscriptionExpirationDate?: string;
}

export interface CardTransactionDto {
    id: string;
    cardId: string;
    amount: number;
    transactionType: string;
    timestamp: string;
    description?: string;
}

export interface PagedResult<T> {
    items: T[];
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    totalCount: number;
}

// --- YENİ EKLENEN KART BAŞVURU VE ANOMALİ TİPLERİ ---
export interface CardApplicationDto {
    id: string;
    userId?: string;
    applicantName?: string;
    identityNumber?: string;
    cardType: string;
    documentUrl?: string;
    status: 'Pending' | 'Approved' | 'Rejected' | 'BEKLEMEDE' | 'ONAYLANDI' | 'REDDEDILDI';
    rejectionReason?: string;
    assignedCardNumber?: string;
    createdAt?: string;
    applicationDate?: string;
    processedAt?: string;
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

export interface NotificationDto {
    id: string;
    userId: string;
    title: string;
    message: string;
    createdAt: string;
    isRead: boolean;
}