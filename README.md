# Maaş ve Çalışma Takip Sistemi

Bu proje, çalışanların maaş, fazla mesai, izin ve tatil bilgilerini yönetebilecekleri modern bir web uygulamasıdır. React, TypeScript ve Tailwind CSS kullanılarak geliştirilmiştir.

## 🚀 Özellikler

### 🔐 Kullanıcı Yönetimi
- Kullanıcı kaydı ve girişi
- Güvenli oturum yönetimi
- Otomatik giriş (localStorage ile veri kalıcılığı)
- Hatalı giriş uyarıları

### 💰 Maaş Yönetimi
- Net maaşa göre otomatik saatlik ücret hesaplama
- Brüt/Net maaş hesaplayıcı
- Maaş geçmişi ve BES/ikramiye yönetimi
- Ücretsiz izin günleri maaştan otomatik düşülür
- Aylık maaş tahminleri

### ⏰ Fazla Mesai Takibi
- Normal gün, hafta sonu, tatil mesaileri (1.5x, 2.0x)
- Otomatik ücret hesaplama
- Mesai geçmişi ve istatistikleri
- Takvim entegrasyonu

### 📅 İzin Yönetimi
- **İzin Türleri:**
  - Ücretli İzin (Para Kesmez)
  - Ücretsiz İzin (Para Keser)
  - Yıllık İzin (Para Kesmez)
  - Doğum İzni (Para Kesmez)
  - Ölüm İzni (Para Kesmez)
  - İdari İzin (Para Kesmez)
- 1 yıl hizmet şartı (yıllık izin için)
- İzin geçmişi ve onay durumları

### 📊 Raporlar ve Analiz
- Aylık gelir trendleri
- Yıllık maaş karşılaştırmaları
- Fazla mesai istatistikleri
- İzin kullanım raporları
- Veri dışa aktarma

### 🎨 Kullanıcı Arayüzü
- Modern ve responsive tasarım
- Karanlık/Aydınlık tema desteği
- YouTube tarzı açılır/kapanır sidebar
- Mobil uyumlu tasarım
- Türkçe arayüz

### 📅 Takvim ve Tatiller
- Türkiye resmi tatilleri
- İzin ve mesai görselleştirmesi
- Aylık/haftalık görünüm
- Etkinlik renk kodlaması

## 🛠️ Teknolojiler

- **Frontend:** React 18, TypeScript
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Build Tool:** Vite
- **Deployment:** Vercel

## 📦 Kurulum

### Gereksinimler
- Node.js (v16 veya üzeri)
- npm veya yarn

### Adımlar

1. **Projeyi klonlayın:**
```bash
git clone https://github.com/FansiB0/mesai_takip_web.git
cd mesai_takip_web
```

2. **Bağımlılıkları yükleyin:**
```bash
npm install
```

3. **Geliştirme sunucusunu başlatın:**
```bash
npm run dev
```

4. **Tarayıcınızda açın:**
```
http://localhost:5173
```

## 🚀 Canlı Demo

Proje Vercel'de yayınlanmıştır: [Canlı Demo](https://mesai-takip-web.vercel.app)

## 📋 Kullanım

### İlk Kurulum
1. Uygulamaya kayıt olun
2. Ayarlar bölümünden maaş bilgilerinizi girin
3. Varsayılan net maaşınızı belirleyin
4. Günlük çalışma saatlerinizi ayarlayın

### Maaş Hesaplama
- **Saatlik Ücret:** `Net Maaş / (Günlük Saat × 30)`
- **Örnek:** 30.000₺ net maaş, günde 7.5 saat
- **Hesaplama:** 30.000 / (7.5 × 30) = 133.33₺/saat

### İzin Yönetimi
- Ücretsiz izinler otomatik olarak maaştan düşülür
- Günlük kesinti: `Net Maaş / 30`
- Yıllık izin hakkı 1 yıl hizmet sonrası aktif olur

### Fazla Mesai
- Normal gün: 1.5x ücret
- Hafta sonu/Tatil: 2.0x ücret
- Otomatik hesaplama

## 🏗️ Proje Yapısı

```
src/
├── components/          # React bileşenleri
│   ├── Auth/           # Kimlik doğrulama
│   ├── Dashboard/      # Ana sayfa
│   ├── Layout/         # Sayfa düzeni
│   ├── Settings/       # Ayarlar
│   ├── Salary/         # Maaş yönetimi
│   ├── Overtime/       # Fazla mesai
│   ├── Leaves/         # İzin yönetimi
│   ├── Reports/        # Raporlar
│   └── Calendar/       # Takvim
├── contexts/           # React Context API
├── types/              # TypeScript tipleri
├── utils/              # Yardımcı fonksiyonlar
└── main.tsx           # Uygulama girişi
```

## 🔧 Geliştirme

### Komutlar
```bash
npm run dev          # Geliştirme sunucusu
npm run build        # Production build
npm run preview      # Build önizleme
npm run lint         # Kod kontrolü
```

### Veri Kalıcılığı
- Tüm veriler localStorage'da saklanır
- Oturum bilgileri otomatik yüklenir
- Ayarlar ve kullanıcı verileri kalıcı

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/AmazingFeature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add some AmazingFeature'`)
4. Branch'inizi push edin (`git push origin feature/AmazingFeature`)
5. Pull Request oluşturun

## 📞 İletişim

Proje Sahibi: [GitHub Profili](https://github.com/FansiB0)

---

**Not:** Bu uygulama demo amaçlı geliştirilmiştir. Gerçek iş ortamında kullanmadan önce güvenlik ve veri doğrulama önlemleri alınmalıdır.
