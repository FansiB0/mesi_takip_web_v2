# Firebase Kurulum Rehberi

## 1. Firebase Console'da Proje Oluşturma

1. [Firebase Console](https://console.firebase.google.com/) adresine gidin
2. "Create a project" veya "Proje oluştur" butonuna tıklayın
3. Proje adını girin: `mesi-takip-web-v1`
4. Google Analytics'i etkinleştirin (isteğe bağlı)
5. "Create project" butonuna tıklayın

## 2. Web Uygulaması Ekleme

1. Proje oluşturulduktan sonra "Add app" butonuna tıklayın
2. Web simgesini seçin (</>)
3. Uygulama takma adı girin: `mesi-takip-web`
4. "Register app" butonuna tıklayın
5. Firebase konfigürasyon bilgilerini kopyalayın

## 3. Konfigürasyon Bilgilerini Güncelleme

`src/config/firebase.ts` dosyasındaki konfigürasyonu güncelleyin:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

## 4. Authentication Ayarları

1. Firebase Console'da "Authentication" sekmesine gidin
2. "Get started" butonuna tıklayın
3. "Sign-in method" sekmesine gidin
4. "Email/Password" sağlayıcısını etkinleştirin
5. "Save" butonuna tıklayın

## 5. Firestore Database Ayarları

1. Firebase Console'da "Firestore Database" sekmesine gidin
2. "Create database" butonuna tıklayın
3. "Start in test mode" seçeneğini seçin (demo için)
4. Bölge olarak "europe-west3" seçin
5. "Done" butonuna tıklayın

## 6. Güvenlik Kuralları

Firestore Database > Rules sekmesinde `firestore.rules` dosyasındaki kuralları kopyalayın:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Kullanıcı profilleri - sadece kendi profilini okuyabilir/yazabilir
    match /userProfiles/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Kullanıcı ayarları - sadece kendi ayarlarını okuyabilir/yazabilir
    match /userSettings/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Mesai verileri - sadece kendi verilerini okuyabilir/yazabilir
    match /overtimes/{document} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // İzin verileri - sadece kendi verilerini okuyabilir/yazabilir
    match /leaves/{document} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // Maaş verileri - sadece kendi verilerini okuyabilir/yazabilir
    match /salaries/{document} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // Çalışan verileri - sadece kendi verilerini okuyabilir/yazabilir
    match /employees/{document} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

## 7. Test Kullanıcısı Oluşturma

1. Authentication > Users sekmesine gidin
2. "Add user" butonuna tıklayın
3. Test kullanıcısı ekleyin:
   - Email: `demo@example.com`
   - Password: `123456`

## 8. Uygulamayı Test Etme

1. `npm run dev` ile uygulamayı başlatın
2. Kayıt ol veya giriş yap sayfasından test kullanıcısı ile giriş yapın
3. Mesai ve izin verilerini ekleyin
4. Firebase Console'da Firestore Database'de verilerin görünüp görünmediğini kontrol edin

## 9. Production için Güvenlik

Demo aşamasından sonra:
1. Firestore kurallarını daha sıkı hale getirin
2. Email doğrulamasını etkinleştirin
3. Rate limiting ekleyin
4. Backup stratejisi oluşturun

## Sorun Giderme

### Hata: "Firebase App named '[DEFAULT]' already exists"
- Firebase'i sadece bir kez initialize ettiğinizden emin olun

### Hata: "Permission denied"
- Firestore kurallarını kontrol edin
- Kullanıcının giriş yapmış olduğundan emin olun

### Hata: "Network error"
- İnternet bağlantınızı kontrol edin
- Firebase proje ayarlarını kontrol edin 