export interface AdminDashboardDto {
    totalRevenue?: number;
    totalPassengers?: number;
    activeCards?: number;
    pendingApplications?: number;
}

export interface CardApplication {
    id: string;
    applicantName: string;
    tcNo?: string;
    cardType: string;
    applicationDate: string;
    status: 'Pending' | 'Approved' | 'Rejected' | string;
}

export interface Tariff {
    id?: string;
    cardType: string;
    price: number;
    transferPrice: number;
}

export interface DailyReportDto {
    totalRevenue: number;
    totalPassengerCount: number;
    date?: string;
}

export interface SuspiciousTransactionDto {
    id: string;
    cardNumber: string;
    timestamp: string;
    reason: string;
}

export interface AiAnalysisResult {
    summary: string;
    riskScore?: number;
}