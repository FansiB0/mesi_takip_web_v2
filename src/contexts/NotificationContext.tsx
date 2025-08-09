import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useSettings } from './SettingsContext';
import { useData } from './DataContext';

export interface Notification {
  id: string;
  type: 'holiday' | 'leave' | 'salary' | 'overtime' | 'birthday' | 'anniversary' | 'system';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  isRead: boolean;
  createdAt: Date;
  actionUrl?: string;
  data?: any;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user } = useAuth();
  const { settings } = useSettings();
  const { salaries, overtimes, leaves } = useData();

  // Türkiye tatilleri (2025)
  const turkishHolidays = [
    { date: '2025-01-01', name: 'Yılbaşı' },
    { date: '2025-04-23', name: 'Ulusal Egemenlik ve Çocuk Bayramı' },
    { date: '2025-05-01', name: 'İşçi Bayramı' },
    { date: '2025-05-19', name: 'Atatürk\'ü Anma, Gençlik ve Spor Bayramı' },
    { date: '2025-08-30', name: 'Zafer Bayramı' },
    { date: '2025-10-29', name: 'Cumhuriyet Bayramı' },
    // Dini tatiller (yaklaşık tarihler)
    { date: '2025-03-30', name: 'Ramazan Bayramı 1. Gün' },
    { date: '2025-03-31', name: 'Ramazan Bayramı 2. Gün' },
    { date: '2025-04-01', name: 'Ramazan Bayramı 3. Gün' },
    { date: '2025-06-06', name: 'Kurban Bayramı 1. Gün' },
    { date: '2025-06-07', name: 'Kurban Bayramı 2. Gün' },
    { date: '2025-06-08', name: 'Kurban Bayramı 3. Gün' },
    { date: '2025-06-09', name: 'Kurban Bayramı 4. Gün' }
  ];

  // Bildirim oluşturma fonksiyonu
  const addNotification = (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      isRead: false
    };

    setNotifications(prev => [newNotification, ...prev]);
  };

  // Okundu olarak işaretleme
  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, isRead: true } : notification
      )
    );
  };

  // Tümünü okundu olarak işaretleme
  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  // Bildirimi kaldırma
  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  // Yaklaşan tatilleri kontrol et
  useEffect(() => {
    if (!settings.notifications.holidayReminder) return;

    const checkUpcomingHolidays = () => {
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);

      turkishHolidays.forEach(holiday => {
        const holidayDate = new Date(holiday.date);
        
        if (holidayDate >= today && holidayDate <= nextWeek) {
          const daysUntil = Math.ceil((holidayDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          
          // Bu tatil için zaten bildirim var mı kontrol et
          const existingNotification = notifications.find(n => 
            n.type === 'holiday' && 
            n.data?.holidayDate === holiday.date
          );

          if (!existingNotification) {
            addNotification({
              type: 'holiday',
              title: 'Yaklaşan Tatil',
              message: `${holiday.name} ${daysUntil} gün sonra (${holidayDate.toLocaleDateString('tr-TR')})`,
              priority: daysUntil <= 3 ? 'high' : 'medium',
              data: { holidayDate: holiday.date, holidayName: holiday.name }
            });
          }
        }
      });
    };

    checkUpcomingHolidays();
    const interval = setInterval(checkUpcomingHolidays, 24 * 60 * 60 * 1000); // Her gün kontrol et

    return () => clearInterval(interval);
  }, [settings.notifications.holidayReminder, notifications]);

  // Maaş hatırlatması kontrol et
  useEffect(() => {
    if (!settings.notifications.salaryReminder || !user) return;

    const checkSalaryReminder = () => {
      const today = new Date();
      const currentMonth = today.getMonth() + 1;
      const currentYear = today.getFullYear();

      // Bu ay için maaş kaydı var mı kontrol et
      const currentMonthSalary = salaries.find(s => 
        s.month === currentMonth && s.year === currentYear
      );

      // Ayın son haftasında maaş kaydı yoksa hatırlatma gönder
      const isLastWeekOfMonth = today.getDate() > 22;
      
      if (isLastWeekOfMonth && !currentMonthSalary) {
        const existingReminder = notifications.find(n => 
          n.type === 'salary' && 
          n.data?.month === currentMonth && 
          n.data?.year === currentYear
        );

        if (!existingReminder) {
          addNotification({
            type: 'salary',
            title: 'Maaş Kaydı Hatırlatması',
            message: `${today.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })} ayı için maaş kaydınızı henüz eklemediniz.`,
            priority: 'medium',
            actionUrl: '#salary',
            data: { month: currentMonth, year: currentYear }
          });
        }
      }
    };

    checkSalaryReminder();
    const interval = setInterval(checkSalaryReminder, 24 * 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [settings.notifications.salaryReminder, salaries, user, notifications]);

  // İzin durumu bildirimleri
  useEffect(() => {
    if (!settings.notifications.leaveStatus || !user) return;

    const checkLeaveStatus = () => {
      const today = new Date();
      const totalAnnualLeave = parseInt(settings.salary.annualLeaveEntitlement) || 24;
      
      // Bu yıl kullanılan toplam izin
      const currentYear = today.getFullYear();
      const usedLeaves = leaves.filter(l => 
        new Date(l.startDate).getFullYear() === currentYear && 
        l.type === 'annual'
      );
      
      const totalUsedDays = usedLeaves.reduce((total, leave) => total + (leave.daysUsed || 1), 0);
      const remainingDays = totalAnnualLeave - totalUsedDays;

      // İzin hakları azalıyorsa uyar
      if (remainingDays <= 5 && remainingDays > 0) {
        const existingWarning = notifications.find(n => 
          n.type === 'leave' && 
          n.data?.type === 'low_balance' && 
          n.data?.year === currentYear
        );

        if (!existingWarning) {
          addNotification({
            type: 'leave',
            title: 'İzin Hakkı Uyarısı',
            message: `Bu yıl sadece ${remainingDays} gün izin hakkınız kaldı.`,
            priority: remainingDays <= 2 ? 'high' : 'medium',
            actionUrl: '#leaves',
            data: { type: 'low_balance', year: currentYear, remaining: remainingDays }
          });
        }
      }
    };

    checkLeaveStatus();
    const interval = setInterval(checkLeaveStatus, 24 * 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [settings.notifications.leaveStatus, leaves, settings.salary.annualLeaveEntitlement, user, notifications]);

  // Doğum günü hatırlatmaları
  useEffect(() => {
    if (!settings.notifications.birthdayReminders || !user) return;

    const checkBirthdays = () => {
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);

      // Örnek çalışan doğum günleri (gerçek projede API'den gelecek)
      const employees = [
        { name: 'Ahmet Kaya', birthday: '1990-08-15' },
        { name: 'Fatma Demir', birthday: '1985-08-20' },
        { name: 'Mehmet Öz', birthday: '1992-08-25' }
      ];

      employees.forEach(employee => {
        const birthday = new Date(employee.birthday);
        const thisYearBirthday = new Date(today.getFullYear(), birthday.getMonth(), birthday.getDate());
        
        if (thisYearBirthday >= today && thisYearBirthday <= nextWeek) {
          const daysUntil = Math.ceil((thisYearBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          
          const existingNotification = notifications.find(n => 
            n.type === 'birthday' && 
            n.data?.employeeName === employee.name &&
            n.data?.year === today.getFullYear()
          );

          if (!existingNotification) {
            addNotification({
              type: 'birthday',
              title: 'Doğum Günü Hatırlatması',
              message: `${employee.name}'ın doğum günü ${daysUntil === 0 ? 'bugün' : `${daysUntil} gün sonra`}`,
              priority: daysUntil <= 1 ? 'high' : 'medium',
              data: { employeeName: employee.name, year: today.getFullYear() }
            });
          }
        }
      });
    };

    checkBirthdays();
    const interval = setInterval(checkBirthdays, 24 * 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [settings.notifications.birthdayReminders, user, notifications]);

  // İş yıldönümü kontrolleri
  useEffect(() => {
    if (!settings.notifications.workAnniversary || !user) return;

    const checkWorkAnniversary = () => {
      if (!user.startDate) return;

      const today = new Date();
      const startDate = new Date(user.startDate);
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);

      // Bu yılki iş yıldönümü tarihi
      const thisYearAnniversary = new Date(today.getFullYear(), startDate.getMonth(), startDate.getDate());
      
      if (thisYearAnniversary >= today && thisYearAnniversary <= nextWeek) {
        const daysUntil = Math.ceil((thisYearAnniversary.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        const yearsWorked = today.getFullYear() - startDate.getFullYear();
        
        const existingNotification = notifications.find(n => 
          n.type === 'anniversary' && 
          n.data?.year === today.getFullYear()
        );

        if (!existingNotification && yearsWorked > 0) {
          addNotification({
            type: 'anniversary',
            title: 'İş Yıldönümü',
            message: `İş yıldönümünüz ${daysUntil === 0 ? 'bugün' : `${daysUntil} gün sonra`}! ${yearsWorked}. yılınızı kutluyoruz 🎉`,
            priority: daysUntil <= 1 ? 'high' : 'medium',
            data: { year: today.getFullYear(), yearsWorked }
          });
        }
      }
    };

    checkWorkAnniversary();
    const interval = setInterval(checkWorkAnniversary, 24 * 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [settings.notifications.workAnniversary, user, notifications]);

  // localStorage'dan bildirimleri yükle
  useEffect(() => {
    const saved = localStorage.getItem(`notifications_${user?.id}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const validNotifications = parsed.map((n: any) => ({
          ...n,
          createdAt: new Date(n.createdAt)
        }));
        setNotifications(validNotifications);
      } catch (error) {
        console.error('Bildirimler yüklenirken hata:', error);
      }
    }
  }, [user?.id]);

  // localStorage'a bildirimleri kaydet
  useEffect(() => {
    if (user?.id) {
      localStorage.setItem(`notifications_${user.id}`, JSON.stringify(notifications));
    }
  }, [notifications, user?.id]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    addNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
