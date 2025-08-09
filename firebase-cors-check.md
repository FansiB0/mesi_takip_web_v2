# Firebase CORS Sorunu Çözüm Rehberi

## 🔍 Sorun: ERR_CONNECTION_RESET

Bu hata genellikle Firebase Firestore'da CORS (Cross-Origin Resource Sharing) ayarlarından kaynaklanır.

## 🛠️ Çözüm Adımları:

### 1. Firebase Console'da CORS Ayarları

1. **Firebase Console'a gidin:** https://console.firebase.google.com/
2. **Projenizi seçin:** `mesi-takip-web-v1`
3. **Firestore Database** > **Rules** sekmesine gidin
4. **CORS ayarlarını kontrol edin**

### 2. Firestore Rules Güncelleme

Mevcut rules dosyası doğru görünüyor, ancak CORS için ek ayarlar gerekebilir:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // CORS için genel erişim (geçici)
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
    
    // Kullanıcı profilleri
    match /userProfiles/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Kullanıcı ayarları
    match /userSettings/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Mesai verileri
    match /overtimes/{document} {
      allow read, write: if request.auth != null && 
        (resource == null || request.auth.uid == resource.data.userId);
    }
    
    // İzin verileri
    match /leaves/{document} {
      allow read, write: if request.auth != null && 
        (resource == null || request.auth.uid == resource.data.userId);
    }
    
    // Maaş verileri
    match /salaries/{document} {
      allow read, write: if request.auth != null && 
        (resource == null || request.auth.uid == resource.data.userId);
    }
    
    // Çalışan verileri
    match /employees/{document} {
      allow read, write: if request.auth != null && 
        (resource == null || request.auth.uid == resource.data.userId);
    }
  }
}
```

### 3. Firebase CLI ile CORS Ayarları

```bash
# Firebase CLI kurulumu
npm install -g firebase-tools

# Firebase'e giriş yapın
firebase login

# Projeyi başlatın
firebase init

# CORS ayarlarını güncelleyin
firebase deploy --only firestore:rules
```

### 4. Network Sorunları İçin Kontrol Listesi

- ✅ **Internet bağlantısı** kontrol edildi
- ✅ **Firewall ayarları** kontrol edildi
- ✅ **Proxy ayarları** kontrol edildi
- ✅ **DNS ayarları** kontrol edildi

### 5. Geçici Çözüm: localStorage Fallback

Uygulama zaten localStorage fallback mekanizmasına sahip. Firebase bağlantısı olmadığında veriler localStorage'da saklanacak.

## 🔧 Test Komutları:

```bash
# Firebase bağlantısını test et
curl -X GET "https://firestore.googleapis.com/v1/projects/mesi-takip-web-v1/databases/(default)/documents"

# CORS test
curl -H "Origin: https://mesi-takip-web-v1.vercel.app" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS \
     "https://firestore.googleapis.com/v1/projects/mesi-takip-web-v1/databases/(default)/documents"
```

## 📞 Destek

Sorun devam ederse:
1. Firebase Console'da **Support** sekmesine gidin
2. **Error logs** kontrol edin
3. **Network tab** in browser developer tools'da kontrol edin 