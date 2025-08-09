# Mesai Takip Web V2

Modern, güvenli ve kullanıcı dostu bir maaş ve çalışma takip uygulaması. React, TypeScript, Tailwind CSS ve Firebase kullanılarak geliştirilmiştir.

## 🌐 Canlı Demo
**Uygulama:** https://mesi-takip-web-v2.vercel.app/#

## 🆕 V2.0 Yeni Özellikler
- ✅ **Admin Paneli**: Kullanıcı yönetimi ve sistem logları
- ✅ **Gelişmiş Hata Yönetimi**: Kapsamlı hata yakalama sistemi
- ✅ **Form Validasyonu**: Real-time form doğrulama
- ✅ **Performans Optimizasyonu**: React.memo ve useMemo kullanımı
- ✅ **Güvenlik İyileştirmeleri**: XSS koruması ve input sanitization
- ✅ **UX/UI İyileştirmeleri**: Loading states, empty states, responsive design

## 🚀 Özellikler

### 📊 Ana Özellikler
- **Dashboard**: Maaş ve çalışma durumunun anlık özeti
- **Maaş Yönetimi**: Brüt/Net maaş hesaplamaları ve takibi
- **Fazla Mesai Takibi**: Mesai saatleri ve ücret hesaplamaları
- **İzin Yönetimi**: Yıllık izin, hastalık izni ve diğer izin türleri
- **Tatil Takvimi**: Resmi tatiller ve özel tatil günleri
- **Raporlama**: Detaylı analiz ve raporlar
- **Hesaplayıcılar**: Tazminat ve maaş hesaplayıcıları

### 🔒 Güvenlik Özellikleri
- **Gelişmiş Hata Yönetimi**: Kapsamlı hata yakalama ve kullanıcı dostu mesajlar
- **Form Validasyonu**: Kapsamlı input doğrulama ve sanitization
- **XSS Koruması**: Input sanitization ve güvenli veri işleme
- **Rate Limiting**: API isteklerinde hız sınırlama
- **Session Yönetimi**: Güvenli oturum kontrolü
- **Password Strength**: Güçlü şifre kontrolü

### ⚡ Performans Özellikleri
- **Retry Mekanizması**: Otomatik yeniden deneme sistemi
- **Memoization**: React.useMemo ve useCallback optimizasyonları
- **Lazy Loading**: Komponent bazlı kod bölme
- **Debounce/Throttle**: Kullanıcı etkileşimlerinde performans optimizasyonu
- **Offline Support**: Temel offline işlevsellik

### 🎨 UX/UI İyileştirmeleri
- **Loading States**: Kapsamlı yükleme durumları
- **Error Boundaries**: Hata sınırları ve kurtarma mekanizmaları
- **Empty States**: Boş durumlar için kullanıcı dostu arayüzler
- **Responsive Design**: Tüm cihazlarda mükemmel görünüm
- **Dark Mode**: Karanlık tema desteği
- **Toast Notifications**: Kullanıcı bildirimleri

## 🛠️ Teknolojiler

### Frontend
- **React 18**: Modern React özellikleri
- **TypeScript**: Tip güvenliği
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Modern ikonlar
- **Vite**: Hızlı build tool

### Backend & Veritabanı
- **Firebase**: Backend as a Service
- **Firestore**: NoSQL veritabanı
- **Firebase Auth**: Kimlik doğrulama
- **Firebase Hosting**: Web hosting

### Geliştirme Araçları
- **ESLint**: Kod kalitesi
- **Prettier**: Kod formatı
- **TypeScript**: Tip kontrolü

## 📦 Kurulum

### Gereksinimler
- Node.js 18+ 
- npm veya yarn
- Firebase hesabı

### Adımlar

1. **Projeyi klonlayın**
```bash
git clone https://github.com/your-username/mesi_takip_web_V1.git
cd mesi_takip_web_V1
```

2. **Bağımlılıkları yükleyin**
```bash
npm install
```

3. **Firebase yapılandırması**
```bash
# Firebase projenizi oluşturun ve config bilgilerini alın
# src/config/firebase.ts dosyasını güncelleyin
```

4. **Geliştirme sunucusunu başlatın**
```bash
npm run dev
```

5. **Production build**
```bash
npm run build
```

## 🔧 Yapılandırma

### Firebase Kurulumu
1. [Firebase Console](https://console.firebase.google.com/)'da yeni proje oluşturun
2. Authentication'ı etkinleştirin (Email/Password)
3. Firestore Database'i oluşturun
4. Proje ayarlarından config bilgilerini alın
5. `src/config/firebase.ts` dosyasını güncelleyin

### Environment Variables
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## 📁 Proje Yapısı

```
src/
├── components/          # React komponentleri
│   ├── Auth/           # Kimlik doğrulama komponentleri
│   ├── Dashboard/      # Dashboard komponentleri
│   ├── Layout/         # Layout komponentleri
│   ├── Salary/         # Maaş yönetimi komponentleri
│   ├── Overtime/       # Fazla mesai komponentleri
│   ├── Leaves/         # İzin yönetimi komponentleri
│   ├── Reports/        # Raporlama komponentleri
│   ├── Settings/       # Ayarlar komponentleri
│   └── Calculators/    # Hesaplayıcı komponentleri
├── contexts/           # React Context'leri
├── services/           # API servisleri
├── types/              # TypeScript tip tanımları
├── utils/              # Yardımcı fonksiyonlar
│   ├── calculations.ts # Hesaplama fonksiyonları
│   ├── validation.ts   # Form validasyonu
│   ├── errorHandler.ts # Hata yönetimi
│   └── security.ts     # Güvenlik fonksiyonları
└── config/             # Yapılandırma dosyaları
```

## 🔄 Yeni Özellikler (v2.0)

### Hata Yönetimi
- ✅ Kapsamlı hata yakalama sistemi
- ✅ Retry mekanizması
- ✅ Kullanıcı dostu hata mesajları
- ✅ Error boundaries

### Form Validasyonu
- ✅ Real-time form validasyonu
- ✅ Input sanitization
- ✅ Kapsamlı doğrulama kuralları
- ✅ Hata mesajları

### Performans
- ✅ React.memo optimizasyonları
- ✅ useMemo ve useCallback kullanımı
- ✅ Lazy loading
- ✅ Debounce/throttle

### UX/UI
- ✅ Loading states
- ✅ Empty states
- ✅ Error displays
- ✅ Responsive design
- ✅ Dark mode

### Güvenlik
- ✅ XSS koruması
- ✅ Input sanitization
- ✅ Rate limiting
- ✅ Password strength validation

## 🚀 Deployment

### Firebase Hosting
```bash
npm run build
firebase deploy
```

### Vercel
```bash
npm run build
vercel --prod
```

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için `LICENSE` dosyasına bakın.

## 🆘 Destek

Herhangi bir sorun yaşarsanız:
1. [Issues](https://github.com/your-username/mesi_takip_web_V1/issues) sayfasını kontrol edin
2. Yeni issue oluşturun
3. Email ile iletişime geçin: support@example.com

## 🔮 Gelecek Planları

- [ ] PWA desteği
- [ ] Mobile app
- [ ] Advanced analytics
- [ ] Multi-language support
- [ ] Advanced reporting
- [ ] Integration APIs

---

**Not**: Bu proje aktif geliştirme aşamasındadır. Yeni özellikler ve iyileştirmeler düzenli olarak eklenmektedir.
