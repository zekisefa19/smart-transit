import React, { useEffect, useState } from 'react';
import { getUserProfile, updateUserProfile } from '../../../services/userService';
import type { UserProfile } from '../../../services/userService';

export const ProfilePage = () => {
    const [loading, setLoading] = useState<boolean>(true);
    const [saving, setSaving] = useState<boolean>(false);
    const [user, setUser] = useState<UserProfile | null>(null);

    const [formData, setFormData] = useState({
        fullName: '',
        identityNumber: '',
        phoneNumber: '',
        address: '',
        email: '',
        birthDate: ''
    });

    // Backend'den gelen nesnedeki farklı alan adı ihtimallerini eşitleyen yardımcı fonksiyon
    const extractProfileData = (data: any) => ({
        fullName: data?.fullName || data?.name || '',
        email: data?.email || '',
        identityNumber: data?.identityNumber || data?.tcNo || '',
        phoneNumber: data?.phoneNumber || data?.phone || '',
        address: data?.address || '',
        birthDate: data?.birthDate ? new Date(data.birthDate).toISOString().split('T')[0] : ''
    });

    useEffect(() => {
        loadProfileData();
    }, []);

    const loadProfileData = async () => {
        try {
            setLoading(true);
            const data = await getUserProfile();
            setUser(data);

            const parsedData = extractProfileData(data);
            setFormData(prev => ({ ...prev, ...parsedData }));
        } catch (error: any) {
            console.error("Profil verisi çekilemedi:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSaving(true);

            // Backend'in DTO yapısına uygun payload hazırlanıyor
            const payload = {
                fullName: formData.fullName,
                phoneNumber: formData.phoneNumber.trim() ? formData.phoneNumber.trim() : null,
                identityNumber: formData.identityNumber.trim() ? formData.identityNumber.trim() : null,
                address: formData.address.trim() ? formData.address.trim() : null,
                birthDate: formData.birthDate ? new Date(formData.birthDate).toISOString() : null
            };

            const updatedData = await updateUserProfile(payload);

            // Gelen güncellenmiş veriyi güvenli bir şekilde state'e aktar
            const parsedData = extractProfileData(updatedData);

            setUser(prev => ({ ...prev, ...updatedData }));
            setFormData(prev => ({ ...prev, ...parsedData }));

            alert("Profil bilgileriniz başarıyla güncellendi!");
        } catch (error: any) {
            console.error("Güncelleme hatası:", error);
            alert("Güncellenirken bir hata oluştu. Lütfen konsol loglarını kontrol edin.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="p-12 text-center text-gray-500 font-medium">Veritabanından profil verileri yükleniyor...</div>;
    }

    const userInitial = user?.fullName && user.fullName.trim() !== ''
        ? user.fullName.charAt(0).toUpperCase()
        : (user?.email ? user.email.charAt(0).toUpperCase() : 'K');

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6 font-sans">
            {/* ÜST BANNER */}
            <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-blue-900 text-white rounded-2xl p-6 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Profilim & Hesap Ayarları</h1>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* SOL KOLON: Profil Özeti */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
                        <div className="relative w-24 h-24 mx-auto mb-3">
                            <div className="w-24 h-24 bg-indigo-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-inner">
                                {userInitial}
                            </div>
                            <div className="absolute bottom-0 right-0 bg-gray-900 text-white p-1.5 rounded-full text-xs cursor-pointer hover:bg-gray-700 transition">
                                ✏️
                            </div>
                        </div>

                        <h2 className="text-xl font-bold text-gray-800">
                            {formData.fullName || 'Kullanıcı'}
                        </h2>

                        <div className="mt-2 inline-flex items-center gap-1 text-xs font-semibold bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full border border-emerald-200">
                            <span>✓</span> Onaylı Yolcu Hesabı
                        </div>

                        <hr className="my-5 border-gray-100" />

                        <div className="space-y-3 text-left text-sm text-gray-600">
                            <div className="flex items-center gap-3">
                                <span>✉️</span>
                                <span className="truncate font-medium">{formData.email || user?.email || 'E-posta belirtilmedi'}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span>📞</span>
                                <span className={formData.phoneNumber ? 'text-gray-700 font-medium' : 'text-gray-400'}>
                                    {formData.phoneNumber || 'Telefon belirtilmedi'}
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span>📍</span>
                                <span className={formData.address ? 'text-gray-700 font-medium' : 'text-gray-400'}>
                                    {formData.address || 'Şehir/Adres belirtilmedi'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SAĞ KOLON: Düzenleme Formu */}
                <div className="md:col-span-2 bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <h2 className="text-lg font-bold text-gray-800 mb-6">Kişisel Bilgileri Düzenle</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Ad Soyad */}
                            <div className="border border-gray-300 rounded-lg p-2 focus-within:ring-2 focus-within:ring-indigo-500">
                                <label className="block text-[11px] font-medium text-gray-500">Ad Soyad</label>
                                <input
                                    type="text"
                                    className="w-full outline-none text-gray-800 text-sm bg-transparent"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    required
                                />
                            </div>

                            {/* T.C. Kimlik No */}
                            <div className="border border-gray-300 rounded-lg p-2 focus-within:ring-2 focus-within:ring-indigo-500">
                                <label className="block text-[11px] font-medium text-gray-500">T.C. Kimlik No</label>
                                <input
                                    type="text"
                                    maxLength={11}
                                    className="w-full outline-none text-gray-800 text-sm bg-transparent"
                                    placeholder="T.C. Kimlik No giriniz"
                                    value={formData.identityNumber}
                                    onChange={(e) => setFormData({ ...formData, identityNumber: e.target.value })}
                                />
                            </div>

                            {/* E-Posta Adresi */}
                            <div className="border border-gray-200 bg-gray-50 rounded-lg p-2">
                                <label className="block text-[11px] font-medium text-gray-400">E-Posta Adresi</label>
                                <input
                                    type="email"
                                    disabled
                                    className="w-full outline-none text-gray-600 text-sm bg-transparent cursor-not-allowed"
                                    value={formData.email || user?.email || ''}
                                />
                            </div>

                            {/* Telefon Numarası */}
                            <div className="border border-gray-300 rounded-lg p-2 focus-within:ring-2 focus-within:ring-indigo-500">
                                <label className="block text-[11px] font-medium text-gray-500">Telefon Numarası</label>
                                <input
                                    type="text"
                                    className="w-full outline-none text-gray-800 text-sm bg-transparent"
                                    placeholder="05XX XXX XX XX"
                                    value={formData.phoneNumber}
                                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                />
                            </div>

                            {/* Şehir / Adres */}
                            <div className="md:col-span-2 border border-gray-300 rounded-lg p-2 focus-within:ring-2 focus-within:ring-indigo-500">
                                <label className="block text-[11px] font-medium text-gray-500">Şehir / Adres</label>
                                <input
                                    type="text"
                                    className="w-full outline-none text-gray-800 text-sm bg-transparent"
                                    placeholder="İl / İlçe veya açık adresiniz"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="pt-4 flex justify-center">
                            <button
                                type="submit"
                                disabled={saving}
                                className="bg-blue-600 text-white font-medium px-10 py-3 rounded-xl shadow-md hover:bg-blue-700 transition disabled:opacity-50"
                            >
                                {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};