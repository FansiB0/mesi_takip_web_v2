import React, { useState, useCallback, useEffect } from 'react';
import { 
  User, 
  Bell, 
  DollarSign, 
  Palette, 
  Save, 
  Shield,
  Users,
  Database,
  Activity
} from 'lucide-react';
import { useSettings } from '../../contexts/SettingsContext';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import AdminPanel from '../Admin/AdminPanel';

const Settings: React.FC = () => {
  const { settings, updateSettings } = useSettings();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'salary' | 'appearance'>('profile');
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [localSettings, setLocalSettings] = useState(settings);

  // localSettings'i settings ile senkronize et
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  // Sadece local state'i güncelle, otomatik kaydetme yapma
  const handleInputChange = (section: keyof typeof settings, field: string, value: any) => {
    const newLocalSettings = {
      ...localSettings,
      [section]: {
        ...localSettings[section],
        [field]: value
      }
    };
    
    // Maaş ayarlarında otomatik hesaplama
    if (section === 'salary') {
      if (field === 'defaultNetSalary' || field === 'workingHoursPerDay' || field === 'workingDaysPerWeek') {
        const netSalary = field === 'defaultNetSalary' ? parseFloat(value) || 0 : parseFloat(newLocalSettings.salary.defaultNetSalary) || 0;
        const hoursPerDay = field === 'workingHoursPerDay' ? parseFloat(value) || 0 : parseFloat(newLocalSettings.salary.workingHoursPerDay) || 0;
        const daysPerWeek = field === 'workingDaysPerWeek' ? parseFloat(value) || 0 : parseFloat(newLocalSettings.salary.workingDaysPerWeek) || 0;
        
        // Saatlik ücreti otomatik hesapla
        if (netSalary > 0 && hoursPerDay > 0 && daysPerWeek > 0) {
          const monthlyHours = hoursPerDay * daysPerWeek * 5; // Aylık 30 gün (6 gün × 5 hafta)
          const hourlyRate = netSalary / monthlyHours;
          newLocalSettings.salary.defaultHourlyRate = hourlyRate.toFixed(1);
        }
      }
    }
    
    setLocalSettings(newLocalSettings);
  };

  const handleSave = async (section: keyof typeof settings) => {
    try {
      await updateSettings(section, localSettings[section]);
      showSuccess('Ayarlar başarıyla kaydedildi!');
    } catch (error) {
      console.error('Ayarlar kaydedilirken hata:', error);
      showError('Ayarlar kaydedilirken hata oluştu!');
    }
  };

  const isAdmin = user?.employeeType === 'admin';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Ayarlar</h1>
          <p className="text-gray-600 dark:text-gray-400">Hesap ve uygulama ayarlarınızı yönetin</p>
        </div>
        
        {/* Admin Panel Button */}
        {isAdmin && (
          <button
            onClick={() => setShowAdminPanel(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Shield className="h-5 w-5" />
            <span>Admin Paneli</span>
          </button>
        )}
      </div>

      {/* Navigation */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'profile'
              ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <User className="h-4 w-4" />
          <span>Profil</span>
        </button>
        
        <button
          onClick={() => setActiveTab('notifications')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'notifications'
              ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Bell className="h-4 w-4" />
          <span>Bildirimler</span>
        </button>
        
        <button
          onClick={() => setActiveTab('salary')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'salary'
              ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <DollarSign className="h-4 w-4" />
          <span>Maaş</span>
        </button>
        
        <button
          onClick={() => setActiveTab('appearance')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'appearance'
              ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Palette className="h-4 w-4" />
          <span>Görünüm</span>
        </button>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <User className="h-5 w-5" />
              Profil Bilgileri
            </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ad Soyad
                </label>
          <input
            type="text"
                  value={localSettings.profile.name}
                  onChange={(e) => handleInputChange('profile', 'name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
              
        <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  E-posta
                </label>
          <input
            type="email"
                  value={localSettings.profile.email}
                  onChange={(e) => handleInputChange('profile', 'email', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
              
        <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Telefon
                </label>
                        <input
                type="tel"
                  value={localSettings.profile.phone}
                  onChange={(e) => handleInputChange('profile', 'phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
        </div>
              
        <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Departman
                </label>
                <input
                  type="text"
                  value={localSettings.profile.department}
                  onChange={(e) => handleInputChange('profile', 'department', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
        </div>
              
        <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Pozisyon
                </label>
          <input
            type="text"
                  value={localSettings.profile.position}
                  onChange={(e) => handleInputChange('profile', 'position', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
              
        <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  İşe Başlama Tarihi
                </label>
          <input
            type="date"
                  value={localSettings.profile.startDate}
                  onChange={(e) => handleInputChange('profile', 'startDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
      </div>

            {/* Kaydet Butonu */}
            <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => handleSave('profile')}
                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
                <Save className="h-4 w-4" />
                <span>Kaydet</span>
        </button>
      </div>
    </div>
        )}

        {activeTab === 'notifications' && (
    <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Bildirim Ayarları
            </h2>
            
        <div className="space-y-4">
              <div className="flex items-center justify-between">
              <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Maaş Hatırlatıcıları</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Maaş günü yaklaştığında bildirim al</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                    checked={localSettings.notifications.salaryReminder}
                    onChange={(e) => handleInputChange('notifications', 'salaryReminder', e.target.checked)}
                  className="sr-only peer"
                />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
      </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Mesai Onay Bildirimleri</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Mesai talepleriniz onaylandığında bildirim al</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.notifications.overtimeApproval}
                    onChange={(e) => handleInputChange('notifications', 'overtimeApproval', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
        <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">İzin Durumu Bildirimleri</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">İzin taleplerinizin durumu değiştiğinde bildirim al</p>
            </div>
                <label className="relative inline-flex items-center cursor-pointer">
              <input
                    type="checkbox"
                    checked={localSettings.notifications.leaveStatus}
                    onChange={(e) => handleInputChange('notifications', 'leaveStatus', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
            </div>
              
              <div className="flex items-center justify-between">
            <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Tatil Hatırlatıcıları</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Yaklaşan tatiller hakkında bildirim al</p>
            </div>
                <label className="relative inline-flex items-center cursor-pointer">
              <input
                    type="checkbox"
                    checked={localSettings.notifications.holidayReminder}
                    onChange={(e) => handleInputChange('notifications', 'holidayReminder', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
            </div>
              
              <div className="flex items-center justify-between">
            <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">E-posta Bildirimleri</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Önemli güncellemeler için e-posta al</p>
            </div>
                <label className="relative inline-flex items-center cursor-pointer">
              <input
                    type="checkbox"
                    checked={localSettings.notifications.emailNotifications}
                    onChange={(e) => handleInputChange('notifications', 'emailNotifications', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
        </div>

              <div className="flex items-center justify-between">
      <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Push Bildirimleri</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Anlık bildirimler al</p>
          </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.notifications.pushNotifications}
                    onChange={(e) => handleInputChange('notifications', 'pushNotifications', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
      </div>

              <div className="flex items-center justify-between">
      <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Sistem Güncellemeleri</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Sistem güncellemeleri hakkında bilgilendir</p>
          </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.notifications.systemUpdates}
                    onChange={(e) => handleInputChange('notifications', 'systemUpdates', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
          </div>

              <div className="flex items-center justify-between">
      <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Güvenlik Uyarıları</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Güvenlik ile ilgili önemli uyarılar</p>
      </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.notifications.securityAlerts}
                    onChange={(e) => handleInputChange('notifications', 'securityAlerts', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Performans Raporları</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Haftalık performans raporları</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.notifications.performanceReports}
                    onChange={(e) => handleInputChange('notifications', 'performanceReports', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
              <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Haftalık Özet</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Haftalık çalışma özeti</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.notifications.weeklySummary}
                    onChange={(e) => handleInputChange('notifications', 'weeklySummary', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Aylık Rapor</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Aylık detaylı rapor</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.notifications.monthlyReport}
                    onChange={(e) => handleInputChange('notifications', 'monthlyReport', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
              <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Doğum Günü Hatırlatıcıları</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Çalışma arkadaşlarının doğum günleri</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.notifications.birthdayReminders}
                    onChange={(e) => handleInputChange('notifications', 'birthdayReminders', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">İş Yıldönümü</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">İş yıldönümü kutlamaları</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.notifications.workAnniversary}
                    onChange={(e) => handleInputChange('notifications', 'workAnniversary', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>

            {/* Kaydet Butonu */}
            <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => handleSave('notifications')}
                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Save className="h-4 w-4" />
                <span>Kaydet</span>
              </button>
          </div>
        </div>
      )}

        {activeTab === 'salary' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Maaş Ayarları
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Varsayılan Net Maaş
                </label>
                <input
                  type="number"
                  value={localSettings.salary.defaultNetSalary}
                  onChange={(e) => handleInputChange('salary', 'defaultNetSalary', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Varsayılan Saat Ücreti (Otomatik Hesaplanır)
                </label>
                <input
                  type="number"
                  value={localSettings.salary.defaultHourlyRate}
                  onChange={(e) => handleInputChange('salary', 'defaultHourlyRate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Otomatik hesaplanır"
                  readOnly
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Net maaş ÷ (Günlük saat × Haftalık gün × 5) = Saatlik ücret
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Örnek: 30.000₺ ÷ (7,5 saat × 6 gün × 5) = 133,3₺/saat
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Günlük Çalışma Saati
                </label>
                <input
                  type="number"
                  value={localSettings.salary.workingHoursPerDay}
                  onChange={(e) => handleInputChange('salary', 'workingHoursPerDay', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="8"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Haftalık Çalışma Günü
                </label>
                <input
                  type="number"
                  value={localSettings.salary.workingDaysPerWeek}
                  onChange={(e) => handleInputChange('salary', 'workingDaysPerWeek', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="5"
                />
              </div>
            </div>

            {/* Kaydet Butonu */}
            <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => handleSave('salary')}
                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Save className="h-4 w-4" />
                <span>Kaydet</span>
              </button>
          </div>
        </div>
      )}

        {activeTab === 'appearance' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Görünüm Ayarları
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tema
                </label>
                <select
                  value={localSettings.appearance.theme}
                  onChange={(e) => handleInputChange('appearance', 'theme', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="light">Açık</option>
                  <option value="dark">Koyu</option>
                  <option value="auto">Otomatik</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Dil
                </label>
                <select
                  value={localSettings.appearance.language}
                  onChange={(e) => handleInputChange('appearance', 'language', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="tr">Türkçe</option>
                  <option value="en">English</option>
                </select>
              </div>
              
                  <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Font Boyutu
                </label>
                <select
                  value={localSettings.appearance.fontSize}
                  onChange={(e) => handleInputChange('appearance', 'fontSize', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="small">Küçük</option>
                  <option value="medium">Orta</option>
                  <option value="large">Büyük</option>
                </select>
                  </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Renk Şeması
                </label>
                <select
                  value={localSettings.appearance.colorScheme}
                  onChange={(e) => handleInputChange('appearance', 'colorScheme', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="blue">Mavi</option>
                  <option value="green">Yeşil</option>
                  <option value="purple">Mor</option>
                  <option value="orange">Turuncu</option>
                </select>
                </div>
            </div>

            {/* Kaydet Butonu */}
            <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => handleSave('appearance')}
                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Save className="h-4 w-4" />
                <span>Kaydet</span>
              </button>
            </div>
          </div>
        )}
        </div>

      {/* Admin Panel Modal */}
      {showAdminPanel && (
        <AdminPanel onClose={() => setShowAdminPanel(false)} />
      )}
    </div>
  );
};

export default Settings;