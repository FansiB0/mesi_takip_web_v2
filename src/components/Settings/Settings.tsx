import React, { useState } from 'react';
import { User, Bell, Shield, Calculator, Palette, Globe, Save } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useSettings } from '../../contexts/SettingsContext';

const Settings: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const { settings, updateSettings, updateAppearance } = useSettings();
  const [activeTab, setActiveTab] = useState('profile');

  const handleSave = async (section: string) => {
    if (section === 'profile') {
      await updateUser({
        name: settings.profile.name,
        email: settings.profile.email,
        startDate: settings.profile.startDate
      });
      showToast('Profil ayarları kaydedildi!');
    } else if (section === 'notifications') {
      showToast('Bildirim ayarları kaydedildi!');
    } else if (section === 'salary') {
      showToast('Maaş ayarları kaydedildi!');
    } else if (section === 'appearance') {
      showToast('Görünüm ayarları kaydedildi!');
    } else {
      showToast(`${section} ayarları kaydedildi!`);
    }
  };

  const handleAppearanceChange = (field: keyof typeof settings.appearance, value: any) => {
    updateAppearance({ [field]: value });
  };

  const tabs = [
    { id: 'profile', label: 'Profil Bilgileri', icon: User },
    { id: 'notifications', label: 'Bildirimler', icon: Bell },
    { id: 'salary', label: 'Maaş Ayarları', icon: Calculator },
    { id: 'appearance', label: 'Görünüm', icon: Palette },
    { id: 'security', label: 'Güvenlik', icon: Shield }
  ];

  const renderProfileSettings = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-4 mb-6">
        <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center">
          <User className="h-10 w-10 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{settings.profile.name}</h3>
          <p className="text-gray-600 dark:text-gray-400">{settings.profile.position}</p>
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-1">
            Profil fotoğrafını değiştir
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ad Soyad</label>
          <input
            type="text"
            value={settings.profile.name}
            onChange={(e) => updateSettings('profile', { name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">E-posta</label>
          <input
            type="email"
            value={settings.profile.email}
            onChange={(e) => updateSettings('profile', { email: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Telefon</label>
          <input
            type="tel"
            value={settings.profile.phone}
            onChange={(e) => updateSettings('profile', { phone: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            placeholder="+90 555 123 45 67"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Departman</label>
          <select
            value={settings.profile.department}
            onChange={(e) => updateSettings('profile', { department: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option>Yazılım Geliştirme</option>
            <option>İnsan Kaynakları</option>
            <option>Pazarlama</option>
            <option>Satış</option>
            <option>Muhasebe</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Pozisyon</label>
          <input
            type="text"
            value={settings.profile.position}
            onChange={(e) => updateSettings('profile', { position: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">İşe Başlama Tarihi</label>
          <input
            type="date"
            value={settings.profile.startDate}
            onChange={(e) => updateSettings('profile', { startDate: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => handleSave('profile')}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Save className="h-4 w-4 mr-2" />
          Kaydet
        </button>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Bildirim Tercihleri</h3>
        <div className="space-y-4">
          {Object.entries(settings.notifications).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {key === 'salaryReminder' && 'Maaş Günü Hatırlatıcısı'}
                  {key === 'overtimeApproval' && 'Fazla Mesai Onayları'}
                  {key === 'leaveStatus' && 'İzin Durumu Güncellemeleri'}
                  {key === 'holidayReminder' && 'Tatil Hatırlatıcıları'}
                  {key === 'emailNotifications' && 'E-posta Bildirimleri'}
                  {key === 'pushNotifications' && 'Push Bildirimleri'}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {key === 'salaryReminder' && 'Maaş ödeme günü yaklaştığında bildirim al'}
                  {key === 'overtimeApproval' && 'Fazla mesai onaylandığında bildirim al'}
                  {key === 'leaveStatus' && 'İzin talebinizin durumu değiştiğinde bildirim al'}
                  {key === 'holidayReminder' && 'Yaklaşan resmi tatiller için bildirim al'}
                  {key === 'emailNotifications' && 'Tüm bildirimleri e-posta ile al'}
                  {key === 'pushNotifications' && 'Tarayıcı push bildirimleri'}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => updateSettings('notifications', { [key]: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => handleSave('notifications')}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Save className="h-4 w-4 mr-2" />
          Kaydet
        </button>
      </div>
    </div>
  );

  const renderSalarySettings = () => {
    // Saatlik ücret hesaplama fonksiyonu
    const calculateHourlyRate = (netSalary: string, workingHoursPerDay: string, workingDaysPerWeek: string) => {
      const net = parseFloat(netSalary) || 0;
      const hoursPerDay = parseFloat(workingHoursPerDay) || 8;
      const daysPerWeek = parseFloat(workingDaysPerWeek) || 5;
      
      if (net === 0 || hoursPerDay === 0 || daysPerWeek === 0) return '0';
      
      // Aylık toplam çalışma saati (30 gün üzerinden)
      const monthlyWorkingHours = hoursPerDay * 30;
      
      // Saatlik ücret (net maaş / aylık toplam saat)
      const hourlyRate = net / monthlyWorkingHours;
      
      return hourlyRate.toFixed(2);
    };

    // Net maaş değiştiğinde saatlik ücreti güncelle
    const handleNetSalaryChange = (netSalary: string) => {
      const hourlyRate = calculateHourlyRate(netSalary, settings.salary.workingHoursPerDay, settings.salary.workingDaysPerWeek);
      updateSettings('salary', { 
        defaultNetSalary: netSalary,
        defaultHourlyRate: hourlyRate
      });
    };

    // Çalışma saatleri değiştiğinde saatlik ücreti güncelle
    const handleWorkingHoursChange = (field: string, value: string) => {
      const newSettings = { [field]: value };
      const hourlyRate = calculateHourlyRate(settings.salary.defaultNetSalary, 
        field === 'workingHoursPerDay' ? value : settings.salary.workingHoursPerDay,
        field === 'workingDaysPerWeek' ? value : settings.salary.workingDaysPerWeek
      );
      newSettings.defaultHourlyRate = hourlyRate;
      updateSettings('salary', newSettings);
    };

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Maaş ve Çalışma Ayarları</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Varsayılan Net Maaş (₺)</label>
              <input
                type="number"
                step="0.01"
                value={settings.salary.defaultNetSalary}
                onChange={(e) => handleNetSalaryChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="5000.00"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Bu değer değiştiğinde saatlik ücret otomatik hesaplanır</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Hesaplanan Saatlik Ücret (₺)</label>
              <input
                type="number"
                step="0.01"
                value={settings.salary.defaultHourlyRate}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Otomatik hesaplanır</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Para Birimi</label>
              <select
                value={settings.salary.currency}
                onChange={(e) => updateSettings('salary', { currency: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="TRY">Türk Lirası (₺)</option>
                <option value="USD">Amerikan Doları ($)</option>
                <option value="EUR">Euro (€)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Günlük Çalışma Saati</label>
              <input
                type="number"
                value={settings.salary.workingHoursPerDay}
                onChange={(e) => handleWorkingHoursChange('workingHoursPerDay', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Haftalık Çalışma Günü</label>
              <input
                type="number"
                value={settings.salary.workingDaysPerWeek}
                onChange={(e) => handleWorkingHoursChange('workingDaysPerWeek', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Yıllık İzin Hakkı (Gün)</label>
              <input
                type="number"
                value={settings.salary.annualLeaveEntitlement}
                onChange={(e) => updateSettings('salary', { annualLeaveEntitlement: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">BES Katkısı (₺)</label>
              <input
                type="number"
                value={settings.salary.besContribution}
                onChange={(e) => updateSettings('salary', { besContribution: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => handleSave('salary')}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Save className="h-4 w-4 mr-2" />
            Kaydet
          </button>
        </div>
      </div>
    );
  };

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Görünüm ve Dil Ayarları</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tema</label>
            <select
              value={settings.appearance.theme}
              onChange={(e) => handleAppearanceChange('theme', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="light">Açık Tema</option>
              <option value="dark">Koyu Tema</option>
              <option value="auto">Sistem Ayarı</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Dil</label>
            <select
              value={settings.appearance.language}
              onChange={(e) => handleAppearanceChange('language', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="tr">Türkçe</option>
              <option value="en">English</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tarih Formatı</label>
            <select
              value={settings.appearance.dateFormat}
              onChange={(e) => handleAppearanceChange('dateFormat', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sayı Formatı</label>
            <select
              value={settings.appearance.numberFormat}
              onChange={(e) => handleAppearanceChange('numberFormat', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="tr-TR">Türkiye (1.234,56)</option>
              <option value="en-US">ABD (1,234.56)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => handleSave('appearance')}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Save className="h-4 w-4 mr-2" />
          Kaydet
        </button>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Güvenlik Ayarları</h3>
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Şifre Değiştir</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Hesabınızın güvenliği için düzenli olarak şifrenizi değiştirin.</p>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Şifre Değiştir
            </button>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">İki Faktörlü Kimlik Doğrulama</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Hesabınıza ek güvenlik katmanı ekleyin.</p>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              Etkinleştir
            </button>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Aktif Oturumlar</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Hesabınıza bağlı aktif oturumları görüntüleyin ve yönetin.</p>
            <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
              Oturumları Görüntüle
            </button>
          </div>

          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <h4 className="font-medium text-red-900 dark:text-red-100 mb-2">Hesabı Sil</h4>
            <p className="text-sm text-red-700 dark:text-red-300 mb-4">Hesabınızı kalıcı olarak silmek istiyorsanız bu işlemi kullanın. Bu işlem geri alınamaz.</p>
            <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
              Hesabı Sil
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return renderProfileSettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'salary':
        return renderSalarySettings();
      case 'appearance':
        return renderAppearanceSettings();
      case 'security':
        return renderSecuritySettings();
      default:
        return renderProfileSettings();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Ayarlar</h1>
        <p className="text-gray-600 dark:text-gray-400">Hesap ve uygulama ayarlarınızı yönetin</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-1/4">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-r-2 border-blue-700 dark:border-blue-300'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="lg:w-3/4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;