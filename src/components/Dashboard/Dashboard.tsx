import React, { useEffect, useMemo, useCallback } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';
import StatsCard from './StatsCard';
import LoadingSpinner from '../LoadingSpinner';
import ErrorDisplay from '../ErrorDisplay';
import EmptyState from '../EmptyState';
import NetworkStatus from '../NetworkStatus';

import { 
  DollarSign, 
  Clock, 
  Calendar, 
  TrendingUp,
  RefreshCw,
  User,
  CalendarDays,
  Coins,
  Calculator
} from 'lucide-react';
import { formatCurrency, calculateGrossSalary } from '../../utils/calculations';

const Dashboard: React.FC = () => {
  const { 
    salaries, 
    overtimes, 
    leaves, 
    holidays, 
    loadingStates, 
    refreshData, 
    clearErrors,
    isOffline 
  } = useData();
  const { user } = useAuth();
  const { settings, showSalarySetupPrompt, dismissSalarySetupPrompt } = useSettings();

  // Loading ve error durumları
  const isLoading = Object.values(loadingStates).some(state => state.isLoading);
  const hasErrors = Object.values(loadingStates).some(state => state.error);

  // Ay numarasını string'e çevir - ÖNCE TANIMLA
  const getMonthNumber = useCallback((month: number): string => {
    return (month + 1).toString().padStart(2, '0');
  }, []);

  // Kullanıcıya ait verileri filtrele
  const userSalaries = useMemo(() => 
    salaries.filter(salary => salary.userId === user?.id), 
    [salaries, user?.id]
  );

  const userOvertimes = useMemo(() => 
    overtimes.filter(overtime => overtime.userId === user?.id), 
    [overtimes, user?.id]
  );

  const userLeaves = useMemo(() => 
    leaves.filter(leave => leave.userId === user?.id), 
    [leaves, user?.id]
  );

  const upcomingHolidays = useMemo(() => {
    const today = new Date();
    return holidays
      .filter(holiday => new Date(holiday.date) >= today)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5);
  }, [holidays]);

  // Mevcut ay maaşı hesapla
  const currentMonthSalary = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    return userSalaries.find(salary => 
      salary.month === getMonthNumber(currentMonth) && salary.year === currentYear
    );
  }, [userSalaries, getMonthNumber]);

  // Mevcut ay maaşı hesapla
  const calculateCurrentMonthSalary = useCallback(() => {
    if (currentMonthSalary) {
      return currentMonthSalary.netSalary;
    }
    return 0;
  }, [currentMonthSalary]);

  // Tahmini maaş hesaplama
  const calculateEstimatedSalary = useCallback(() => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    // Bu ay için girilen fazla mesailer
    const currentMonthOvertimes = userOvertimes.filter(overtime => {
      const overtimeDate = new Date(overtime.date);
      return overtimeDate.getMonth() === currentMonth && overtimeDate.getFullYear() === currentYear;
    });
    
    // Eğer bu ay için mesai yoksa, son 30 günlük mesaileri göster
    const last30DaysOvertimes = userOvertimes.filter(overtime => {
      const overtimeDate = new Date(overtime.date);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return overtimeDate >= thirtyDaysAgo;
    });
    
    // Bu ay için mesai yoksa son 30 günlük mesaileri kullan
    const effectiveOvertimes = currentMonthOvertimes.length > 0 ? currentMonthOvertimes : last30DaysOvertimes;
    const totalOvertimePay = effectiveOvertimes.reduce((sum, overtime) => sum + overtime.totalPayment, 0);
    
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
    const baseSalary = parseFloat(settings.salary.defaultNetSalary) || 0;
    
    // 2. ÜCRETSİZ İZİN KESİNTİSİ: Raporlar kısmındaki mantık (30 gün üzerinden)
    const dailySalary = baseSalary / 30; // Günlük maaş (30 gün üzerinden)
    const unpaidLeaveDeduction = unpaidLeaveDays * dailySalary;
    
    // 3. BES KATKISI: Settings'ten
    const besContribution = parseFloat(settings.salary.besContribution) || 0;
    
    // 4. BRÜT MAAŞ: Net maaştan brüte çevirme
    const netSalary = baseSalary - unpaidLeaveDeduction + totalOvertimePay;
    
    // Brüt maaş hesaplama (doğru formül)
    const grossSalary = calculateGrossSalary(netSalary, besContribution);
    
    return {
      baseSalary: baseSalary, // Settings'teki varsayılan net maaş
      overtimePay: totalOvertimePay,
      besContribution,
      grossSalary,
      netSalary,
      overtimeHours: effectiveOvertimes.reduce((sum, overtime) => sum + overtime.hours, 0),
      unpaidLeaveDays,
      unpaidLeaveDeduction,
      usingLast30Days: currentMonthOvertimes.length === 0 && last30DaysOvertimes.length > 0
    };
  }, [userOvertimes, userLeaves, settings.salary.defaultNetSalary, settings.salary.besContribution]);

  // Yıllık izin hakkı hesapla
  const getAnnualLeaveEntitlement = useCallback(() => {
    if (!user?.startDate) return 0;
    const start = new Date(user.startDate);
    const now = new Date();
    const years = now.getFullYear() - start.getFullYear();
    if (years < 1) return 0;
    
    // Settings'ten alınan yıllık izin hakkı
    const annualLeaveDays = parseInt(settings.salary.annualLeaveEntitlement) || 0;
    return years * annualLeaveDays;
  }, [user?.startDate, settings.salary.annualLeaveEntitlement]);

  // Mevcut ay karşılaştırması
  const getCurrentMonthComparison = useCallback(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    
    const lastMonthSalary = userSalaries.find(salary => 
      salary.month === getMonthNumber(lastMonth) && salary.year === lastMonthYear
    );
    
    if (currentMonthSalary && lastMonthSalary) {
      const difference = currentMonthSalary.netSalary - lastMonthSalary.netSalary;
      const percentage = (difference / lastMonthSalary.netSalary) * 100;
      return { difference, percentage };
    }
    
    return { difference: 0, percentage: 0 };
  }, [userSalaries, currentMonthSalary, getMonthNumber]);

  // Yıllık karşılaştırma
  const getYearlyComparison = useCallback(() => {
    const currentYear = new Date().getFullYear();
    const lastYear = currentYear - 1;
    
    const currentYearSalaries = userSalaries.filter(salary => salary.year === currentYear);
    const lastYearSalaries = userSalaries.filter(salary => salary.year === lastYear);
    
    const currentYearTotal = currentYearSalaries.reduce((sum, salary) => sum + salary.netSalary, 0);
    const lastYearTotal = lastYearSalaries.reduce((sum, salary) => sum + salary.netSalary, 0);
    
    if (lastYearTotal > 0) {
      const difference = currentYearTotal - lastYearTotal;
      const percentage = (difference / lastYearTotal) * 100;
      return { difference, percentage };
    }
    
    return { difference: 0, percentage: 0 };
  }, [userSalaries]);

  // Refresh handler
  const handleRefresh = useCallback(() => {
    clearErrors();
    refreshData();
  }, [clearErrors, refreshData]);

  // Debug logging
  useEffect(() => {
    console.log('Dashboard data updated:', {
      salaries: salaries.length,
      overtimes: overtimes.length,
      leaves: leaves.length,
      userId: user?.id
    });
  }, [salaries, overtimes, leaves, user?.id]);

  useEffect(() => {
    console.log('User Salaries:', userSalaries.length);
    console.log('User Overtimes:', userOvertimes.length);
    console.log('User Leaves:', userLeaves.length);
  }, [userSalaries, userOvertimes, userLeaves]);

  // Loading durumu
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Veriler yükleniyor..." />
      </div>
    );
  }

  // Error durumu
  if (hasErrors) {
    const errors = Object.entries(loadingStates)
      .filter(([_, state]) => state.error)
      .map(([key, state]) => ({ key, error: state.error }));

    return (
      <div className="p-6">
        <div className="mb-6">
          <NetworkStatus className="mb-4" />
          <ErrorDisplay
            error="Veri yüklenirken hatalar oluştu"
            variant="banner"
            onRetry={handleRefresh}
          />
        </div>
        
        {errors.map(({ key, error }) => (
          <ErrorDisplay
            key={key}
            error={error}
            className="mb-4"
            onRetry={handleRefresh}
          />
        ))}
      </div>
    );
  }

  const currentMonthComparison = getCurrentMonthComparison();
  const yearlyComparison = getYearlyComparison();
  const estimatedSalary = calculateEstimatedSalary();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Hoş geldin, {user?.name || 'Kullanıcı'}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <NetworkStatus />
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Yenile
          </button>
        </div>
      </div>

      {/* Maaş Ayarları Bildirimi */}
      {showSalarySetupPrompt && (
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl shadow-sm p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-white/20 rounded-full p-3 mr-4">
                <Calculator className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Maaş Ayarlarınızı Tamamlayın</h3>
                <p className="text-yellow-100">Doğru hesaplamalar için lütfen maaş bilgilerinizi girin</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => window.location.hash = '#settings'}
                className="px-4 py-2 bg-white text-orange-600 rounded-lg hover:bg-yellow-50 transition-colors font-medium"
              >
                Maaş Ayarları
              </button>
              <button
                onClick={dismissSalarySetupPrompt}
                className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
              >
                Daha Sonra
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bu Ay Tahmini Maaş */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 rounded-xl shadow-sm p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Calculator className="h-8 w-8 text-blue-200 mr-3" />
            <div>
              <h3 className="text-xl font-semibold">Bu Ay Tahmini Maaş</h3>
              <p className="text-blue-100">Güncel ay için tahmini geliriniz</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">{formatCurrency(estimatedSalary.netSalary)}</p>
            <p className="text-blue-200 text-sm">Net Maaş</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-6">
          <div className="bg-blue-500/20 rounded-lg p-4">
            <p className="text-blue-200 text-sm">Taban Maaş</p>
            <p className="text-xl font-semibold">{formatCurrency(estimatedSalary.baseSalary)}</p>
          </div>
          <div className="bg-green-500/20 rounded-lg p-4">
            <p className="text-green-200 text-sm">Fazla Mesai</p>
            <p className="text-xl font-semibold">{formatCurrency(estimatedSalary.overtimePay)}</p>
            <p className="text-green-200 text-xs">{estimatedSalary.overtimeHours} saat</p>
            {estimatedSalary.usingLast30Days && (
              <p className="text-green-200 text-xs italic">(Son 30 gün)</p>
            )}
          </div>
          {estimatedSalary.unpaidLeaveDays > 0 && (
            <div className="bg-red-500/20 rounded-lg p-4">
              <p className="text-red-200 text-sm">Ücretsiz İzin</p>
              <p className="text-xl font-semibold">-{formatCurrency(estimatedSalary.unpaidLeaveDeduction)}</p>
              <p className="text-red-200 text-xs">{estimatedSalary.unpaidLeaveDays} gün</p>
            </div>
          )}
          <div className="bg-purple-500/20 rounded-lg p-4">
            <p className="text-purple-200 text-sm">BES Katkısı</p>
            <p className="text-xl font-semibold">{formatCurrency(estimatedSalary.besContribution)}</p>
          </div>
          <div className="bg-orange-500/20 rounded-lg p-4">
            <p className="text-orange-200 text-sm">Brüt Maaş</p>
            <p className="text-xl font-semibold">{formatCurrency(estimatedSalary.grossSalary)}</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Mevcut Ay Maaşı"
          value={`₺${calculateCurrentMonthSalary().toLocaleString()}`}
          icon={DollarSign}
          change={currentMonthComparison.percentage}
          changeLabel="Geçen aya göre"
          color="green"
        />
        
        <StatsCard
          title="Toplam Mesai"
          value={`${userOvertimes.reduce((sum, ot) => sum + ot.hours, 0)} saat`}
          icon={Clock}
          change={0}
          changeLabel="Bu ay"
          color="blue"
        />
        
        <StatsCard
          title="Kullanılan İzin"
          value={`${userLeaves.reduce((sum, leave) => sum + leave.daysUsed, 0)} gün`}
          icon={Calendar}
          change={0}
          changeLabel="Bu yıl"
          color="purple"
        />
        
        <StatsCard
          title="Yıllık Toplam"
          value={`₺${userSalaries.reduce((sum, salary) => sum + salary.netSalary, 0).toLocaleString()}`}
          icon={TrendingUp}
          change={yearlyComparison.percentage}
          changeLabel="Geçen yıla göre"
          color="orange"
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Maaş Geçmişi */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Coins className="h-5 w-5" />
              Maaş Geçmişi
            </h2>
          </div>
          
          {userSalaries.length > 0 ? (
            <div className="space-y-3">
              {userSalaries.slice(-5).reverse().map((salary) => (
                <div key={salary.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {salary.month}/{salary.year}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Brüt: ₺{(salary.grossSalary || 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">
                      ₺{(salary.netSalary || 0).toLocaleString()}
                    </p>
                    {(salary.bonus || 0) > 0 && (
                      <p className="text-sm text-blue-600">
                        +₺{(salary.bonus || 0).toLocaleString()} ikramiye
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Coins}
              title="Maaş Verisi Yok"
              description="Henüz maaş bilgisi girilmemiş."
              action={{
                label: "Maaş Ekle",
                onClick: () => window.location.hash = '#salary',
                variant: "primary"
              }}
            />
          )}
        </div>

        {/* Mesai Özeti */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Mesai Özeti
            </h2>
          </div>
          
          {userOvertimes.length > 0 ? (
            <div className="space-y-3">
              {userOvertimes.slice(-5).reverse().map((overtime) => (
                <div key={overtime.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {new Date(overtime.date).toLocaleDateString('tr-TR')}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {overtime.description || 'Mesai'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-blue-600">
                      {overtime.hours} saat
                    </p>
                    <p className="text-sm text-green-600">
                      ₺{((overtime.hours || 0) * (overtime.hourlyRate || 0)).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Clock}
              title="Mesai Verisi Yok"
              description="Henüz mesai kaydı girilmemiş."
              action={{
                label: "Mesai Ekle",
                onClick: () => window.location.hash = '#overtime',
                variant: "primary"
              }}
            />
          )}
        </div>

        {/* İzin Durumu */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              İzin Durumu
            </h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div>
                <p className="font-medium text-blue-900 dark:text-blue-100">Yıllık İzin Hakkı</p>
                <p className="text-sm text-blue-700 dark:text-blue-200">Toplam izin günü</p>
              </div>
              <span className="text-2xl font-bold text-blue-600">{getAnnualLeaveEntitlement()} gün</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div>
                <p className="font-medium text-green-900 dark:text-green-100">Kullanılan İzin</p>
                <p className="text-sm text-green-700 dark:text-green-200">Bu yıl</p>
              </div>
              <span className="text-2xl font-bold text-green-600">
                {userLeaves.reduce((sum, leave) => sum + leave.daysUsed, 0)} gün
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div>
                <p className="font-medium text-purple-900 dark:text-purple-100">Kalan İzin</p>
                <p className="text-sm text-purple-700 dark:text-purple-200">Kullanılabilir</p>
              </div>
              <span className="text-2xl font-bold text-purple-600">
                {getAnnualLeaveEntitlement() - userLeaves.reduce((sum, leave) => sum + leave.daysUsed, 0)} gün
              </span>
            </div>
          </div>
        </div>

        {/* Yaklaşan Tatiller */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Yaklaşan Tatiller
            </h2>
          </div>
          
          {upcomingHolidays.length > 0 ? (
            <div className="space-y-3">
              {upcomingHolidays.map((holiday) => (
                <div key={holiday.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {holiday.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(holiday.date).toLocaleDateString('tr-TR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {Math.ceil((new Date(holiday.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} gün kaldı
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Yaklaşan tatil bulunmuyor</p>
            </div>
          )}
        </div>


      </div>
    </div>
  );
};

export default Dashboard;