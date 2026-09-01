import React, { useState } from 'react';
import { CardService } from '../../../services/cardService';

interface PassengerApplyCardModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const PassengerApplyCardModal: React.FC<PassengerApplyCardModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
}) => {
    const [cardType, setCardType] = useState<string>('Ogrenci');
    const [applicantName, setApplicantName] = useState<string>('');
    const [identityNumber, setIdentityNumber] = useState<string>('');
    const [deliveryAddress, setDeliveryAddress] = useState<string>(''); // ADRES STATE'İ EKLENDİ
    const [deliveryMethod, setDeliveryMethod] = useState<string>('Adrese Kargo Teslimatı');
    const [documentFile, setDocumentFile] = useState<File | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!documentFile) {
            setError('Lütfen doğrulama belgenizi (PDF veya Görsel) yükleyin.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const formData = new FormData();

            // Backend DTO uyumluluğu için hem PascalCase hem camelCase alanlar desteklenir
            formData.append('CardType', cardType);
            formData.append('cardType', cardType);

            formData.append('ApplicantName', applicantName);
            formData.append('applicantName', applicantName);

            formData.append('IdentityNumber', identityNumber);
            formData.append('identityNumber', identityNumber);

            // ADRES VE TESLİMAT VERİLERİ FORMDATA'YA EKLENDİ
            formData.append('DeliveryAddress', deliveryAddress);
            formData.append('deliveryAddress', deliveryAddress);
            formData.append('Address', deliveryAddress);
            formData.append('address', deliveryAddress);

            formData.append('DeliveryMethod', deliveryMethod);
            formData.append('deliveryMethod', deliveryMethod);

            // DOSYA / EVRAK BİLGİSİ EKLENDİ
            formData.append('Document', documentFile);
            formData.append('document', documentFile);
            formData.append('File', documentFile);

            await CardService.applyForCard(formData);

            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Başvuru gönderilirken bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-900">İndirimli / Özel Kart Başvurusu</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 font-bold text-sm">✕</button>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg font-medium">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
                    {/* Kart Tipi */}
                    <div>
                        <label className="block text-gray-700 font-semibold mb-1">Kart Tipi Seçiniz</label>
                        <select
                            value={cardType}
                            onChange={(e) => setCardType(e.target.value)}
                            className="w-full border border-gray-200 rounded-lg p-2.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                        >
                            <option value="Ogrenci">Öğrenci Kartı (%50 İndirim)</option>
                            <option value="Engelli">Engelli Kartı (Ücretsiz)</option>
                            <option value="65Ustu">65 Yaş Üstü Kartı (Ücretsiz)</option>
                            <option value="Ogretmen">Öğretmen Kartı (İndirimli)</option>
                        </select>
                    </div>

                    {/* Ad Soyad */}
                    <div>
                        <label className="block text-gray-700 font-semibold mb-1">Ad Soyad</label>
                        <input
                            type="text"
                            required
                            placeholder="Serenay Yüksel"
                            value={applicantName}
                            onChange={(e) => setApplicantName(e.target.value)}
                            className="w-full border border-gray-200 rounded-lg p-2.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    {/* T.C. Kimlik No */}
                    <div>
                        <label className="block text-gray-700 font-semibold mb-1">T.C. Kimlik No</label>
                        <input
                            type="text"
                            required
                            maxLength={11}
                            placeholder="11111111111"
                            value={identityNumber}
                            onChange={(e) => setIdentityNumber(e.target.value)}
                            className="w-full border border-gray-200 rounded-lg p-2.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    {/* Teslimat Yöntemi */}
                    <div>
                        <label className="block text-gray-700 font-semibold mb-1">Teslimat Yöntemi</label>
                        <select
                            value={deliveryMethod}
                            onChange={(e) => setDeliveryMethod(e.target.value)}
                            className="w-full border border-gray-200 rounded-lg p-2.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                        >
                            <option value="Adrese Kargo Teslimatı">Adrese Kargo Teslimatı</option>
                            <option value="Kart Merkezinden Teslim">Kart Merkezinden Teslim</option>
                        </select>
                    </div>

                    {/* Teslimat Adresi (YENİ EKLENDİ) */}
                    <div>
                        <label className="block text-gray-700 font-semibold mb-1">Teslimat / Ev Adresi</label>
                        <textarea
                            required
                            rows={3}
                            placeholder="Mahalle, Sokak, Bina No, İlçe / İl bilgilerini eksiksiz giriniz..."
                            value={deliveryAddress}
                            onChange={(e) => setDeliveryAddress(e.target.value)}
                            className="w-full border border-gray-200 rounded-lg p-2.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    {/* Belge Yükleme */}
                    <div>
                        <label className="block text-gray-700 font-semibold mb-1">Doğrulama Belgesi (PDF / Görsel) *</label>
                        <input
                            type="file"
                            required
                            accept=".pdf,.png,.jpg,.jpeg"
                            onChange={(e) => e.target.files?.[0] && setDocumentFile(e.target.files[0])}
                            className="w-full border border-gray-200 rounded-lg p-2 bg-slate-50 focus:outline-none"
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 font-medium hover:bg-gray-50 transition"
                        >
                            İptal
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold transition disabled:opacity-50"
                        >
                            {loading ? 'Başvuru Yapılıyor...' : 'Başvuruyu Gönder'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};