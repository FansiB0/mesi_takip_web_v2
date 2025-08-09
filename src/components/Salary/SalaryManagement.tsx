import React, { useState } from 'react';
import { DollarSign, Plus, Loader2 } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Salary } from '../../types';

const SalaryManagement: React.FC = () => {
  const { salaries, addSalary, deleteSalary, loadingStates } = useData();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [formData, setFormData] = useState({
    month: '',
    year: new Date().getFullYear().toString(),
    netSalary: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);

  const handleAddSalary = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      showError('Kullanıcı bilgisi bulunamadı');
      return;
    }

    if (!formData.month || !formData.year || !formData.netSalary) {
      showError('Lütfen tüm alanları doldurun');
      return;
    }

    setIsLoading(true);
    
    try {
      // Ay isimlerini sayıya çevir
      const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 
                         'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
      const monthNumber = monthNames.indexOf(formData.month) + 1;
      
      const newSalary = {
        userId: user.id,
        month: monthNumber, // String'den number'a çevir
        year: parseInt(formData.year.toString()),
        grossSalary: 0, // Brüt maaş kaldırıldı, 0 olarak set ediliyor
        netSalary: parseFloat(formData.netSalary),
        bonus: 0,
        besDeduction: 0
      };

      const result = await addSalary(newSalary);
      
      if (result.success) {
        showSuccess('Maaş başarıyla eklendi');
        setFormData({
          month: '',
          year: new Date().getFullYear().toString(),
          netSalary: ''
        });
      } else {
        showError(result.error || 'Maaş eklenirken hata oluştu');
      }
    } catch (error) {
      showError('Maaş eklenirken beklenmeyen bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSalary = async (id: string) => {
    if (confirm('Bu maaş kaydını silmek istediğinizden emin misiniz?')) {
      const result = await deleteSalary(id);
      if (result.success) {
        showSuccess('Maaş kaydı silindi');
      } else {
        showError(result.error || 'Maaş silinirken hata oluştu');
      }
    }
  };

  if (loadingStates.salaries.isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Modern Maaş Ekleme Kartı */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
            <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Yeni Maaş Kaydı</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Maaş bilgilerinizi ekleyin</p>
          </div>
        </div>
        
        <form onSubmit={handleAddSalary} className="space-y-6">
          {/* Dönem Bilgileri */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Ay Seçimi */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Dönem Ayı
              </label>
              <select
                value={formData.month}
                onChange={(e) => setFormData({...formData, month: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                required
              >
                <option value="">Ay Seçiniz</option>
                <option value="Ocak">Ocak</option>
                <option value="Şubat">Şubat</option>
                <option value="Mart">Mart</option>
                <option value="Nisan">Nisan</option>
                <option value="Mayıs">Mayıs</option>
                <option value="Haziran">Haziran</option>
                <option value="Temmuz">Temmuz</option>
                <option value="Ağustos">Ağustos</option>
                <option value="Eylül">Eylül</option>
                <option value="Ekim">Ekim</option>
                <option value="Kasım">Kasım</option>
                <option value="Aralık">Aralık</option>
              </select>
            </div>

            {/* Yıl */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Yıl
              </label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({...formData, year: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                placeholder="2024"
                required
              />
            </div>
          </div>

          {/* Net Maaş */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Net Maaş (₺) *
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.netSalary}
              onChange={(e) => setFormData({...formData, netSalary: e.target.value})}
              placeholder="20,000"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
              required
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Maaş Ekle
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Modern Maaş Geçmişi */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
            <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Maaş Geçmişi</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Geçmiş maaş ödemeleriniz</p>
          </div>
        </div>
        {salaries.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Dönem</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Net Maaş</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {salaries.map((salary: Salary) => (
                  <tr key={salary.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {salary.month} {salary.year || ''}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-medium text-green-600 dark:text-green-400">
                        {(salary.netSalary || 0).toLocaleString('tr-TR')} ₺
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => salary.id && handleDeleteSalary(salary.id)}
                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        Sil
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <DollarSign className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Henüz maaş kaydı yok</h3>
            <p className="text-gray-500 dark:text-gray-400">Yukarıdaki formu kullanarak ilk maaş kaydınızı oluşturun</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalaryManagement;