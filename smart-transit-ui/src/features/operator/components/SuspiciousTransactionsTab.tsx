import React, { useEffect, useState } from 'react';
import { reportService } from '../../../services/reportService';
import { CardService } from '../../../services/cardService';
import type { AnalyzedSuspiciousItemDto } from '../../../types/cards';

export const SuspiciousTransactionsTab: React.FC = () => {
    const [items, setItems] = useState<AnalyzedSuspiciousItemDto[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedItem, setSelectedItem] = useState<AnalyzedSuspiciousItemDto | null>(null);
    const [blockReason, setBlockReason] = useState<string>('');
    const [resolveNote, setResolveNote] = useState<string>('');
    const [submitting, setSubmitting] = useState<boolean>(false);

    const fetchSuspiciousTransactions = async () => {
        setLoading(true);
        try {
            const data = await reportService.getSuspiciousTransactions(1, 20, true);
            setItems(data.items || []);
        } catch (error) {
            console.error('Şüpheli işlemler yüklenirken hata oluştu:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSuspiciousTransactions();
    }, []);

    const handleResolve = async (id: string) => {
        setSubmitting(true);
        try {
            await reportService.resolveSuspiciousActivity(id, resolveNote || 'İncelendi, güvenli olarak kapatıldı.');
            setSelectedItem(null);
            setResolveNote('');
            await fetchSuspiciousTransactions();
        } catch (error) {
            alert('İşlem kapatılırken bir hata oluştu.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleBlockAndResolve = async (item: AnalyzedSuspiciousItemDto) => {
        if (!blockReason.trim()) {
            alert('Lütfen blokaj gerekçesi belirtiniz.');
            return;
        }
        setSubmitting(true);
        try {
            await CardService.blockCard(item.cardNumber, blockReason, item.transactionId);
            await reportService.resolveSuspiciousActivity(item.transactionId, `Kart Bloke Edildi: ${blockReason}`);
            setSelectedItem(null);
            setBlockReason('');
            await fetchSuspiciousTransactions();
        } catch (error) {
            alert('Kart bloke edilirken bir hata oluştu.');
        } finally {
            setSubmitting(false);
        }
    };

    const getRiskBadge = (level?: string) => {
        switch (level) {
            case 'Critical':
                return 'bg-red-600 text-white';
            case 'High':
                return 'bg-orange-500 text-white';
            case 'Medium':
                return 'bg-yellow-500 text-black';
            default:
                return 'bg-emerald-600 text-white';
        }
    };

    return (
        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">AI Şüpheli Geçiş Analitiği</h2>
                    <p className="text-xs text-gray-500 mt-1">Yapay zeka tarafından tespit edilen anomali ve riskli işlemleri yönetin.</p>
                </div>
                <button
                    onClick={fetchSuspiciousTransactions}
                    className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
                >
                    Yenile
                </button>
            </div>

            {loading ? (
                <div className="text-center py-12 text-gray-400 text-sm">Yapay zeka analizleri yükleniyor...</div>
            ) : items.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-sm">İncelenmesi gereken şüpheli işlem bulunmuyor.</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {items.map((item) => (
                        <div
                            key={item.transactionId}
                            className="border border-gray-200 rounded-lg p-4 bg-white hover:border-gray-300 transition shadow-sm"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <span className="font-mono font-bold text-gray-900 text-base">{item.cardNumber}</span>
                                    <span className="text-xs text-gray-500 block mt-0.5">
                                        {item.routeName} • {new Date(item.timestamp).toLocaleString('tr-TR')}
                                    </span>
                                </div>
                                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getRiskBadge(item.aiAnalysis?.riskLevel)}`}>
                                    %{(item.aiAnalysis?.riskScore ?? 0) * 100} ({item.aiAnalysis?.riskLevel ?? 'N/A'})
                                </span>
                            </div>

                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs text-gray-700 space-y-1 my-3">
                                <p className="font-medium text-slate-900">Sistem Nedeni: {item.systemReason}</p>
                                {item.aiAnalysis?.explanation && (
                                    <p className="text-gray-600">
                                        <strong className="text-indigo-600">AI Tespiti:</strong> {item.aiAnalysis.explanation}
                                    </p>
                                )}
                            </div>

                            <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                                <span className="font-bold text-gray-900 text-sm">{item.amount.toFixed(2)} TL</span>
                                <button
                                    onClick={() => setSelectedItem(item)}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-md text-xs font-medium transition"
                                >
                                    Incele & Aksiyon Al
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Aksiyon Modalı */}
            {selectedItem && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-2xl border border-gray-100">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Anomali Karar Paneli</h3>
                                <p className="text-xs text-gray-500 font-mono mt-0.5">Kart: {selectedItem.cardNumber} | Tutar: {selectedItem.amount} TL</p>
                            </div>
                            <button
                                onClick={() => setSelectedItem(null)}
                                className="text-gray-400 hover:text-gray-600 text-sm font-bold"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-4">
                            {selectedItem.aiAnalysis?.recommendedAction && (
                                <div className="bg-amber-50 border border-amber-200 text-amber-900 p-3 rounded-lg text-xs">
                                    <strong>AI Aksiyon Tavsiyesi:</strong> {selectedItem.aiAnalysis.recommendedAction}
                                </div>
                            )}

                            <div className="p-3 bg-red-50 border border-red-100 rounded-lg space-y-2">
                                <label className="block text-xs font-bold text-red-900">Seçenek A: Kartı Bloke Et ve Kapat</label>
                                <input
                                    type="text"
                                    placeholder="Blokaj Nedeni (Örn: Peş peşe biniş şüphesi)..."
                                    value={blockReason}
                                    onChange={(e) => setBlockReason(e.target.value)}
                                    className="w-full border border-red-200 rounded-md p-2 text-xs focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                                />
                                <button
                                    disabled={submitting}
                                    onClick={() => handleBlockAndResolve(selectedItem)}
                                    className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-md font-bold text-xs transition disabled:opacity-50"
                                >
                                    {submitting ? 'İşleniyor...' : 'Kartı Bloke Et ve İşlemi Kapat'}
                                </button>
                            </div>

                            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg space-y-2">
                                <label className="block text-xs font-bold text-emerald-900">Seçenek B: Güvenli Olarak İşaretle (Blokajsız)</label>
                                <input
                                    type="text"
                                    placeholder="İnceleme Notu..."
                                    value={resolveNote}
                                    onChange={(e) => setResolveNote(e.target.value)}
                                    className="w-full border border-emerald-200 rounded-md p-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                                />
                                <button
                                    disabled={submitting}
                                    onClick={() => handleResolve(selectedItem.transactionId)}
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-md font-bold text-xs transition disabled:opacity-50"
                                >
                                    {submitting ? 'İşleniyor...' : 'Sorun Yoklarak Onayla'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};