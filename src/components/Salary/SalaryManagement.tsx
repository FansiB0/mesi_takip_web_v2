import React, { useState } from 'react';
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
    year: '',
    baseSalary: '',
    overtimePay: '',
    deductions: '',
    netSalary: ''
  });

  const handleAddSalary = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      showError('Kullanıcı bilgisi bulunamadı');
      return;
    }

    if (!formData.month || !formData.year || !formData.baseSalary || !formData.netSalary) {
      showError('Lütfen tüm alanları doldurun');
      return;
    }

    const newSalary = {
      userId: user.id,
      month: formData.month,
      year: formData.year.toString(),
      baseSalary: parseFloat(formData.baseSalary),
      overtimePay: parseFloat(formData.overtimePay || '0'),
      deductions: parseFloat(formData.deductions || '0'),
      netSalary: parseFloat(formData.netSalary)
    };

    const result = await addSalary(newSalary);
    
    if (result.success) {
      showSuccess('Maaş başarıyla eklendi');
      setFormData({
        month: '',
        year: '',
        baseSalary: '',
        overtimePay: '',
        deductions: '',
        netSalary: ''
      });
    } else {
      showError(result.error || 'Maaş eklenirken hata oluştu');
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
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Maaş Ekle</h2>
        <form onSubmit={handleAddSalary} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Ay</label>
              <input
                type="text"
                value={formData.month}
                onChange={(e) => setFormData({...formData, month: e.target.value})}
                placeholder="Ocak"
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Yıl</label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({...formData, year: e.target.value})}
                placeholder="2024"
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Temel Maaş</label>
              <input
                type="number"
                value={formData.baseSalary}
                onChange={(e) => setFormData({...formData, baseSalary: e.target.value})}
                placeholder="0"
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Mesai Ücreti</label>
              <input
                type="number"
                value={formData.overtimePay}
                onChange={(e) => setFormData({...formData, overtimePay: e.target.value})}
                placeholder="0"
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Kesintiler</label>
              <input
                type="number"
                value={formData.deductions}
                onChange={(e) => setFormData({...formData, deductions: e.target.value})}
                placeholder="0"
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Net Maaş</label>
              <input
                type="number"
                value={formData.netSalary}
                onChange={(e) => setFormData({...formData, netSalary: e.target.value})}
                placeholder="0"
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            Maaş Ekle
          </button>
        </form>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Maaş Geçmişi</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ay/Yıl
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Temel Maaş
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mesai
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kesintiler
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Net Maaş
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {salaries.map((salary) => (
                <tr key={salary.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {salary.month} {salary.year}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₺{salary.baseSalary?.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₺{salary.overtimePay?.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₺{salary.deductions?.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                    ₺{salary.netSalary?.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => handleDeleteSalary(salary.id!)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Sil
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SalaryManagement;