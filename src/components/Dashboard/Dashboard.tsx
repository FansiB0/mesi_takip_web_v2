import React, { useEffect } from 'react';
import { DollarSign, Clock, Calendar, TrendingUp } from 'lucide-react';
import StatsCard from './StatsCard';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';
import { formatCurrency } from '../../utils/calculations';

const Dashboard: React.FC = () => {
  const { settings } = useSettings();
  const { user } = useAuth();
  const { salaries, overtimes, leaves, holidays } = useData();

  // Ay numarasını döndüren yardımcı fonksiyon
  const getMonthNumber = (monthName: string) => {
    const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
    return months.indexOf(monthName);
  };

  // Filter data for current user
  const userSalaries = salaries.filter(salary => salary.userId === user?.id);
  const userOvertimes = overtimes.filter(overtime => overtime.userId === user?.id);
  const userLeaves = leaves.filter(leave => leave.userId === user?.id);
  
  // Get upcoming holidays
  const today = new Date();
  const upcomingHolidays = holidays
    .filter(holiday => new Date(holiday.date) > today)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  // Güncel ay için tahmini maaş hesaplama
  const calculateCurrentMonthSalary = () => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    // Bu ay için girilen fazla mesailer
    const currentMonthOvertimes = userOvertimes.filter(overtime => {
      const overtimeDate = new Date(overtime.date);
      return overtimeDate.getMonth() === currentMonth && overtimeDate.getFullYear() === currentYear;
    });
    
    const totalOvertimePay = currentMonthOvertimes.reduce((sum, overtime) => sum + overtime.totalPayment, 0);
    
    // Bu ay için girilen izinler
    const currentMonthLeaves = userLeaves.filter(leave => {
      const leaveStart = new Date(leave.startDate);
      const leaveEnd = new Date(leave.endDate);
      return (leaveStart.getMonth() === currentMonth && leaveStart.getFullYear() === currentYear) ||
             (leaveEnd.getMonth() === currentMonth && leaveEnd.getFullYear() === currentYear);
    });
    
    // Ücretsiz izin günlerini hesapla
    const unpaidLeaveDays = currentMonthLeaves
      .filter(leave => leave.leaveType === 'unpaid' && leave.status === 'approved')
      .reduce((sum, leave) => sum + leave.daysUsed, 0);
    
    // 1. TABAN MAAŞ: Settings'teki varsayılan net maaş
    const baseSalary = parseFloat(settings.salary.defaultNetSalary) || 5000.00;
    
    // 2. ÜCRETSİZ İZİN KESİNTİSİ: Raporlar kısmındaki mantık (30 gün üzerinden)
    const dailySalary = baseSalary / 30; // Günlük maaş (30 gün üzerinden)
    const unpaidLeaveDeduction = unpaidLeaveDays * dailySalary;
    
    // 3. BES KATKISI: Settings'ten
    const besContribution = parseFloat(settings.salary.besContribution) || 0;
    
    // 4. BRÜT MAAŞ: Net maaştan brüte çevirme
    // Net maaş = Brüt maaş - (Brüt maaş * vergi oranı)
    // Brüt maaş = Net maaş / (1 - vergi oranı)
    const netSalary = baseSalary - unpaidLeaveDeduction + totalOvertimePay;
    
    // Vergi oranını belirle
    const taxRate = netSalary > 50000 ? 0.35 : netSalary > 30000 ? 0.30 : netSalary > 15000 ? 0.25 : 0.20;
    
    // Brüt maaş hesaplama
    const grossSalary = netSalary / (1 - taxRate);
    
    return {
      baseSalary: baseSalary, // Settings'teki varsayılan net maaş
      overtimePay: totalOvertimePay,
      besContribution,
      grossSalary,
      netSalary,
      overtimeHours: currentMonthOvertimes.reduce((sum, overtime) => sum + overtime.hours, 0),
      unpaidLeaveDays,
      unpaidLeaveDeduction
    };
  };

  const currentMonthSalary = calculateCurrentMonthSalary();
  

  
  // Gerçek kullanıcı verilerinden hesaplamalar
  const currentMonthSalaryFromData = userSalaries[userSalaries.length - 1];
  const totalOvertimeHours = userOvertimes.reduce((sum: number, overtime) => sum + overtime.hours, 0);
  const totalOvertimePay = userOvertimes.reduce((sum: number, overtime) => sum + overtime.totalPayment, 0);
  const usedLeaveDays = userLeaves.filter(leave => leave.status === 'approved').reduce((sum: number, leave) => sum + leave.daysUsed, 0);

  // Yıllık izin hakkı hesaplama
  const getAnnualLeaveEntitlement = () => {
    if (!user?.startDate) return 0;
    const start = new Date(user.startDate);
    const now = new Date();
    const years = now.getFullYear() - start.getFullYear();
    if (years < 1) return 0;
    
    // Settings'ten alınan yıllık izin hakkı
    const annualLeaveDays = parseInt(settings.salary.annualLeaveEntitlement) || 14;
    return years * annualLeaveDays;
  };

  const annualLeaveEntitlement = getAnnualLeaveEntitlement();
  const remainingLeaveDays = annualLeaveEntitlement - usedLeaveDays;

  // Geçen ay ile karşılaştırma
  const getCurrentMonthComparison = () => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    // Bu ayın maaş verisi
    const currentMonthSalaryData = userSalaries.find(salary => {
      const salaryDate = new Date(salary.year, getMonthNumber(salary.month), 1);
      return salaryDate.getMonth() === currentMonth && salaryDate.getFullYear() === currentYear;
    });
    
    // Geçen ayın maaş verisi
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const previousMonthSalaryData = userSalaries.find(salary => {
      const salaryDate = new Date(salary.year, getMonthNumber(salary.month), 1);
      return salaryDate.getMonth() === previousMonth && salaryDate.getFullYear() === previousYear;
    });

    if (!currentMonthSalaryData || !previousMonthSalaryData) {
      return { change: "Veri yok", changeType: "neutral" as const };
    }

    const currentNet = currentMonthSalaryData.netSalary;
    const previousNet = previousMonthSalaryData.netSalary;
    const changePercent = ((currentNet - previousNet) / previousNet) * 100;
    
    return {
      change: `${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(1)}% geçen aya göre`,
      changeType: changePercent >= 0 ? "positive" as const : "negative" as const
    };
  };

  // Yıllık karşılaştırma
  const getYearlyComparison = () => {
    const currentYear = new Date().getFullYear();
    const currentYearSalaries = userSalaries.filter(salary => salary.year === currentYear);
    const previousYearSalaries = userSalaries.filter(salary => salary.year === currentYear - 1);

    if (currentYearSalaries.length === 0 || previousYearSalaries.length === 0) {
      return { change: "Veri yok", changeType: "neutral" as const };
    }

    const currentYearTotal = currentYearSalaries.reduce((sum, salary) => sum + salary.netSalary, 0);
    const previousYearTotal = previousYearSalaries.reduce((sum, salary) => sum + salary.netSalary, 0);
    const changePercent = ((currentYearTotal - previousYearTotal) / previousYearTotal) * 100;
    
    return {
      change: `${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(1)}% geçen yıla göre`,
      changeType: changePercent >= 0 ? "positive" as const : "negative" as const
    };
  };

  const currentMonthComparison = getCurrentMonthComparison();
  const yearlyComparison = getYearlyComparison();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Anasayfa</h1>
          <p className="text-gray-600 dark:text-gray-400">Maaş ve çalışma durumunuzun özeti</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500 dark:text-gray-400">Son güncellenme</p>
          <p className="font-medium text-gray-900 dark:text-white">{new Date().toLocaleDateString('tr-TR')}</p>
        </div>
      </div>

      {/* Bu Ay Tahmini Maaş */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 rounded-xl shadow-sm p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-blue-200 mr-3" />
            <div>
              <h3 className="text-xl font-semibold">Bu Ay Tahmini Maaş</h3>
              <p className="text-blue-100">Güncel ay için tahmini geliriniz</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">{formatCurrency(currentMonthSalary.netSalary)}</p>
            <p className="text-blue-200 text-sm">Net Maaş</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-6">
          <div className="bg-blue-500/20 rounded-lg p-4">
            <p className="text-blue-200 text-sm">Taban Maaş</p>
            <p className="text-xl font-semibold">{formatCurrency(currentMonthSalary.baseSalary)}</p>
          </div>
          <div className="bg-green-500/20 rounded-lg p-4">
            <p className="text-green-200 text-sm">Fazla Mesai</p>
            <p className="text-xl font-semibold">{formatCurrency(currentMonthSalary.overtimePay)}</p>
            <p className="text-green-200 text-xs">{currentMonthSalary.overtimeHours} saat</p>
          </div>
          {currentMonthSalary.unpaidLeaveDays > 0 && (
            <div className="bg-red-500/20 rounded-lg p-4">
              <p className="text-red-200 text-sm">Ücretsiz İzin</p>
              <p className="text-xl font-semibold">-{formatCurrency(currentMonthSalary.unpaidLeaveDeduction)}</p>
              <p className="text-red-200 text-xs">{currentMonthSalary.unpaidLeaveDays} gün</p>
            </div>
          )}
          <div className="bg-purple-500/20 rounded-lg p-4">
            <p className="text-purple-200 text-sm">BES Katkısı</p>
            <p className="text-xl font-semibold">{formatCurrency(currentMonthSalary.besContribution)}</p>
          </div>
          <div className="bg-orange-500/20 rounded-lg p-4">
            <p className="text-orange-200 text-sm">Brüt Maaş</p>
            <p className="text-xl font-semibold">{formatCurrency(currentMonthSalary.grossSalary)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Bu Ayın Maaşı"
          value={formatCurrency(currentMonthSalaryFromData?.netSalary || currentMonthSalary.netSalary)}
          change={currentMonthComparison.change}
          changeType={currentMonthComparison.changeType}
          icon={DollarSign}
          iconColor="bg-blue-600"
        />
        
        <StatsCard
          title="Toplam Fazla Mesai"
          value={`${totalOvertimeHours} saat`}
          change={formatCurrency(totalOvertimePay)}
          changeType="positive"
          icon={Clock}
          iconColor="bg-green-600"
        />
        
        <StatsCard
          title="Kullanılan İzin"
          value={`${usedLeaveDays} gün`}
          change={`${remainingLeaveDays} gün kaldı`}
          changeType="neutral"
          icon={Calendar}
          iconColor="bg-orange-600"
        />
        
        <StatsCard
          title="Yıllık Toplam"
          value={formatCurrency(userSalaries.reduce((sum: number, salary) => sum + salary.netSalary, 0))}
          change={yearlyComparison.change}
          changeType={yearlyComparison.changeType}
          icon={TrendingUp}
          iconColor="bg-purple-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Son Maaş Ödemeleri</h3>
          <div className="space-y-3">
            {userSalaries.length > 0 ? (
              userSalaries.slice(-3).reverse().map((salary) => (
                <div key={salary.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{salary.month} {salary.year}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Net: {formatCurrency(salary.netSalary)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600 dark:text-green-400">{formatCurrency(salary.netSalary)}</p>
                    {salary.bonus > 0 && (
                      <p className="text-xs text-blue-600 dark:text-blue-400">+{formatCurrency(salary.bonus)} ikramiye</p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <DollarSign className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 mb-2">Henüz maaş verisi girilmemiş</p>
                <p className="text-sm text-gray-400 dark:text-gray-500">Maaş yönetimi bölümünden maaş verilerinizi girebilirsiniz</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Son Fazla Mesailer</h3>
          <div className="space-y-3">
            {userOvertimes.length > 0 ? (
              userOvertimes.slice(-3).reverse().map((overtime) => (
                <div key={overtime.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {new Date(overtime.date).toLocaleDateString('tr-TR')}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {overtime.hours} saat - {overtime.overtimeType === 'normal' ? 'Normal' : overtime.overtimeType === 'weekend' ? 'Hafta Sonu' : 'Tatil'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600 dark:text-green-400">{formatCurrency(overtime.totalPayment)}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{formatCurrency(overtime.hourlyRate)}/saat</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 mb-2">Henüz fazla mesai kaydı yok</p>
                <p className="text-sm text-gray-400 dark:text-gray-500">Fazla mesai bölümünden mesai kayıtlarınızı girebilirsiniz</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-green-600 to-green-700 dark:from-green-700 dark:to-green-800 rounded-xl shadow-sm p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2">Yaklaşan Tatiller</h3>
            {upcomingHolidays.length > 0 ? (
              <div className="space-y-2">
                {upcomingHolidays.map((holiday, index) => (
                  <p key={holiday.id} className="text-green-100">
                    {index === 0 ? 'Bir sonraki tatil: ' : `${index + 1}. `}
                    <span className="font-medium">
                      {new Date(holiday.date).toLocaleDateString('tr-TR')} - {holiday.name}
                    </span>
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-green-100">
                <span className="font-medium">Henüz tatil eklenmemiş</span>
              </p>
            )}
          </div>
          <Calendar className="h-12 w-12 text-green-200" />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;