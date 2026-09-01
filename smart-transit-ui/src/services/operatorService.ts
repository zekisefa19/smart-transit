import { api } from './api';

export interface HourlyActivityDto {
    hour: string;
    passengerCount: number;
}

export interface TopLineDto {
    lineCode: string;
    passengerCountText: string;
    percentage: number;
}

export interface RecentOperatorTransactionDto {
    time: string;
    maskedCardNumber: string;
    transactionType: string;
    lineCode: string;
    amount: number;
    status: string;
}

export interface OperatorDashboardDto {
    todayTotalTopUp: number;
    topUpChangeRate: number;
    todayPassCount: number;
    passCountChangeRate: number;
    activeCardCount: string;
    suspiciousTransactionCount: number;
    hourlyActivities: HourlyActivityDto[];
    topLines: TopLineDto[];
    aiInsightMessage?: string | null;
    recentTransactions: RecentOperatorTransactionDto[];
}

export interface CardApplicationDto {
    id: string;
    applicantName: string;
    identityNumber?: string;
    cardType: string;
    applicationDate?: string;
    status?: 'BEKLEMEDE' | 'ONAYLANDI' | 'REDDEDILDI';
    email?: string;
    rejectionReason?: string;
    assignedCardNumber?: string;
}

export const getOperatorDashboard = async (): Promise<OperatorDashboardDto> => {
    const response = await api.get<OperatorDashboardDto>('/operator/dashboard');
    return response.data;
};

// Gerçek Kart Başvurularını Getiren Servis
export const getCardApplications = async (): Promise<CardApplicationDto[]> => {
    const response = await api.get<CardApplicationDto[]>('/operator/card-applications');
    return response.data;
};

// Başvuruyu Onaylama Servisi
export const approveCardApplication = async (id: string, cardNumber: string): Promise<void> => {
    await api.post(`/operator/card-applications/${id}/approve`, { cardNumber });
};

// Başvuruyu Reddetme Servisi
export const rejectCardApplication = async (id: string, reason: string): Promise<void> => {
    await api.post(`/operator/card-applications/${id}/reject`, { reason });
};