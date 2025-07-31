import React, { useState } from 'react';
import { Plus, DollarSign, Calculator, Trash2, Edit } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';
import { formatCurrency } from '../../utils/calculations';

const SalaryManagement: React.FC = () => {
  const { salaries, leaves, addSalary, deleteSalary } = useData();
  const { user } = useAuth();
  const { settings } = useSettings();
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [calculatorNet, setCalculatorNet] = useState('24457');
  const [calculatorBes, setCalculatorBes] = useState(settings.salary.besContribution || '500');
  const [formData, setFormData] = useState({
    month: 'Ocak',
    year: 2025,
    netSalary: '',
    bonus: '',
    besDeduction: settings.salary.besContribution || '500'
  });

  // Filter salaries for current user
  const userSalaries = salaries.filter(salary => salary.userId === user?.id);

  const handleCalculate = () => {
    const net = parseFloat(calculatorNet);
    const bes = parseFloat(calculatorBes);
    
    // Brüt maaş hesaplama
    const gross = (net + bes) / 0.75;
    
    // Bu ay için ücretsiz izin kontrolü
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    const userLeaves = leaves.filter(leave => leave.userId === user?.id);
    const currentMonthLeaves = userLeaves.filter(leave => {
      const leaveStart = new Date(leave.startDate);
      const leaveEnd = new Date(leave.endDate);
      return (leaveStart.getMonth() === currentMonth && leaveStart.getFullYear() === currentYear) ||
             (leaveEnd.getMonth() === currentMonth && leaveEnd.getFullYear() === currentYear);
    });
    
    const unpaidLeaveDays = currentMonthLeaves
      .filter(leave => leave.leaveType === 'unpaid' && leave.status === 'approved')
      .reduce((sum, leave) => sum + leave.daysUsed, 0);
    
    // Ücretsiz izin kesintisi (net maaşa göre)
    const dailySalary = net / 30; // Günlük maaş (30 gün üzerinden)
    const unpaidLeaveDeduction = unpaidLeaveDays * dailySalary;
    
    // İzin kesintisi sonrası net maaş
    const adjustedNet = net - unpaidLeaveDeduction;
    
    return {
      gross: (adjustedNet + bes) / 0.75,
      net: adjustedNet,
      unpaidLeaveDays,
      unpaidLeaveDeduction
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Maaş Yönetimi</h1>
          <p className="text-gray-600 dark:text-gray-400">Maaş bilgilerinizi yönetin ve hesaplayın</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowCalculator(!showCalculator)}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Calculator className="h-4 w-4 mr-2" />
            Brüt/Net Hesapla
          </button>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Maaş Ekle
          </button>
        </div>
      </div>

      {showCalculator && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Net/Brüt Maaş Hesaplayıcı</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Net Maaş (₺)
              </label>
              <input
                type="number"
                value={calculatorNet}
                onChange={(e) => setCalculatorNet(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="24457"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                BES Kesintisi (₺)
              </label>
              <input
                type="number"
                value={calculatorBes}
                onChange={(e) => setCalculatorBes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder={settings.salary.besContribution || "500"}
              />
            </div>
            <div className="flex items-end">
              <div className="w-full p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-sm text-green-700 dark:text-green-300 font-medium">Brüt Maaş</p>
                <p className="text-xl font-bold text-green-800 dark:text-green-200">
                  {formatCurrency(handleCalculate().gross)}
                </p>
              </div>
            </div>
          </div>
          
          {/* Ücretsiz İzin Bilgisi */}
          {handleCalculate().unpaidLeaveDays > 0 && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-700 dark:text-red-300">Ücretsiz İzin Kesintisi</p>
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {handleCalculate().unpaidLeaveDays} gün ücretsiz izin = -{formatCurrency(handleCalculate().unpaidLeaveDeduction)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-red-700 dark:text-red-300 font-medium">Düzeltilmiş Net Maaş</p>
                  <p className="text-lg font-bold text-red-800 dark:text-red-200">
                    {formatCurrency(handleCalculate().net)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {showAddForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Yeni Maaş Bilgisi Ekle</h3>
          <form onSubmit={(e) => {
            e.preventDefault();
            if (!user) return;
            
            // Net maaştan brüt maaş hesaplama (yaklaşık)
            const netSalary = parseFloat(formData.netSalary);
            const besDeduction = parseFloat(formData.besDeduction);
            // Brüt maaş = Net maaş + vergiler (yaklaşık %25 vergi oranı)
            const grossSalary = (netSalary + besDeduction) / 0.75;
            
            const newSalary = {
              userId: user.id,
              month: formData.month,
              year: formData.year,
              netSalary,
              grossSalary,
              bonus: parseFloat(formData.bonus) || 0,
              besDeduction
            };
            
            addSalary(newSalary);
            setShowAddForm(false);
            setFormData({
              month: 'Ocak',
              year: 2025,
              netSalary: '',
              bonus: '',
              besDeduction: settings.salary.besContribution || '500'
            });
          }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ay</label>
              <select
                value={formData.month}
                onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
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
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Yıl</label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                min="2020"
                max="2030"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Net Maaş (₺)</label>
              <input
                type="number"
                step="0.01"
                value={formData.netSalary}
                onChange={(e) => setFormData({ ...formData, netSalary: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="24457"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">İkramiye (₺)</label>
              <input
                type="number"
                step="0.01"
                value={formData.bonus}
                onChange={(e) => setFormData({ ...formData, bonus: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">BES Kesintisi (₺)</label>
              <input
                type="number"
                step="0.01"
                value={formData.besDeduction}
                onChange={(e) => setFormData({ ...formData, besDeduction: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder={settings.salary.besContribution || "500"}
              />
            </div>
            <div className="md:col-span-2 lg:col-span-3 flex justify-end space-x-3">
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
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Maaş Geçmişi</h3>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Toplam: {formatCurrency(userSalaries.reduce((sum, salary) => sum + salary.netSalary, 0))}
              </span>
            </div>
          </div>
        </div>
        
        {userSalaries.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Dönem</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Net Maaş</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Brüt Maaş</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">İkramiye</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">BES</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {userSalaries.map((salary) => (
                  <tr key={salary.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                      {salary.month} {salary.year}
                    </td>
                    <td className="py-3 px-4 font-semibold text-green-600 dark:text-green-400">
                      {formatCurrency(salary.netSalary)}
                    </td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                      {formatCurrency(salary.grossSalary)}
                    </td>
                    <td className="py-3 px-4 text-blue-600 dark:text-blue-400">
                      {salary.bonus > 0 ? formatCurrency(salary.bonus) : '-'}
                    </td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                      {formatCurrency(salary.besDeduction)}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => deleteSalary(salary.id)}
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
            <DollarSign className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-2">Henüz maaş verisi girilmemiş</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">Yukarıdaki "Maaş Ekle" butonunu kullanarak maaş verilerinizi girebilirsiniz</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalaryManagement;