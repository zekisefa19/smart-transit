import { api } from './cardService';

export interface NotificationDto {
    id: string;
    userId: string;
    title: string;
    message: string;
    createdAt: string;
    isRead: boolean;
}

export const NotificationService = {
    getNotifications: async (): Promise<NotificationDto[]> => {
        try {
            const response = await api.get<NotificationDto[]>('/notifications');
            return response.data;
        } catch (error) {
            console.error("Bildirimler API'den çekilemedi:", error);
            return [];
        }
    },

    markAsRead: async (id: string): Promise<void> => {
        try {
            await api.put(`/notifications/${id}/read`);
        } catch (error) {
            console.error("Bildirim işaretlenemedi:", error);
        }
    }
};