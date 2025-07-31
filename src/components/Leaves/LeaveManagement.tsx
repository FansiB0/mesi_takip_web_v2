import React, { useState } from 'react';
import { Plus, Calendar, CheckCircle, XCircle, Clock, Trash2, Edit } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { formatDate } from '../../utils/calculations';
import { useSettings } from '../../contexts/SettingsContext';

const LeaveManagement: React.FC = () => {
  const { leaves, addLeave, deleteLeave } = useData();
  const { user } = useAuth();
  const { settings } = useSettings();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    reason: '',
    leaveType: 'annual' as 'paid' | 'unpaid' | 'annual' | 'maternity' | 'bereavement' | 'administrative'
  });

  // Filter leaves for current user
  const userLeaves = leaves.filter(leave => leave.userId === user?.id);

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
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const daysUsed = calculateDays(formData.startDate, formData.endDate);
    const newLeave = {
      userId: user.id,
      startDate: formData.startDate,
      endDate: formData.endDate,
      daysUsed,
      status: 'approved' as const, // Onay beklemesin
      reason: formData.reason,
      leaveType: formData.leaveType
    };
    addLeave(newLeave);
    setShowAddForm(false);
    setFormData({
      startDate: '',
      endDate: '',
      reason: '',
      leaveType: 'annual'
    });
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">İzin Nedeni</label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                rows={3}
                placeholder="İzin nedeninizi açıklayın..."
                required
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                İptal
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Talep Et
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
                    onClick={() => deleteLeave(leave.id)}
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