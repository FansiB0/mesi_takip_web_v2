import React, { useState } from 'react';
import { BarChart3, TrendingUp, Download, Calendar, DollarSign, Clock } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';
import { formatCurrency } from '../../utils/calculations';

const ReportsAnalytics: React.FC = () => {
  const { salaries, overtimes, leaves } = useData();
  const { user } = useAuth();
  const { settings } = useSettings();
  const [selectedYear, setSelectedYear] = useState('2025');
  const [reportType, setReportType] = useState('salary');

  // Filter data for current user
  const userSalaries = salaries.filter(salary => salary.userId === user?.id);
  const userOvertimes = overtimes.filter(overtime => overtime.userId === user?.id);
  const userLeaves = leaves.filter(leave => leave.userId === user?.id);

  const generateSalaryReport = () => {
    const yearSalaries = userSalaries.filter(s => s.year.toString() === selectedYear);
    const totalGross = yearSalaries.reduce((sum: number, s) => sum + s.grossSalary, 0);
    const totalNet = yearSalaries.reduce((sum: number, s) => sum + s.netSalary, 0);
    const totalBonus = yearSalaries.reduce((sum: number, s) => sum + s.bonus, 0);
    
    // Yıl için ücretsiz izin kesintilerini hesapla
    const yearLeaves = userLeaves.filter(leave => {
      const leaveYear = new Date(leave.startDate).getFullYear().toString();
      return leaveYear === selectedYear && leave.leaveType === 'unpaid' && leave.status === 'approved';
    });
    
    const totalUnpaidLeaveDays = yearLeaves.reduce((sum, leave) => sum + leave.daysUsed, 0);
    // Günlük maaş hesaplama (aylık net maaş / 30 gün)
    const avgMonthlyNetSalary = yearSalaries.length > 0 ? totalNet / yearSalaries.length : 0;
    const avgDailySalary = avgMonthlyNetSalary / 30; // Günlük maaş (30 gün üzerinden)
    const totalUnpaidLeaveDeduction = totalUnpaidLeaveDays * avgDailySalary;
    
    const adjustedTotalNet = totalNet - totalUnpaidLeaveDeduction;
    const avgGross = totalGross / yearSalaries.length || 0;
    const avgNet = adjustedTotalNet / yearSalaries.length || 0;

    return {
      totalGross,
      totalNet: adjustedTotalNet,
      totalBonus,
      avgGross,
      avgNet,
      monthCount: yearSalaries.length,
      totalUnpaidLeaveDays,
      totalUnpaidLeaveDeduction
    };
  };

  const generateOvertimeReport = () => {
    const totalHours = userOvertimes.reduce((sum: number, o) => sum + o.hours, 0);
    const totalPayment = userOvertimes.reduce((sum: number, o) => sum + o.totalPayment, 0);
    const normalHours = userOvertimes.filter(o => o.overtimeType === 'normal').reduce((sum: number, o) => sum + o.hours, 0);
    const weekendHours = userOvertimes.filter(o => o.overtimeType === 'weekend').reduce((sum: number, o) => sum + o.hours, 0);
    const holidayHours = userOvertimes.filter(o => o.overtimeType === 'holiday').reduce((sum: number, o) => sum + o.hours, 0);

    return {
      totalHours,
      totalPayment,
      normalHours,
      weekendHours,
      holidayHours,
      avgHourlyRate: totalPayment / totalHours || 0
    };
  };

  const salaryReport = generateSalaryReport();
  const overtimeReport = generateOvertimeReport();

  // Aylık gelir trendini kullanıcı verilerinden oluştur
  const monthlyData = (() => {
    const monthNames = [
      'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
      'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
    ];
    
    return monthNames.map((month, index) => {
      // month number (1-12) ile karşılaştır, array index 0-based olduğu için +1 ekle
      const monthNumber = index + 1;
      const monthSalaries = userSalaries.filter(s => s.month === monthNumber && s.year.toString() === selectedYear);
      const monthOvertimes = userOvertimes.filter(o => {
        const overtimeDate = new Date(o.date);
        return overtimeDate.getMonth() === index && 
               overtimeDate.getFullYear().toString() === selectedYear;
      });
      
      // Debug için console log
      if (month === 'Temmuz') {
        console.log('🔍 Temmuz maaş debug:', {
          month,
          monthNumber,
          selectedYear,
          monthSalaries,
          allUserSalaries: userSalaries.map(s => ({ month: s.month, year: s.year, netSalary: s.netSalary }))
        });
      }
      
      const totalSalary = monthSalaries.reduce((sum, s) => sum + s.netSalary, 0);
      const totalOvertime = monthOvertimes.reduce((sum, o) => sum + o.totalPayment, 0);
      
      return {
        month,
        salary: totalSalary,
        overtime: totalOvertime,
        total: totalSalary + totalOvertime
      };
    }).filter(data => data.total > 0); // Sadece veri olan ayları göster
  })();

  const exportReport = (type: string) => {
    console.log(`Exporting ${type} report for ${selectedYear}`);
    // In a real app, this would generate and download a file
    alert(`${type} raporu Excel formatında indiriliyor...`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Raporlar ve Analiz</h1>
          <p className="text-gray-600 dark:text-gray-400">Gelir ve çalışma verilerinizi analiz edin</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="2024">2024</option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
          </select>
          <button
            onClick={() => exportReport(reportType)}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="h-4 w-4 mr-2" />
            Dışa Aktar
          </button>
        </div>
      </div>

      {/* Rapor Türü Seçimi */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center space-x-4 mb-6">
          <button
            onClick={() => setReportType('salary')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              reportType === 'salary'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <DollarSign className="h-4 w-4 mr-2 inline" />
            Maaş Raporu
          </button>
          <button
            onClick={() => setReportType('overtime')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              reportType === 'overtime'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <Clock className="h-4 w-4 mr-2 inline" />
            Fazla Mesai Raporu
          </button>
        </div>

        {reportType === 'salary' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Yıllık Toplam</h4>
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{formatCurrency(salaryReport.totalNet)}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Net Gelir</p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Ortalama Aylık</h4>
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{formatCurrency(salaryReport.avgNet)}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Net Ortalama</p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Toplam İkramiye</h4>
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{formatCurrency(salaryReport.totalBonus)}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Yıllık İkramiye</p>
            </div>
            
            {salaryReport.totalUnpaidLeaveDays > 0 && (
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-6 border border-red-200 dark:border-red-800">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-red-800 dark:text-red-200">Ücretsiz İzin</h4>
                  <Calendar className="h-6 w-6 text-red-600" />
                </div>
                <p className="text-3xl font-bold text-red-800 dark:text-red-200">-{formatCurrency(salaryReport.totalUnpaidLeaveDeduction)}</p>
                <p className="text-sm text-red-600 dark:text-red-400 mt-2">{salaryReport.totalUnpaidLeaveDays} gün kesinti</p>
              </div>
            )}
          </div>
        )}

        {reportType === 'overtime' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Toplam Saat</h4>
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{overtimeReport.totalHours}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Fazla Mesai Saati</p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Toplam Kazanç</h4>
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{formatCurrency(overtimeReport.totalPayment)}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Fazla Mesai Ücreti</p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Ortalama Saatlik</h4>
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{formatCurrency(overtimeReport.avgHourlyRate)}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Saatlik Ücret</p>
            </div>
          </div>
        )}
      </div>

      {/* Aylık Trend Grafiği */}
      {monthlyData.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Aylık Gelir Trendi</h3>
          <div className="space-y-3">
            {monthlyData.map((data, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-12 text-sm font-medium text-gray-900 dark:text-white">{data.month}</div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Maaş: {formatCurrency(data.salary)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Fazla Mesai: {formatCurrency(data.overtime)}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(data.total)}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Toplam</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsAnalytics;