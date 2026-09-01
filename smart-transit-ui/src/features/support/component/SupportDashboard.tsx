import React, { useState, useMemo } from 'react';
import {
    Search,
    HelpCircle,
    X,
    Phone,
    Mail,
    Clock,
    MessageSquare,
    ChevronRight,
    ArrowLeft
} from 'lucide-react';

interface FAQItem {
    id: number;
    question: string;
    category: string;
    answer: string;
}

const FAQ_DATA: FAQItem[] = [
    {
        id: 1,
        category: "Geçiş & Ödeme",
        question: "İstanbulkart’ım yok. Nasıl geçiş yapabilirim?",
        answer: `• En kolay şekilde İstanbulkart Mobil’i indirerek QR kod ile geçiş yapabilirsiniz.
• Biletmatiklerden 1, 3, 5 ve 10 geçişlik sınırlı kullanımlı bilet alabilirsiniz.
• Yalnızca kısa mesaj atarak tarifenize ek SMS QR ile geçiş yapabilirsiniz.
• BİRgeç sınırlı kullanımlı bilet ücreti karşılığında temassız banka ve kredi kartınızla geçiş yapabilirsiniz.`
    },
    {
        id: 2,
        category: "Geçiş & Ödeme",
        question: "Banka ya da kredi kartımla ulaşım ödemesi yapabilir miyim?",
        answer: "Sınırlı kullanımlı bilet ücreti karşılığında temassız banka ve kredi kartınızla ulaşım ödemelerinizi gerçekleştirebilirsiniz."
    },
    {
        id: 3,
        category: "Kart İşlemleri",
        question: "İstanbulkart’ımın kaybolması ya da çalınması halinde ne yapmalıyım?",
        answer: "Kaybolan ya da çalınan adınıza tanımlı İstanbulkart’ınızı (kişiselleştirilmiş, indirimli, ücretsiz, mavi) mümkün olan en kısa sürede SmartTransit Mobil’den ya da ALO 153 üzerinden bloke ederek bakiyenizi güvence altına alabilirsiniz."
    },
    {
        id: 4,
        category: "Bakiye & Yükleme",
        question: "İstanbulkart’ıma nereden yükleme yapabilirim?",
        answer: "SmartTransit Mobil’den TL ve abonman yüklemesi yapabilirsiniz."
    },
    {
        id: 5,
        category: "Bakiye & Yükleme",
        question: "İstanbulkart’ımı iade edebilir miyim?",
        answer: "İstanbulkart depozitosuz bir karttır ve iadesi bulunmamaktadır."
    },
    {
        id: 6,
        category: "Bakiye & Yükleme",
        question: "İstanbulkart’ımda aktarma/iade sorunu yaşadım, ne yapabilirim?",
        answer: "İstanbulkart’ınızda aktarma/iade sorunu yaşadığınızda, ALO 153 üzerinden veya SmartTransit Mobil uygulaması üzerinden müşteri hizmetlerimizle iletişime geçerek sorununuzu iletebilirsiniz."
    },
    {
        id: 7,
        category: "Kart İşlemleri",
        question: "İstanbulkart’ımın üzerinde yer alan numaralar silinmiş, kart numarasını nereden öğrenebilirim?",
        answer: "Kart numaranızı öğrenmek için SmartTransit Mobil uygulamasını kullanabilir veya ALO 153 ile iletişime geçebilirsiniz."
    },
    {
        id: 8,
        category: "İndirimli Kartlar",
        question: "İndirimli İstanbulkart nedir ve kimlere verilir?",
        answer: "İndirimli İstanbulkart, belirli kriterlere uyan kullanıcılara sunulan bir kart türüdür. Öğrenciler, öğretmenler ve 60/65 yaş üstü bireyler bu karttan faydalanabilir."
    },
    {
        id: 9,
        category: "İndirimli Kartlar",
        question: "Kart şifremi yanlış girdim ve şifrem bloke oldu, ne yapabilirim?",
        answer: "Şifrenizi sıfırlamak için SmartTransit Mobil uygulamasını kullanabilir veya ALO 153 ile iletişime geçebilirsiniz."
    },
    {
        id: 10,
        category: "Öğrenci Kartı",
        question: "Öğrenci İstanbulkart’ım kaç yıl geçerlidir?",
        answer: "Öğrenci İstanbulkart’ınız, kayıtlı olduğunuz eğitim kurumunun süresi boyunca geçerlidir. Mezuniyet veya okul değişikliği durumunda kartın geçerliliği sona erebilir."
    },
    {
        id: 11,
        category: "Öğrenci Kartı",
        question: "Yüksek lisans / Doktora öğrencisiyim, öğrenci tarifesinden faydalanabilir miyim?",
        answer: "Evet, yüksek lisans ve doktora öğrencileri öğrenci tarifesinden faydalanabilirler."
    },
    {
        id: 12,
        category: "Ücretsiz Kartlar",
        question: "Ücretsiz İstanbulkart nedir ve alım şartları nelerdir?",
        answer: "Ücretsiz İstanbulkart, belirli sosyal yardım programlarına dahil olan veya belirli kriterleri karşılayan bireylere sunulan bir kart türüdür. Alım şartları, ilgili sosyal yardım programlarının gerekliliklerine bağlıdır."
    },
    {
        id: 13,
        category: "Abonman",
        question: "Mavi İstanbulkart (Abonman) nedir ve nasıl temin edilir?",
        answer: "Mavi İstanbulkart, belirli bir süre boyunca aylık kullanım hakkı sağlayan bir abonman kartıdır. Temin etmek için SmartTransit Mobil uygulamasını kullanabilir veya yetkili satış noktalarından başvuruda bulunabilirsiniz."
    },
    {
        id: 14,
        category: "Tek Geçişlik Biletler",
        question: "Sınırlı kullanımlı bilet nedir ve nereden temin edebilirim?",
        answer: "Sınırlı kullanımlı biletler (1, 3, 5, 10 geçişlik), biletmatiklerden veya yetkili temsilcilerden temin edilebilir."
    },
    {
        id: 15,
        category: "Bakiye İadesi",
        question: "Kayıp kartımda bulunan TL veya aylık abonmanı nasıl geri alabilirim?",
        answer: "Kaybolan ya da çalınan adınıza tanımlı İstanbulkart’ınızı en kısa sürede SmartTransit Mobil’den ya da ALO 153 üzerinden bloke ettikten sonra bakiye aktarım talebinde bulunabilirsiniz."
    },
    {
        id: 16,
        category: "Bakiye İadesi",
        question: "Kırılma, çatlama vb. nedenlerle kullanım dışı kalan kartımdaki bakiyeyi nasıl geri alabilirim?",
        answer: "Kırılma, çatlama vb. nedenlerle kullanım dışı kalan kartınızdaki bakiyeyi geri almak için SmartTransit Mobil uygulamasını kullanabilir veya ALO 153 ile iletişime geçebilirsiniz."
    },
    {
        id: 17,
        category: "Teknik Sorunlar",
        question: "Biletmatiklerden İstanbulkart’ıma yükleme yaparken sorun yaşadım, ne yapabilirim?",
        answer: "Biletmatiklerden yükleme yaparken sorun yaşıyorsanız, öncelikle makinenin ekranındaki talimatları dikkatlice izleyin. Sorun devam ederse, ALO 153 ile iletişime geçerek destek alabilirsiniz."
    },
    {
        id: 18,
        category: "Teknik Sorunlar",
        question: "İstanbulkart’ım manyetik/çip arızası nedeniyle kullanım dışı kaldı, ücretsiz değiştirebilir miyim?",
        answer: "Evet, İstanbulkart’ınız kullanıcı hatası dışındaki manyetik/çip arızası nedeniyle kullanım dışı kaldıysa, ücretsiz olarak değiştirebilirsiniz. Değişim işlemi için SmartTransit Mobil uygulamasını kullanabilir veya ALO 153 ile iletişime geçebilirsiniz."
    },
    {
        id: 19,
        category: "Başvuru Merkezleri",
        question: "İstanbulkart Başvuru Merkezlerinden nasıl başvuru yapabilirim? Gerekli evraklar nelerdir?",
        answer: "İstanbulkart Başvuru Merkezlerinden başvuru yapmak için, kimlik belgeniz ve gerekli evraklar ile birlikte başvuru merkezine gitmeniz gerekmektedir. Gerekli evraklar, başvurduğunuz kart türüne göre değişiklik gösterebilir."
    },
    {
        id: 20,
        category: "Bakiye İadesi",
        question: "İstanbulkart’ımdaki bakiyenin EFT ile iadesini alabilir miyim?",
        answer: "Evet, İstanbulkart’ınızdaki bakiyenin EFT ile iadesini alabilirsiniz. Bunun için SmartTransit Mobil uygulamasını kullanabilir veya ALO 153 ile iletişime geçebilirsiniz."
    }
];

