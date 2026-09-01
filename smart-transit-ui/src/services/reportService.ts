import { axiosInstance } from '../api/axiosInstance';
import type { PaginatedSuspiciousResponseDto } from '../types/cards';

export const reportService = {
    getSuspiciousTransactions: async (page = 1, pageSize = 10, onlyUnresolved = true) => {
        const response = await axiosInstance.get<PaginatedSuspiciousResponseDto>(
            '/api/reports/suspicious',
            { params: { page, pageSize, onlyUnresolved } }
        );
        return response.data;
    },

    resolveSuspiciousActivity: async (id: string, note?: string) => {
        const response = await axiosInstance.put(`/api/reports/suspicious/${id}/resolve`, { note });
        return response.data;
    },

    dismissSuspiciousActivity: async (id: string) => {
        const response = await axiosInstance.put(`/api/reports/suspicious/${id}/dismiss`);
        return response.data;
    }
};