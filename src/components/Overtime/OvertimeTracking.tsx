import React, { useState } from 'react';
import { Plus, Clock, Calendar, Trash2, Edit } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';
import { calculateOvertimePay } from '../../utils/calculations';

const OvertimeTracking: React.FC = () => {
  const { overtimes, addOvertime, deleteOvertime } = useData();
  const { user } = useAuth();
  const { settings } = useSettings();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    date: '',
    hours: '',
    overtimeType: 'normal' as 'normal' | 'weekend' | 'holiday',
    hourlyRate: settings.salary.defaultHourlyRate || '150.00'
  });

  // Filter overtimes for current user
  const userOvertimes = overtimes.filter(overtime => overtime.userId === user?.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    const totalPayment = calculateOvertimePay(
      parseFloat(formData.hours),
      parseFloat(formData.hourlyRate),
      formData.overtimeType
    );
    
    const newOvertime = {
      userId: user.id,
      date: formData.date,
      hours: parseFloat(formData.hours),
      overtimeType: formData.overtimeType,
      hourlyRate: parseFloat(formData.hourlyRate),
      totalPayment
    };
    
    addOvertime(newOvertime);
    setShowAddForm(false);
    setFormData({
      date: '',
      hours: '',
      overtimeType: 'normal',
      hourlyRate: settings.salary.defaultHourlyRate || '150.00'
    });
  };

  const getOvertimeTypeLabel = (type: string) => {
    const labels = {
      normal: 'Normal Gün',
      weekend: 'Hafta Sonu',
      holiday: 'Resmi Tatil'
    };
    return labels[type as keyof typeof labels];
  };

  const getOvertimeMultiplier = (type: string) => {
    const multipliers = {
      normal: '1.5x',
      weekend: '2.0x',
      holiday: '2.0x'
    };
    return multipliers[type as keyof typeof multipliers];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Fazla Mesai Takibi</h1>
          <p className="text-gray-600 dark:text-gray-400">Fazla mesai saatlerinizi kaydedin ve takip edin</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Mesai Ekle
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Yeni Fazla Mesai Ekle</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tarih</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Saat</label>
              <input
                type="number"
                step="0.5"
                value={formData.hours}
                onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="8.0"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Mesai Türü</label>
              <select
                value={formData.overtimeType}
                onChange={(e) => setFormData({ ...formData, overtimeType: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="normal">Normal Gün (1.5x)</option>
                <option value="weekend">Hafta Sonu (2.0x)</option>
                <option value="holiday">Resmi Tatil (2.0x)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Saatlik Ücret</label>
              <input
                type="number"
                step="0.01"
                value={formData.hourlyRate}
                onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder={settings.salary.defaultHourlyRate || "133.33"}
              />
            </div>
            <div className="md:col-span-4 flex justify-end space-x-3">
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
                Kaydet
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Fazla Mesai Geçmişi</h3>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Toplam: {userOvertimes.reduce((sum, overtime) => sum + overtime.hours, 0)} saat
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-green-600" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Toplam: {userOvertimes.reduce((sum, overtime) => sum + overtime.totalPayment, 0).toLocaleString('tr-TR')} ₺
              </span>
            </div>
          </div>
        </div>
        
        {userOvertimes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Tarih</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Saat</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Tür</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Saatlik Ücret</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Toplam</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {userOvertimes.map((overtime) => (
                  <tr key={overtime.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {new Date(overtime.date).toLocaleDateString('tr-TR')}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                      {overtime.hours} saat
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        overtime.overtimeType === 'normal' 
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' 
                          : overtime.overtimeType === 'weekend'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                      }`}>
                        {getOvertimeTypeLabel(overtime.overtimeType)} ({getOvertimeMultiplier(overtime.overtimeType)})
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                      {overtime.hourlyRate.toLocaleString('tr-TR')} ₺/saat
                    </td>
                    <td className="py-3 px-4 font-semibold text-green-600 dark:text-green-400">
                      {overtime.totalPayment.toLocaleString('tr-TR')} ₺
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => deleteOvertime(overtime.id)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-2">Henüz fazla mesai kaydı yok</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">Yukarıdaki "Mesai Ekle" butonunu kullanarak fazla mesai kaydı oluşturabilirsiniz</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OvertimeTracking;