export const SupportDashboard: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Tümü');
    const [selectedQuestion, setSelectedQuestion] = useState<FAQItem | null>(null);

    const categories = useMemo(() => {
        return ['Tümü', ...Array.from(new Set(FAQ_DATA.map((item) => item.category)))];
    }, []);

    const filteredFAQs = useMemo(() => {
        return FAQ_DATA.filter((faq) => {
            const matchesCategory = selectedCategory === 'Tümü' || faq.category === selectedCategory;
            const matchesSearch =
                faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                faq.category.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [searchTerm, selectedCategory]);

    return (
        <div className="sd-wrapper">
            <style>{`
                .sd-wrapper { font-family: system-ui, -apple-system, sans-serif; background-color: #f8fafc; min-height: 100vh; color: #1e293b; margin: 0; padding: 0; box-sizing: border-box; }
                .sd-wrapper * { box-sizing: border-box; }
                .sd-header { background: linear-gradient(135deg, #1d4ed8 0%, #3730a3 50%, #0f172a 100%); color: white; padding: 3rem 1.5rem; text-align: center; position: relative; }
                .sd-header-content { max-width: 1000px; margin: 0 auto; }
                .sd-back-btn { display: inline-flex; align-items: center; gap: 0.5rem; background: rgba(255,255,255,0.12); color: white; border: 1px solid rgba(255,255,255,0.2); padding: 0.5rem 1rem; border-radius: 12px; cursor: pointer; transition: all 0.2s; margin-bottom: 1.5rem; font-size: 0.875rem; font-weight: 500; }
                .sd-back-btn:hover { background: rgba(255,255,255,0.22); }
                .sd-icon-badge { display: inline-flex; padding: 0.75rem; background: rgba(255,255,255,0.1); border-radius: 16px; margin-bottom: 1rem; }
                .sd-title { font-size: 2.25rem; font-weight: 800; margin: 0; letter-spacing: -0.025em; }
                .sd-subtitle { color: #bfdbfe; font-size: 0.95rem; margin-top: 0.5rem; }
                .sd-search-box { position: relative; max-width: 550px; margin: 2rem auto 0; }
                .sd-search-input { width: 100%; padding: 1rem 1rem 1rem 3rem; border-radius: 16px; border: none; outline: none; font-size: 0.95rem; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.2); background: white; color: #0f172a; }
                .sd-search-icon { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: #94a3b8; }
                .sd-main { max-width: 1100px; margin: 0 auto; padding: 2.5rem 1.5rem; }
                .sd-cat-container { display: flex; gap: 0.5rem; overflow-x: auto; padding: 0.5rem 0 1rem; margin-top: 0.5rem; }
                .sd-cat-chip { padding: 0.5rem 1rem; border-radius: 12px; border: 1px solid #cbd5e1; background: white; color: #475569; font-size: 0.85rem; font-weight: 600; cursor: pointer; white-space: nowrap; transition: all 0.2s; }
                .sd-cat-chip:hover { border-color: #94a3b8; background: #f1f5f9; }
                .sd-cat-chip.active { background: #2563eb; color: white; border-color: #2563eb; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25); }
                .sd-faq-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 1rem; margin-top: 1.5rem; }
                .sd-faq-card { background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 1.25rem; cursor: pointer; display: flex; justify-content: space-between; align-items: center; transition: all 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.02); }
                .sd-faq-card:hover { border-color: #3b82f6; transform: translateY(-2px); box-shadow: 0 10px 20px -5px rgba(59, 130, 246, 0.1); }
                .sd-badge { display: inline-block; background: #eff6ff; color: #2563eb; font-size: 0.75rem; font-weight: 700; padding: 0.25rem 0.6rem; border-radius: 6px; margin-bottom: 0.5rem; }
                .sd-contact-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; margin-top: 1.5rem; }
                .sd-contact-card { background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 1.5rem; text-align: center; display: flex; flex-direction: column; align-items: center; transition: all 0.2s; }
                .sd-contact-card:hover { border-color: #93c5fd; box-shadow: 0 10px 20px -5px rgba(0,0,0,0.05); }
                .sd-modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; padding: 1rem; z-index: 999; }
                .sd-modal { background: white; width: 100%; max-width: 520px; border-radius: 24px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); }
            `}</style>

            {/* Üst Header */}
            <header className="sd-header">
                <div className="sd-header-content">
                    {onBack && (
                        <button onClick={onBack} className="sd-back-btn">
                            <ArrowLeft size={16} />
                            <span>Geri Dön</span>
                        </button>
                    )}

                    <div>
                        <div className="sd-icon-badge">
                            <HelpCircle size={32} color="#bfdbfe" />
                        </div>
                        <h1 className="sd-title">Nasıl Yardımcı Olabiliriz?</h1>
                        <p className="sd-subtitle">
                            SmartTransit ve İstanbulkart işlemleri hakkında merak ettiğiniz tüm sorular burada.
                        </p>

                        <div className="sd-search-box">
                            <Search className="sd-search-icon" size={20} />
                            <input
                                type="text"
                                placeholder="Bir soru veya konu arayın (örn. İade, Yükleme...)"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="sd-search-input"
                            />
                        </div>
                    </div>
                </div>
            </header>

            {/* İçerik */}
            <main className="sd-main">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Sıkça Sorulan Sorular</h2>
                        <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '4px 0 0 0' }}>
                            Kategorilere göre filtreleme yapabilirsiniz.
                        </p>
                    </div>
                    <span style={{ background: '#eff6ff', color: '#2563eb', padding: '6px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700 }}>
                        {filteredFAQs.length} Soru
                    </span>
                </div>

                {/* Kategori Butonları */}
                <div className="sd-cat-container">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`sd-cat-chip ${selectedCategory === cat ? 'active' : ''}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Soru Listesi */}
                {filteredFAQs.length > 0 ? (
                    <div className="sd-faq-grid">
                        {filteredFAQs.map((faq) => (
                            <div key={faq.id} onClick={() => setSelectedQuestion(faq)} className="sd-faq-card">
                                <div>
                                    <span className="sd-badge">{faq.category}</span>
                                    <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: '#1e293b' }}>
                                        {faq.question}
                                    </h3>
                                </div>
                                <ChevronRight size={20} color="#94a3b8" style={{ flexShrink: 0 }} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '4rem 1rem', background: 'white', borderRadius: '16px', marginTop: '1.5rem' }}>
                        <HelpCircle size={48} color="#cbd5e1" style={{ margin: '0 auto 1rem' }} />
                        <p style={{ margin: 0, fontWeight: 600, color: '#475569' }}>Sonuç bulunamadı.</p>
                    </div>
                )}

                {/* Bize Ulaşın */}
                <section style={{ marginTop: '4rem', paddingTop: '3rem', borderTop: '1px solid #e2e8f0' }}>
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Bize Ulaşın</h2>
                        <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '4px' }}>
                            Sorunuza yanıt bulamadıysanız bize 7/24 ulaşabilirsiniz.
                        </p>
                    </div>

                    <div className="sd-contact-grid">
                        <div className="sd-contact-card">
                            <Phone size={24} color="#2563eb" style={{ marginBottom: '0.75rem' }} />
                            <strong style={{ fontSize: '0.95rem' }}>Çağrı Merkezi</strong>
                            <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>7/24 Destek</span>
                            <a href="tel:153" style={{ marginTop: '1rem', color: '#2563eb', fontWeight: 700, textDecoration: 'none' }}>ALO 153</a>
                        </div>

                        <div className="sd-contact-card">
                            <Mail size={24} color="#4f46e5" style={{ marginBottom: '0.75rem' }} />
                            <strong style={{ fontSize: '0.95rem' }}>E-Posta</strong>
                            <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>Sorularınız için</span>
                            <a href="mailto:smarttransit.test@gmail.com" style={{ marginTop: '1rem', color: '#4f46e5', fontWeight: 600, fontSize: '0.8rem', textDecoration: 'none' }}>smarttransit.test@gmail.com</a>
                        </div>

                        <div className="sd-contact-card">
                            <Clock size={24} color="#d97706" style={{ marginBottom: '0.75rem' }} />
                            <strong style={{ fontSize: '0.95rem' }}>Çalışma Saatleri</strong>
                            <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>Hafta İçi</span>
                            <span style={{ marginTop: '1rem', fontWeight: 600, fontSize: '0.85rem' }}>08:30 - 18:00</span>
                        </div>

                        <div className="sd-contact-card">
                            <MessageSquare size={24} color="#059669" style={{ marginBottom: '0.75rem' }} />
                            <strong style={{ fontSize: '0.95rem' }}>Canlı Destek</strong>
                            <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>Anlık Chat</span>
                            <button style={{ marginTop: '1rem', background: '#059669', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}>
                                Sohbet Başlat
                            </button>
                        </div>
                    </div>
                </section>
            </main>

            {/* Modal */}
            {selectedQuestion && (
                <div className="sd-modal-overlay">
                    <div className="sd-modal">
                        <div style={{ padding: '1.25rem 1.5rem', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <span className="sd-badge">{selectedQuestion.category}</span>
                                <h3 style={{ margin: '0.5rem 0 0', fontSize: '1.1rem', color: '#0f172a' }}>{selectedQuestion.question}</h3>
                            </div>
                            <button onClick={() => setSelectedQuestion(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                                <X size={20} />
                            </button>
                        </div>
                        <div style={{ padding: '1.5rem', fontSize: '0.95rem', lineHeight: '1.6', color: '#334155', whiteSpace: 'pre-line' }}>
                            {selectedQuestion.answer}
                        </div>
                        <div style={{ padding: '1rem 1.5rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0', textAlign: 'right' }}>
                            <button onClick={() => setSelectedQuestion(null)} style={{ background: '#2563eb', color: 'white', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}>
                                Kapat
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SupportDashboard;