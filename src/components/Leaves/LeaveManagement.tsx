import React, { useState } from 'react';
import { Plus, Calendar, CheckCircle, XCircle, Clock, Trash2, Loader2 } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { formatDate } from '../../utils/calculations';
import { useSettings } from '../../contexts/SettingsContext';
import { useToast } from '../../contexts/ToastContext';

const LeaveManagement: React.FC = () => {
  const { leaves, addLeave, deleteLeave, loadingStates } = useData();
  const { user } = useAuth();
  const { settings } = useSettings();
  const { showSuccess, showError } = useToast();
  const [showAddForm, setShowAddForm] = useState(false);

  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    reason: '',
    leaveType: 'annual' as 'annual' | 'unpaid' | 'sick' | 'maternity' | 'bereavement' | 'administrative' | 'personal' | 'other'
  });

  // Filter leaves for current user
  const userLeaves = leaves.filter(leave => leave.userId === user?.id);
  const isLoading = loadingStates.leaves.isLoading;

  const calculateDays = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  // Yıllık izin hakkı hesaplama fonksiyonu
  const getAnnualLeaveEntitlement = () => {
    if (!user?.startDate) return 0; // İşe başlama tarihi yoksa 0 gün
    
    const start = new Date(user.startDate);
    const now = new Date();
    const years = now.getFullYear() - start.getFullYear();
    const months = now.getMonth() - start.getMonth();
    
    // 1 yılı dolmamışsa yıllık izin hakkı yok
    if (years < 1) return 0;
    
    // Settings'ten alınan yıllık izin hakkı
    const annualLeaveDays = parseInt(settings.salary.annualLeaveEntitlement) || 14;
    return years * annualLeaveDays;
  };

  const annualLeaveEntitlement = getAnnualLeaveEntitlement();

  // Onaylı izin yerine tüm yıllık izinleri topla (onay beklemesin)
  const totalUsedDays = userLeaves
    .filter(leave => (leave.leaveType || 'annual') === 'annual')
    .reduce((sum: number, leave) => sum + leave.daysUsed, 0);

  const remainingDays = annualLeaveEntitlement - totalUsedDays;

  // handleSubmit fonksiyonunda status 'approved' olarak eklensin
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showError('Kullanıcı girişi gerekli');
      return;
    }
    
    console.log('🔄 Submitting leave form with data:', formData);
    
    const daysUsed = calculateDays(formData.startDate, formData.endDate);
    console.log('📅 Calculated days:', daysUsed);
    
    const newLeave = {
      userId: user.id,
      startDate: formData.startDate,
      endDate: formData.endDate,
      daysUsed,
      status: 'approved' as const, // Onay beklemesin
      reason: formData.reason,
      leaveType: formData.leaveType,
      type: (() => {
        switch (formData.leaveType) {
          case 'annual': return 'annual' as const;
          case 'maternity': return 'sick' as const;
          case 'bereavement': return 'sick' as const;
          case 'administrative': return 'personal' as const;
          case 'paid': return 'personal' as const;
          case 'unpaid': return 'personal' as const;
          default: return 'personal' as const;
        }
      })()
    };
    
    console.log('📝 New leave object:', newLeave);
    
    const result = await addLeave(newLeave);
    console.log('📊 Add leave result:', result);
    
    if (result.success) {
      showSuccess('İzin talebi başarıyla oluşturuldu!');
      setShowAddForm(false);
      setFormData({
        startDate: '',
        endDate: '',
        reason: '',
        leaveType: 'annual'
      });
    } else {
      showError(result.error || 'İzin eklenirken hata oluştu');
    }
  };

  const handleDeleteLeave = async (id: string) => {
    const result = await deleteLeave(id);
    if (result.success) {
      showSuccess('İzin talebi başarıyla silindi!');
    } else {
      showError(result.error || 'İzin silinirken hata oluştu');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Onaylandı';
      case 'rejected':
        return 'Reddedildi';
      default:
        return 'Beklemede';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getLeaveTypeText = (type: string) => {
    switch (type) {
      case 'paid':
        return 'Ücretli İzin';
      case 'unpaid':
        return 'Ücretsiz İzin';
      case 'annual':
        return 'Yıllık İzin';
      case 'maternity':
        return 'Doğum İzni';
      case 'bereavement':
        return 'Ölüm İzni';
      case 'administrative':
        return 'İdari İzin';
      default:
        return 'Diğer';
    }
  };

  const getLeaveTypeColor = (type: string) => {
    switch (type) {
      case 'paid':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'unpaid':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'annual':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'maternity':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400';
      case 'bereavement':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      case 'administrative':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getLeaveTypeDescription = (type: string) => {
    switch (type) {
      case 'paid':
        return 'Maaş kesintisi olmayan izin';
      case 'unpaid':
        return 'Maaş kesintisi olan izin';
      case 'annual':
        return 'Yıllık izin hakkından düşülür';
      case 'maternity':
        return 'Doğum öncesi ve sonrası izin';
      case 'bereavement':
        return 'Yakın akraba vefatı izni';
      case 'administrative':
        return 'İdari kararla verilen izin';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">İzin Yönetimi</h1>
          <p className="text-gray-600 dark:text-gray-400">İzin taleplerinizi yönetin ve takip edin</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          İzin Talebi
        </button>
      </div>

      {/* İzin Durumu Özeti */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Toplam İzin Hakkı</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{annualLeaveEntitlement} gün</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Kullanılan İzin</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalUsedDays} gün</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-orange-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Kalan İzin</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{remainingDays} gün</p>
            </div>
          </div>
        </div>
      </div>

      {/* İzin Türleri Detaylı İstatistikleri */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">İzin Türleri Dağılımı</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Yıllık İzin */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Yıllık İzin</span>
              <span className="text-xs bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                Ücretli
              </span>
            </div>
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {userLeaves.filter(leave => leave.leaveType === 'annual').reduce((sum, leave) => sum + leave.daysUsed, 0)} gün
            </p>
          </div>

          {/* Ücretsiz İzin */}
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-red-700 dark:text-red-300">Ücretsiz İzin</span>
              <span className="text-xs bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-300 px-2 py-1 rounded">
                Kesintili
              </span>
            </div>
            <p className="text-2xl font-bold text-red-900 dark:text-red-100">
              {userLeaves.filter(leave => leave.leaveType === 'unpaid').reduce((sum, leave) => sum + leave.daysUsed, 0)} gün
            </p>
          </div>

          {/* Hastalık İzni */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300">Hastalık İzni</span>
              <span className="text-xs bg-yellow-100 dark:bg-yellow-800 text-yellow-700 dark:text-yellow-300 px-2 py-1 rounded">
                Raporlu
              </span>
            </div>
            <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
              {userLeaves.filter(leave => leave.leaveType === 'sick').reduce((sum, leave) => sum + leave.daysUsed, 0)} gün
            </p>
          </div>

          {/* Diğer İzinler */}
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Diğer İzinler</span>
              <span className="text-xs bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-300 px-2 py-1 rounded">
                Karma
              </span>
            </div>
            <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
              {userLeaves.filter(leave => !['annual', 'unpaid', 'sick'].includes(leave.leaveType || '')).reduce((sum, leave) => sum + leave.daysUsed, 0)} gün
            </p>
          </div>
        </div>

        {/* İzin Kullanım Oranı */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Yıllık İzin Kullanım Oranı</span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {annualLeaveEntitlement > 0 ? Math.round((totalUsedDays / annualLeaveEntitlement) * 100) : 0}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
              style={{ 
                width: `${annualLeaveEntitlement > 0 ? Math.min((totalUsedDays / annualLeaveEntitlement) * 100, 100) : 0}%` 
              }}
            ></div>
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
            <span>0 gün</span>
            <span>{annualLeaveEntitlement} gün</span>
          </div>
        </div>
      </div>

      {/* Aylık İzin Kullanım Grafiği */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Aylık İzin Kullanımı</h3>
        <div className="grid grid-cols-12 gap-2">
          {Array.from({ length: 12 }, (_, index) => {
            const month = index + 1;
            const monthName = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'][index];
            const currentYear = new Date().getFullYear();
            
            // Bu ay kullanılan izin günleri
            const monthlyLeaves = userLeaves.filter(leave => {
              const startDate = new Date(leave.startDate);
              return startDate.getFullYear() === currentYear && startDate.getMonth() + 1 === month;
            });
            
            const monthlyDays = monthlyLeaves.reduce((sum, leave) => sum + leave.daysUsed, 0);
            const maxDays = Math.max(...userLeaves.map(leave => leave.daysUsed), 5); // En az 5 gün referans
            const barHeight = monthlyDays > 0 ? Math.max((monthlyDays / maxDays) * 100, 10) : 0;
            
            return (
              <div key={month} className="flex flex-col items-center">
                <div className="h-20 w-8 bg-gray-200 dark:bg-gray-700 rounded-t flex items-end justify-center relative">
                  {monthlyDays > 0 && (
                    <div 
                      className="bg-blue-500 w-6 rounded-t transition-all duration-300 flex items-end justify-center"
                      style={{ height: `${barHeight}%` }}
                    >
                      <span className="text-xs text-white font-medium mb-1">{monthlyDays}</span>
                    </div>
                  )}
                </div>
                <span className="text-xs text-gray-600 dark:text-gray-400 mt-1">{monthName}</span>
              </div>
            );
          })}
        </div>
        
        {/* Grafik Açıklaması */}
        <div className="flex items-center justify-center mt-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
              <span>Kullanılan İzin Günleri</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hızlı İzin Aksiyonları */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Hızlı İşlemler</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Yarım Gün İzin */}
          <button 
            onClick={() => {
              const today = new Date().toISOString().split('T')[0];
              setFormData({
                startDate: today,
                endDate: today,
                reason: 'Yarım gün izin',
                leaveType: 'unpaid'
              });
              setShowAddForm(true);
            }}
            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
          >
            <div className="text-center">
              <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Yarım Gün İzin</span>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Bugün için hızlı talep</p>
            </div>
          </button>

          {/* Mazeret İzni */}
          <button 
            onClick={() => {
              const today = new Date().toISOString().split('T')[0];
              setFormData({
                startDate: today,
                endDate: today,
                reason: 'Mazeret izni',
                leaveType: 'unpaid'
              });
              setShowAddForm(true);
            }}
            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-colors"
          >
            <div className="text-center">
              <XCircle className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Mazeret İzni</span>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Acil durumlar için</p>
            </div>
          </button>

          {/* Hafta Sonu Uzatma */}
          <button 
            onClick={() => {
              const nextMonday = new Date();
              nextMonday.setDate(nextMonday.getDate() + (1 + 7 - nextMonday.getDay()) % 7);
              setFormData({
                startDate: nextMonday.toISOString().split('T')[0],
                endDate: nextMonday.toISOString().split('T')[0],
                reason: 'Hafta sonu uzatma',
                leaveType: 'annual'
              });
              setShowAddForm(true);
            }}
            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
          >
            <div className="text-center">
              <Calendar className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Pazartesi İzni</span>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Hafta sonu uzatma</p>
            </div>
          </button>
        </div>
      </div>

      {/* Yıllık İzin Uyarısı */}
      {annualLeaveEntitlement === 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <Clock className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Yıllık İzin Hakkı
              </h3>
              <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                <p>
                  Henüz 1 yıllık çalışma sürenizi tamamlamadığınız için yıllık izin hakkınız bulunmamaktadır. 
                  İşe başlama tarihinizden itibaren 1 yıl geçtikten sonra yıllık izin talep edebilirsiniz.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* İzin Talep Formu */}
      {showAddForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Yeni İzin Talebi</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Başlangıç Tarihi</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Bitiş Tarihi</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">İzin Türü</label>
              <select
                value={formData.leaveType}
                onChange={(e) => setFormData({ ...formData, leaveType: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                required
              >
                <option value="paid">Ücretli İzin (Para Kesmez)</option>
                <option value="unpaid">Ücretsiz İzin (Para Keser)</option>
                {annualLeaveEntitlement > 0 && <option value="annual">Yıllık İzin (Para Kesmez)</option>}
                <option value="maternity">Doğum İzni (Para Kesmez)</option>
                <option value="bereavement">Ölüm İzni (Para Kesmez)</option>
                <option value="administrative">İdari İzin (Para Kesmez)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                İzin Nedeni <span className="text-gray-500 text-xs">(Opsiyonel)</span>
              </label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                rows={3}
                placeholder="İzin nedeninizi açıklayabilirsiniz (opsiyonel)..."
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                disabled={isLoading}
              >
                İptal
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Ekleniyor...</span>
                  </>
                ) : (
                  <span>Talep Et</span>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* İzin Listesi */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">İzin Geçmişi</h3>
        
        {userLeaves.length > 0 ? (
          <div className="space-y-4">
            {userLeaves.map((leave) => (
              <div key={leave.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-4">
                  {getStatusIcon(leave.status)}
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {getLeaveTypeText(leave.leaveType || 'annual')}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(leave.startDate)} - {formatDate(leave.endDate)} ({leave.daysUsed} gün)
                    </p>
                    {leave.reason && (
                      <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">{leave.reason}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${getLeaveTypeColor(leave.leaveType || 'annual')}`}>
                    {getLeaveTypeText(leave.leaveType || 'annual')}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(leave.status)}`}>
                    {getStatusText(leave.status)}
                  </span>
                  <button
                    onClick={() => leave.id && handleDeleteLeave(leave.id)}
                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-2">Henüz izin talebi bulunmuyor</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">Yukarıdaki "İzin Talebi" butonunu kullanarak izin talep edebilirsiniz</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaveManagement;