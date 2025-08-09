# Firebase Kullanıcı Oluşturma Rehberi

## 🔧 Manuel Kullanıcı Oluşturma

### 1. Firebase Console'a Giriş
- https://console.firebase.google.com adresine gidin
- `mesi-takip-web-v1` projesini seçin

### 2. Authentication Bölümüne Gidin
- Sol menüden "Authentication" seçin
- "Users" sekmesine tıklayın

### 3. Yeni Kullanıcı Ekleme
- "Add user" butonuna tıklayın
- **Email:** `test@example.com`
- **Password:** `123456`
- "Add user" butonuna tıklayın

### 4. Kullanıcı Bilgileri
```
Email: test@example.com
Password: 123456
```

## 🚀 Uygulama İçinde Kayıt Olma

### 1. Kayıt Olma Formu
- Uygulamada "Kayıt Ol" butonuna tıklayın
- Formu doldurun:
  - **Ad Soyad:** Test Kullanıcı
  - **E-posta:** test@example.com
  - **Şifre:** 123456
  - **Şifre Tekrar:** 123456
  - **İşe Başlama Tarihi:** Bugünün tarihi

### 2. Giriş Yapma
- Kayıt olduktan sonra otomatik giriş yapılır
- Veya "Giriş Yap" formunda:
  - **E-posta:** test@example.com
  - **Şifre:** 123456

## 🔍 Hata Durumları

### auth/invalid-credential
- **Neden:** Kullanıcı mevcut değil veya şifre yanlış
- **Çözüm:** Önce kayıt olun veya doğru bilgileri girin

### auth/email-already-in-use
- **Neden:** Email adresi zaten kullanılıyor
- **Çözüm:** Farklı bir email adresi kullanın

### auth/weak-password
- **Neden:** Şifre çok zayıf
- **Çözüm:** En az 6 karakterli şifre kullanın

## 📝 Test Kullanıcıları

### Önerilen Test Kullanıcıları:
```
1. Email: test@example.com
   Password: 123456

2. Email: demo@example.com
   Password: demo123

3. Email: user@example.com
   Password: user123
```

## ⚠️ Önemli Notlar

- Test kullanıcıları sadece geliştirme amaçlıdır
- Production'da gerçek kullanıcılar kendi hesaplarını oluşturmalıdır
- Şifreleri güvenli tutun ve paylaşmayın 