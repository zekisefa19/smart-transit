// src/services/adminService.ts
import { axiosInstance } from '../api/axiosInstance';

// ==========================================
// 1. DTO & INTERFACE TANIMLARI
// ==========================================

// --- Operator Management DTOs ---
export interface OperatorDto {
    id: string;
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
    assignedTask?: string | null;
    role: string;
    isActive: boolean;
}

export interface CreateOperatorDto {
    firstName: string;
    lastName: string;
    email: string;
    password?: string;
    role: string;
}

export interface UpdateOperatorDto {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    password?: string;
    role: string;
    assignedTask?: string | null;
    isActive: boolean;
}

// --- Operator Dashboard DTOs ---
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
    todayTotalRevenue?: number;
    topUpChangeRate: number;
    todayPassCount: number;
    passCountChangeRate: number;
    activeCardCount: string;
    activeVehicleCount?: number;
    totalVehicleCount?: number;
    suspiciousTransactionCount: number;
    hourlyActivities: HourlyActivityDto[];
    topLines: TopLineDto[];
    aiInsightMessage?: string;
    recentTransactions: RecentOperatorTransactionDto[];
}

// --- Tarife DTOs ---
export interface TariffDto {
    id: string;
    name: string;
    cardType: string;
    price: number;
    transferDiscountRate?: number;
    isActive?: boolean;
}

export interface CreateTariffCommand {
    name: string;
    cardType: string;
    price: number;
    transferDiscountRate?: number;
}

export interface UpdateTariffDto {
    id: string;
    name: string;
    cardType: string;
    price: number;
    transferDiscountRate?: number;
    isActive: boolean;
}

// --- Şüpheli İşlem DTOs ---
export interface SuspiciousTransactionDto {
    id: string;
    cardNumber: string;
    description: string;
    date: string;
    isResolved: boolean;
}

// ==========================================
// 2. OPERATOR & DASHBOARD ENDPOINTS
// ==========================================

/**
 * Operator Dashboard verilerini getirir (GET: api/Operator/dashboard)
 */
export const getOperatorDashboard = async (): Promise<OperatorDashboardDto> => {
    const response = await axiosInstance.get<OperatorDashboardDto>('/Operator/dashboard');
    return response.data;
};

/**
 * Tüm Operatörleri getirir (GET: api/admin/operators)
 */
export const getOperators = async (): Promise<OperatorDto[]> => {
    const response = await axiosInstance.get<OperatorDto[]>('/admin/operators');
    return response.data;
};

/**
 * Yeni Operatör ekler (POST: api/admin/operators)
 */
export const createOperator = async (data: CreateOperatorDto): Promise<OperatorDto> => {
    const response = await axiosInstance.post<OperatorDto>('/admin/operators', data);
    return response.data;
};

/**
 * Operatör bilgilerini / durumunu / rolünü günceller (PUT: api/admin/operators/{id})
 */
export const updateOperator = async (id: string, data: UpdateOperatorDto): Promise<OperatorDto> => {
    const response = await axiosInstance.put<OperatorDto>(`/admin/operators/${id}`, data);
    return response.data;
};

/**
 * Operatörü siler / yetkisini kaldırır (DELETE: api/admin/operators/{id})
 */
export const deleteOperator = async (id: string): Promise<void> => {
    await axiosInstance.delete(`/admin/operators/${id}`);
};

// ==========================================
// 3. TARİFE (TARIFF) ENDPOINTS
// ==========================================

/**
 * Güncel tarifeleri getirir (GET: api/tariffs)
 */
export const getTariffs = async (): Promise<TariffDto[]> => {
    const response = await axiosInstance.get<TariffDto[]>('/tariffs');
    return response.data;
};

/**
 * Yeni tarife ekler (POST: api/admin/tariffs)
 */
export const createTariff = async (data: CreateTariffCommand): Promise<string> => {
    const response = await axiosInstance.post<string>('/admin/tariffs', data);
    return response.data;
};

/**
 * Var olan tarifeyi günceller (PUT: api/admin/tariffs)
 */
export const updateTariff = async (data: UpdateTariffDto): Promise<void> => {
    await axiosInstance.put('/admin/tariffs', data);
};

/**
 * Tüm tarifelere toplu zam uygular (POST: api/admin/tariffs/bulk-hike)
 */
export const applyBulkHike = async (percentage: number): Promise<void> => {
    await axiosInstance.post('/admin/tariffs/bulk-hike', { percentage });
};

// ==========================================
// 4. ŞÜPHELİ İŞLEMLER / RAPOR ENDPOINTS
// ==========================================

/**
 * Şüpheli işlemleri getirir (GET: api/reports/suspicious)
 */
export const getSuspiciousReports = async (page = 1, pageSize = 10, onlyUnresolved = true) => {
    const response = await axiosInstance.get(
        `/reports/suspicious?page=${page}&pageSize=${pageSize}&onlyUnresolved=${onlyUnresolved}`
    );
    return response.data;
};

/**
 * Şüpheli kaydı çözüldü olarak işaretler (PUT: api/reports/suspicious/{id}/resolve)
 */
export const resolveSuspiciousActivity = async (id: string, note?: string): Promise<void> => {
    await axiosInstance.put(`/reports/suspicious/${id}/resolve`, { note });
};

/**
 * Şüpheli kaydı yoksayar / kapatır (PUT: api/reports/suspicious/{id}/dismiss)
 */
export const dismissSuspiciousActivity = async (id: string): Promise<void> => {
    await axiosInstance.put(`/reports/suspicious/${id}/dismiss`);
};