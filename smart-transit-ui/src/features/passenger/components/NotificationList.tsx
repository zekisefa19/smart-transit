import React, { useEffect, useState } from 'react';
import { api } from '../../../services/cardService';
import type { NotificationDto } from '../../../types/cards';

export const NotificationList: React.FC = () => {
    const [notifications, setNotifications] = useState<NotificationDto[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const response = await api.get<NotificationDto[]>('/Notifications');
            setNotifications(response.data || []);
        } catch (error) {
            console.error('Bildirimler alınamadı:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id: string) => {
        try {
            await api.put(`/Notifications/${id}/read`);
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
            );
        } catch (error) {
            console.error('Bildirim okundu olarak işaretlenemedi:', error);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    return (
        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">Sistem Bildirimleri</h3>
                <button
                    onClick={fetchNotifications}
                    className="text-xs text-indigo-600 hover:underline font-medium"
                >
                    Yenile
                </button>
            </div>

            {loading ? (
                <div className="text-center py-6 text-gray-400 text-xs">Bildirimler yükleniyor...</div>
            ) : notifications.length === 0 ? (
                <div className="text-center py-6 text-gray-400 text-xs">Henüz bir bildiriminiz bulunmuyor.</div>
            ) : (
                <div className="space-y-3">
                    {notifications.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => !item.isRead && markAsRead(item.id)}
                            className={`p-3 rounded-lg border transition cursor-pointer ${item.isRead
                                    ? 'bg-gray-50 border-gray-100 opacity-75'
                                    : 'bg-indigo-50/40 border-indigo-100 hover:border-indigo-200'
                                }`}
                        >
                            <div className="flex justify-between items-start gap-2 mb-1">
                                <span className="font-bold text-xs text-gray-900">{item.title}</span>
                                <span className="text-[10px] text-gray-400">
                                    {new Date(item.createdAt).toLocaleDateString('tr-TR')}
                                </span>
                            </div>
                            <p className="text-xs text-gray-600">{item.message}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};