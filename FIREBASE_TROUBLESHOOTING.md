# Firebase Network Sorunları Çözüm Rehberi

## 🔧 ERR_BLOCKED_BY_CLIENT Hatası Çözümü

### **1. Ad Blocker Kontrolü:**
- uBlock Origin, AdBlock Plus gibi ad blocker'ları geçici olarak devre dışı bırakın
- Firebase domain'lerini whitelist'e ekleyin:
  - `*.firebaseapp.com`
  - `*.firebase.com`
  - `*.googleapis.com`

### **2. Antivirus/Firewall Kontrolü:**
- Windows Defender Firewall'da Firebase domain'lerine izin verin
- Antivirus yazılımınızda web korumasını geçici olarak kapatın

### **3. Browser Ayarları:**
- Chrome'da "Site Settings" > "Blocked" kontrol edin
- Firefox'ta "Enhanced Tracking Protection" geçici olarak kapatın

### **4. Network Ayarları:**
- Proxy kullanıyorsanız Firebase domain'lerini bypass edin
- VPN kullanıyorsanız geçici olarak kapatın

### **5. Test Etmek İçin:**
```javascript
// Browser console'da test edin:
fetch('https://firestore.googleapis.com/v1/projects/mesi-takip-web-v1/databases/(default)/documents')
  .then(response => console.log('✅ Firebase accessible'))
  .catch(error => console.error('❌ Firebase blocked:', error));
```

## 🚀 Alternatif Çözümler

### **1. LocalStorage Fallback:**
Uygulama zaten localStorage fallback kullanıyor, veriler kaybolmayacak.

### **2. Firebase Console'dan Manuel Kontrol:**
- Firebase Console > Firestore Database
- Koleksiyonları manuel olarak kontrol edin
- Güvenlik kurallarını kontrol edin

### **3. Network Debug:**
```javascript
// Network sekmesinde kontrol edin:
// 1. F12 > Network sekmesi
// 2. Firebase isteklerini filtreleyin
// 3. Blocked istekleri kontrol edin
```

## 📞 Destek

Sorun devam ederse:
1. Browser'ı değiştirin (Chrome, Firefox, Edge)
2. Incognito/Private modda test edin
3. Farklı network'te test edin (mobil hotspot) 